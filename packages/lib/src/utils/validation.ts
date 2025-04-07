import { Color, Quat, Vec2, Vec3, Vec4, Mat4, Application, NullGraphicsDevice, Material } from "playcanvas";

// Limit the size of the warned set to prevent memory leaks
const MAX_WARNED_SIZE = 1000;
const warned = new Set<string>();

export const warnOnce = (message: string) => {
    if (!warned.has(message)) {
        if (process.env.NODE_ENV === 'development') {
            
            // Use setTimeout to break the call stack
            setTimeout(() => {
                // Apply styling to make the warning stand out
                console.warn(
                    '%c[PlayCanvas React]:',
                    'color: #ff9800; font-weight: bold; font-size: 12px;',
                    message
                );
            }, 0);
        } else {
            // Error in production for critical issues
            console.error(
                `[PlayCanvas React]:\n\n` +
                `${message}`
            );
        }
        warned.add(message);
        
        // Prevent the warned set from growing too large
        if (warned.size > MAX_WARNED_SIZE) {
            // Remove oldest entries when the set gets too large
            const entriesToRemove = Array.from(warned).slice(0, warned.size - MAX_WARNED_SIZE);
            entriesToRemove.forEach(entry => warned.delete(entry));
        }
    }
};

export type PropValidator<T> = {
    validate: (value: unknown) => boolean;
    errorMsg: (value: unknown) => string;
    default: T | unknown;
}

// A more generic schema type that works with both functions
export type Schema<T> = {
    [K in keyof T]?: PropValidator<T[K]>;
};

export type ComponentDefinition<T> = {
    name: string;
    apiName?: string;
    schema: Schema<T>;
};

export function validateAndSanitize<T>(
    value: unknown, 
    propDef: PropValidator<T>,
    propName: string,
    componentName: string,
    apiName?: string
): T {
    const isValid = value !== undefined && propDef.validate(value);
    
    if (!isValid && value !== undefined && process.env.NODE_ENV !== 'production') {
        warnOnce(
            `Invalid prop "${propName}" in \`<${componentName} ${propName}={${JSON.stringify(value)}} />\`\n` +
            `  ${propDef.errorMsg(value)}\n` +
            (propDef.default !== undefined ? `  Using default: ${JSON.stringify(propDef.default)}` : '') +
            `\n\nPlease see the documentation https://api.playcanvas.com/engine/classes/${apiName ?? componentName}.html.`
        );
    }
    
    return isValid ? (value as T) : propDef.default as T;
}

export function validateAndSanitizeProps<T extends object>(
    rawProps: Partial<T>, 
    componentDef: ComponentDefinition<T>,
    warnUnknownProps: boolean = true
): T {
    // Start with a copy of the raw props
    const { schema, name, apiName } = componentDef;
    const result = { ...rawProps } as T;
    
    // Track unknown props for warning
    const unknownProps: string[] = [];
    
    // Process each prop once
    Object.keys(rawProps).forEach((key) => {
        // Skip 'children' as it's a special React prop
        if (key === 'children') return;
        
        // Check if this prop is in the schema
        if (key in schema) {
            // Validate and sanitize props that are in the schema
            const propDef = schema[key as keyof T];
            if (propDef) {
                result[key as keyof T] = validateAndSanitize(
                    rawProps[key as keyof T], 
                    propDef, 
                    key, 
                    name,
                    apiName
                );
            }
        } else {
            // Collect unknown props for warning
            unknownProps.push(key);
        }
    });
    
    // Warn about unknown props in development mode
    if (process.env.NODE_ENV !== 'production' && warnUnknownProps && unknownProps.length > 0) {
        warnOnce(
            `Unknown props in "<${name}/>."\n` +
            `The following props are invalid and will be ignored: "${unknownProps.join('", "')}"\n\n` +
            `Please see the documentation https://api.playcanvas.com/engine/classes/${apiName ?? name}.html.`
        );
    }
    
    return result;
}


