const warned = new Set<string>();

export const warnOnce = (message: string, developmentOnly = false) => {
    if (!warned.has(message)) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(message);
        } else if (!developmentOnly) {
            // In production, use console.error for better visibility
            console.error(message);
        }
        warned.add(message);
    }
};

export type PropSchemaDefinition<T> = {
    validate: (value: unknown) => boolean;
    errorMsg: (value: unknown) => string;
    default: T;
}

export function validateAndSanitize<T>(
    value: unknown, 
    propDef: PropSchemaDefinition<T>
): T {
    const isValid = value !== undefined && propDef.validate(value);
    
    if (!isValid && value !== undefined && process.env.NODE_ENV !== 'production') {
        console.warn(propDef.errorMsg(value));
    }
    
    return isValid ? (value as T) : propDef.default;
}

export function validateAndSanitizeProps<T extends Record<string, unknown>>(
    rawProps: Partial<T>, 
    schema: {
        [K in keyof T]: PropSchemaDefinition<T[K]>;
    }
): T {
    const result = {} as T;
    const keys = Object.keys(schema) as Array<keyof T>;
    keys.forEach((key) => {    
        const propDef = schema[key];
        if (propDef) {
            result[key] = validateAndSanitize(rawProps[key], propDef);
        }
    });

    return result;
}
