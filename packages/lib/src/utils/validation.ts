import { Color, Quat, Vec2, Vec3, Vec4, Mat4 } from "playcanvas";

const warned = new Set<string>();

export const warnOnce = (message: string) => {
    if (!warned.has(message)) {
        if (process.env.NODE_ENV === 'development') {
            // Helpful warning in development
            console.warn(
                `[PlayCanvas React] Warning:\n` +
                `${message}`
            );
        } else {
            // Error in production for critical issues
            console.error(
                `[PlayCanvas React] Critical Error:\n` +
                `${message}`
            );
        }
        warned.add(message);
    }
};

export type PropSchemaDefinition<T> = {
    validate: (value: unknown) => boolean;
    errorMsg: (value: unknown) => string;
    default: T | unknown;
}

// A more generic schema type that works with both functions
export type Schema<T> = {
  [K in keyof T]?: PropSchemaDefinition<T[K]>;
};

export function validateAndSanitize<T>(
    value: unknown, 
    propDef: PropSchemaDefinition<T>,
    propName: string,
    componentName: string
): T {
    const isValid = value !== undefined && propDef.validate(value);
    
    if (!isValid && value !== undefined && process.env.NODE_ENV !== 'production') {
        console.warn(
            `[PlayCanvas React] Invalid prop "${propName}" in "<${componentName}/>":\n` +
            `  ${propDef.errorMsg(value)}\n` +
            `  Received: ${JSON.stringify(value)}\n` +
            (propDef.default !== undefined ? `  Using default: ${JSON.stringify(propDef.default)}` : '')
        );
    }
    
    return isValid ? (value as T) : propDef.default as T;
}

export function validateAndSanitizeProps<T extends object>(
    rawProps: Partial<T>, 
    schema: Schema<T>,
    componentName: string
): T {
    const result = {} as T;
    const keys = Object.keys(schema);
    keys.forEach((key) => {    
        const propDef = schema[key as keyof T];
        if (propDef) {
            result[key as keyof T] = validateAndSanitize(rawProps[key as keyof T], propDef, key, componentName);
        }
    });

    return result;
}


export function getPseudoPublicProps(container: Record<string, unknown>) {
    return Object.entries(container)
        .filter(([key]) => !key.startsWith('_') && typeof container[key] !== 'function')
}

export function createSchema<T extends object>(
    createInstance: () => T,
    cleanup?: (instance: T) => void
): Schema<T> {
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
    });

    if (cleanup) cleanup(instance);

    return schema;
}