export function getPseudoPublicProps(container: Record<string, unknown>) {
    // Get regular enumerable properties
    const entries = Object.entries(container)
        .filter(([key]) => !key.startsWith('_') && typeof container[key] !== 'function');
    
    // Get getters and setters from the prototype
    const prototype = Object.getPrototypeOf(container);
    if (prototype && prototype !== Object.prototype) {
        const descriptors = Object.getOwnPropertyDescriptors(prototype);
        const getterSetterEntries = Object.entries(descriptors)
            .filter(([key, descriptor]) => {
                // Include properties that have setters (and optionally getters) and don't start with _
                return (descriptor.get && descriptor.set) && 
                       !key.startsWith('_') && 
                       key !== 'constructor';
            })
            .map(([key, descriptor]) => {
                // For properties with both getter and setter, try to get the value if possible
                if (descriptor.get) {
                    try {
                        const value = descriptor.get.call(container);
                        // Create a shallow copy of the value to avoid reference issues
                        const safeValue = value !== null && typeof value === 'object' 
                            ? value.clone ? value.clone() : { ...value } 
                            : value;
                        return [key, safeValue];
                    } catch {
                        // If we can't get the value, just use the key
                        return [key, undefined];
                    }
                }
                // For setters only, we can't get the value
                return [key, undefined];
            });
        
        // Combine regular properties with getter/setter properties
        return Object.fromEntries([...entries, ...getterSetterEntries]);
    }
    
    // If no prototype or it's just Object.prototype, just return the regular properties
    return Object.fromEntries(entries);
}

export function createComponentDefinition<T extends object>(
    name: string,
    createInstance: () => T,
    cleanup?: (instance: T) => void,
    apiName?: string,
): ComponentDefinition<T> {
    const instance: T = createInstance();
    const schema: Schema<T> = {};

    const props = getPseudoPublicProps(instance as Record<string, unknown>);

    const entries = Object.entries(props) as [keyof T, unknown][];
    // Basic type detection 
    entries.forEach(([key, value]) => {
        
        // Colors
        if (value instanceof Color) {
            schema[key as keyof T] = {
                validate: (val) => val instanceof Color || typeof val === 'string',
                default: (value as Color).toString(true),
                errorMsg: (val: unknown) => `Invalid value for prop "${String(key)}": "${val}". ` +
                    `Expected a hex like "#FF0000" or CSS color name like "red").`
            };
        }
        // Vec2
        else if (value instanceof Vec2) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && val.length === 2,
                default: [value.x, value.y],
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 2 numbers.`
            };
        }
        // Vec3
        else if (value instanceof Vec3) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && val.length === 3,
                default: [value.x, value.y, value.z],
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 3 numbers.`
            };
        }
        // Vec4
        else if (value instanceof Vec4) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && val.length === 4,
                default: [value.x, value.y, value.z, value.w],
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 4 numbers.`
            };
        }
        // Quaternions
        else if (value instanceof Quat) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && val.length === 4,
                default: [value.x, value.y, value.z, value.w],
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 4 numbers.`
            };
        }
        // Mat4
        else if (value instanceof Mat4) {
            schema[key] = {
                validate: (val) => val instanceof Mat4 || (Array.isArray(val) && val.length === 16),
                default: (value as Mat4).toString(),
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 16 numbers.`
            };
        }
        // Numbers
        else if (typeof value === 'number') {
            schema[key] = {
                validate: (val) => typeof val === 'number',
                default: value,
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${val}". Expected a number.`
            };
        }
        // Strings
        else if (typeof value === 'string') {
            schema[key] = {
                validate: (val) => typeof val === 'string',
                default: value as string,
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${val}". Expected a string.`
            };
        }
        // Booleans
        else if (typeof value === 'boolean') {
            schema[key] = {
                validate: (val) => typeof val === 'boolean',
                default: value as boolean,
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${val}". Expected a boolean.`
            };
        }
        // Arrays
        else if (Array.isArray(value)) {
            schema[key] = {
                validate: (val) => Array.isArray(val),
                default: value,
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". Expected an array.`
            };
        }

        // Materials
        else if (value instanceof Material) {
            schema[key] = {
                validate: (val) => val instanceof Material,
                default: null,
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". Expected a Material.`
            };
        }
    });

    if (cleanup) cleanup(instance);

    const componentDef: ComponentDefinition<T> = {
        name,
        apiName,
        schema
    };

    return componentDef;
}

/**
 * This is a mock application that is used to render the application without a canvas.
 * @private
 * @returns A mock application that is used to render the application without a canvas.
 */
export function getNullApplication() {
    const mockCanvas = { id: 'pc-react-mock-canvas' };
    // @ts-expect-error - Mock canvas is not a real canvas
    return new Application(mockCanvas, { graphicsDevice: new NullGraphicsDevice(mockCanvas) });
}

const localApp = getNullApplication();
export const getStaticNullApplication = () => localApp;