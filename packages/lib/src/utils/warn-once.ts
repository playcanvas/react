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