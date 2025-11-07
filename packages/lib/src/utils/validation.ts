import { Color, Quat, Vec2, Vec3, Vec4, Mat4, Application, NullGraphicsDevice, Material } from "playcanvas";
import { getColorFromName } from "./color.ts";
import { Serializable } from "./types-utils.ts";
import { env } from "./env.ts";

// Limit the size of the warned set to prevent memory leaks
const MAX_WARNED_SIZE = 1000;
const warned = new Set<string>();

export const warnOnce = (message: string) => {
    if (!warned.has(message)) {
        if (env !== 'production') {
            
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

export type PropValidator<T, InstanceType> = {
    validate: (value: unknown) => boolean;
    errorMsg: (value: unknown) => string;
    default: T | unknown;
    apply?: (container: InstanceType, props: Record<string, unknown>, key: string) => void;
}

// A more generic schema type that works with both functions
export type Schema<T, InstanceType> = {
    [K in keyof T]?: PropValidator<T[K], InstanceType>;
};

export type ComponentDefinition<T, InstanceType> = {
    name: string;
    apiName?: string;
    schema: Schema<T, InstanceType>;
};

/**
 * Validate and sanitize a prop. This will validate the prop and return the default value if the prop is invalid.
 * 
 * @param value The value to validate.
 * @param propDef The prop definition.
 * @param propName The name of the prop.
 * @param componentName The name of the component.
 * @param apiName The API name of the component. eg `<Render/>`. Use for logging.
 */
export function validateAndSanitize<T, InstanceType>(
    value: unknown, 
    propDef: PropValidator<T, InstanceType>,
    propName: string,
    componentName: string,
    apiName?: string
): T {
    const isValid = value !== undefined && propDef.validate(value);
    
    if (!isValid && value !== undefined && env !== 'production') {
        warnOnce(
            `Invalid prop "${propName}" in \`<${componentName} ${propName}={${JSON.stringify(value)}} />\`\n` +
            `  ${propDef.errorMsg(value)}\n` +
            (propDef.default !== undefined ? `  Using default: ${JSON.stringify(propDef.default)}` : '') +
            `\n\n  See the docs https://api.playcanvas.com/engine/classes/${apiName ?? componentName}.html.`
        );
    }
    
    return isValid ? (value as T) : propDef.default as T;
}

/**
 * Validate props partially. This iterates over props and validates them against the schema. 
 * If a prop is not in the schema, it will raise a warning but not applied.
 * This will not return default values for missing props.
 * 
 * @param rawProps The raw props to validate.
 * @param componentDef The component definition.
 * @param warnUnknownProps Whether to warn about unknown props.
 * @returns The validated props.
 */
export function validatePropsPartial<T, InstanceType>(
    rawProps: Serializable<T>, 
    componentDef: ComponentDefinition<T, InstanceType>,
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
    if (env !== 'production' && warnUnknownProps && unknownProps.length > 0) {
        warnOnce(
            `Unknown props in "<${name}/>."\n` +
            `The following props are invalid and will be ignored: "${unknownProps.join('", "')}"\n\n` +
            `Please see the documentation https://api.playcanvas.com/engine/classes/${apiName ?? name}.html.`
        );
    }
    
    return result;
}

/**
 * Validate props returning defaults. This iterates over a schema and uses the default value if the prop is not defined.
 * 
 * @param rawProps The raw props to validate.
 * @param componentDef The component definition.
 * @param warnUnknownProps Whether to warn about unknown props.
 * @returns The validated props.
 */
export function validatePropsWithDefaults<T extends object, InstanceType>(
    rawProps: Serializable<T>,
    componentDef: ComponentDefinition<T, InstanceType>,
    warnUnknownProps: boolean = true
  ): T {
    const { schema, name, apiName } = componentDef;
  
    // Start with an empty object (so we can control all keys)
    const result = {} as T;
  
    // Track unknown props for warning
    const unknownProps: string[] = [];
  
    // Iterate over the schema keys — these are the "valid" props
    for (const key in schema) {
      const propDef = schema[key as keyof T] as PropValidator<T[keyof T], InstanceType>;
      const rawValue = rawProps[key as keyof T];
  
      // Use raw value if defined, otherwise fall back to default
      const valueToValidate =
        rawValue !== undefined ? rawValue : propDef?.default;
  
      result[key as keyof T] = validateAndSanitize(
        valueToValidate,
        propDef,
        key,
        name,
        apiName
      );
    }
  
    // Optionally warn about unknown props
    if (
      env !== 'production' &&
      warnUnknownProps &&
      rawProps
    ) {
      for (const key in rawProps) {
        if (key === 'children') continue;
        if (!(key in schema)) {
          unknownProps.push(key);
        }
      }
  
      if (unknownProps.length > 0) {
        warnOnce(
          `Unknown props in "<${name}/>."\n` +
            `The following props are invalid and will be ignored: "${unknownProps.join('", "')}"\n\n` +
            `Please see the documentation https://api.playcanvas.com/engine/classes/${
              apiName ?? name
            }.html.`
        );
      }
    }
  
    return result;
}

/**
 * Apply props to an instance in a safe way. It will use the apply function if it exists, otherwise it will assign the value directly.
 * This is useful for components that need to map props to instance properties. eg [0, 1] => Vec2(0, 1).
 * 
 * @param container The container to apply the props to
 * @param schema The schema of the container
 * @param props The props to apply
 */
export function applyProps<T extends Record<string, unknown>, InstanceType>(
    instance: InstanceType, 
    schema: Schema<T, InstanceType>, 
    props: T
) {
    Object.entries(props as Record<keyof T, unknown>).forEach(([key, value]) => {
        if (key in schema) {
            const propDef = schema[key as keyof T] as PropValidator<T[keyof T], InstanceType>;
            if (propDef) {
                if (propDef.apply) {
                    // Use type assertion to satisfy the type checker
                    propDef.apply(instance, props, key as string);
                } else {
                    try {
                        (instance as Record<string, unknown>)[key] = value;
                    } catch (error) {
                        console.error(`Error applying prop ${key}: ${error}`);
                    }
                }
            }
        }   
    });
}


/**
 * Property information including whether it's defined with a setter.
 */
export type PropertyInfo = {
    value: unknown;
    isDefinedWithSetter: boolean;
};

/**
 * Get the pseudo public props of an instance with setter information. This is useful for creating a component definition from an instance.
 * @param container The container to get the pseudo public props from.
 * @returns The pseudo public props of the container with setter flags.
 */
export function getPseudoPublicProps(container: Record<string, unknown>): Record<string, PropertyInfo> {
    const result: Record<string, PropertyInfo> = {};
    
    // Get regular enumerable properties
    const entries = Object.entries(container)
        .filter(([key]) => !key.startsWith('_') && typeof container[key] !== 'function');
    
    // Add regular properties (not defined with setters)
    entries.forEach(([key, value]) => {
        result[key] = {
            value,
            isDefinedWithSetter: false
        };
    });
    
    // Get getters and setters from the prototype
    const prototype = Object.getPrototypeOf(container);
    if (prototype && prototype !== Object.prototype) {
        const descriptors = Object.getOwnPropertyDescriptors(prototype);
        
        Object.entries(descriptors).forEach(([key, descriptor]) => {
            // Skip private properties and constructor
            if (key.startsWith('_') || key === 'constructor') return;

            const hasGetter = typeof descriptor.get === 'function';
            const hasSetter = typeof descriptor.set === 'function';
  
            if (hasSetter && !hasGetter) return;   

            // If it's a getter/setter property, try to get the value
            if (descriptor.get) {
                const originalWarn = console.warn;
                try {
                    // Temporarily silence the console
                    console.warn = () => {}; 

                    const value = descriptor.get.call(container);
                    // Create a shallow copy of the value to avoid reference issues
                    const safeValue = value !== null && typeof value === 'object' 
                        ? value.clone ? value.clone() : { ...value } 
                        : value;
                    
                    result[key] = {
                        value: safeValue,
                        isDefinedWithSetter: hasSetter
                    };
                } catch {
                    // If we can't get the value, just use undefined
                    result[key] = {
                        value: undefined,
                        isDefinedWithSetter: hasSetter
                    };
                }
                finally {
                    // Restore the console
                    console.warn = originalWarn;
                }
            } else if (hasSetter) {
                // Setter-only property
                result[key] = {
                    value: undefined,
                    isDefinedWithSetter: true
                };
            }
        });
    }
    
    return result;
}

/**
 * Check if a specific property is defined using a setter (like `set prop(){}`).
 * @param container The container to check.
 * @param propName The property name to check.
 * @returns True if the property is defined using a setter, false otherwise.
 */
export function isDefinedWithSetter(container: Record<string, unknown>, propName: string): boolean {
    const prototype = Object.getPrototypeOf(container);
    if (prototype && prototype !== Object.prototype) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, propName);
        return descriptor?.set !== undefined;
    }
    return false;
}

/**
 * Create a component definition from an instance. A component definition is a schema that describes the props of a component,
 * and can be used to validate and apply props to an instance.
 * 
 * @param name The name of the component.
 * @param createInstance A function that creates an instance of the component.
 * @param cleanup A function that cleans up the instance.
 * @param options The options for the component definition.
 * @param options.exclude The props to exclude from the component definition.
 * @param options.apiName The API name of the component.
 */
export function createComponentDefinition<T, InstanceType>(
    name: string,
    createInstance: () => InstanceType,
    cleanup?: (instance: InstanceType) => void,
    options?: {
        exclude?: string[];
        apiName?: string,
    },
): ComponentDefinition<T, InstanceType> {
    const { exclude = [], apiName = name } = options ?? {};
    const instance: InstanceType = createInstance();
    const schema: Schema<T, InstanceType> = {};
    const props = getPseudoPublicProps(instance as Record<string, unknown>);
    const entries = Object.entries(props) as [keyof T, PropertyInfo][];

    // Basic type detection 
    entries.forEach(([key, propertyInfo]) => {
        if(exclude.includes(String(key))) return;
        const { value, isDefinedWithSetter } = propertyInfo;
        
        // Colors
        if (value instanceof Color) {
            schema[key as keyof T] = {
                validate: (val) => (Array.isArray(val) && val.length === 3) || typeof val === 'string',
                default: (value as Color).toString(true),
                errorMsg: (val: unknown) => `Invalid value for prop "${String(key)}": "${val}". ` +
                    `Expected a hex like "#FF0000", CSS color name like "red", or an array "[1, 0, 0]").`,
                apply: (instance, props, key) => {
                    if(typeof props[key] === 'string') {
                        const colorString = getColorFromName(props[key] as string) || props[key] as string;
                        (instance[key as keyof InstanceType] as Color) = new Color().fromString(colorString);
                    } else {
                        (instance[key as keyof InstanceType] as Color) = (instance[key as keyof InstanceType] as Color) = new Color().fromArray(props[key] as number[]);
                    }
                }
            };
        }
        // Vec2
        else if (value instanceof Vec2) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && val.length === 2,
                default: [value.x, value.y],
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 2 numbers.`,
                apply: isDefinedWithSetter ? (instance, props, key) => {
                    (instance[key as keyof InstanceType] as Vec2) = new Vec2().fromArray(props[key] as number[]);
                } : (instance, props, key) => {
                    (instance[key as keyof InstanceType] as Vec2).set(...props[key] as [number, number]);
                }
            };
        }
        // Vec3
        else if (value instanceof Vec3) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && val.length === 3,
                default: [value.x, value.y, value.z],
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 3 numbers.`,
                apply: isDefinedWithSetter ? (instance, props, key) => {
                    (instance[key as keyof InstanceType] as Vec3) = new Vec3().fromArray(props[key] as number[]);
                } : (instance, props, key) => {
                    (instance[key as keyof InstanceType] as Vec3).set(...props[key] as [number, number, number]);
                }
            };
        }
        // Vec4
        else if (value instanceof Vec4) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && val.length === 4,
                default: [value.x, value.y, value.z, value.w],
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". Expected an array of 4 numbers.`,
                apply: isDefinedWithSetter ? (instance, props, key) => {
                    (instance[key as keyof InstanceType] as Vec4) = new Vec4().fromArray(props[key] as number[]);
                } : (instance, props, key) => {
                    (instance[key as keyof InstanceType] as Vec4).set(...props[key] as [number, number, number, number]);
                }
            };
        }

         // Quaternions
         else if (value instanceof Quat) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && (val.length === 4 || val.length === 3),
                default: [value.x, value.y, value.z, value.w],
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 4 numbers.`,
                apply: isDefinedWithSetter ? (instance, props, key) => {
                    (instance[key as keyof InstanceType] as Quat) = new Quat().fromArray(props[key] as number[]);
                } : (instance, props, key) => {
                    (instance[key as keyof InstanceType] as Quat).set(...props[key] as [number, number, number, number]);
                }
            };
        }
        // Mat4
        else if (value instanceof Mat4) {
            schema[key] = {
                validate: (val) => Array.isArray(val) && val.length === 16,
                default: Array.from((value.data)),
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". ` +
                    `Expected an array of 16 numbers.`,
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
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". Expected an array.`,
                apply: (instance, props, key) => {
                    // For arrays, use a different approach to avoid spread operator issues
                    const values = props[key] as unknown[];

                    // mutate the instance
                    if (Array.isArray(values)) {
                        const target = instance[key as keyof InstanceType] as unknown[];
                        target.length = 0;
                        target.push(...values);
                    }
                }
            };
        }

        // Materials
        else if (value instanceof Material) {
            schema[key] = {
                validate: (val) => val instanceof Material,
                default: value,
                errorMsg: (val) => `Invalid value for prop "${String(key)}": "${JSON.stringify(val)}". Expected a Material.`,
            };
        } 
        
        // Null
        else if(value === null) {
            schema[key] = {
                validate: () => true,
                default: value,
                errorMsg: () => '',
                apply: (instance, props, key) => {
                    (instance[key as keyof InstanceType] as unknown) = props[key];
                }
            };
        }
    });

    if (cleanup) cleanup(instance);

    const componentDef: ComponentDefinition<T, InstanceType> = {
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