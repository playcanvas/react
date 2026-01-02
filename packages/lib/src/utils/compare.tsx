/**
 * Simple deep equality check for two objects
 * @param {Record<string, unknown>} a - The first object
 * @param {Record<string, unknown>} b - The second object
 * @returns {boolean} True if the objects are equal, false otherwise
 */
export function deepEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) return false;
  
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
  
    return aKeys.every(key => deepEqual(a[key] as Record<string, unknown>, b[key] as Record<string, unknown>));
}

interface Approximate {
    equalsApprox(other: unknown): boolean;
}

interface Equatable {
    equals(other: unknown): boolean;
}

/**
 * Check if two values are equal. Handles primitives, null/undefined, 
 * and objects with `equalsApprox` or `equals` methods (Vec3, Color, etc.)
 * 
 * Priority order:
 * 1. Strict equality (===)
 * 2. Floating point approximation (equalsApprox) - handles precision drift
 * 3. Structural equality (equals)
 * 
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are equal, false otherwise
 */
export function valuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    
    // Early exit if either is null/undefined (using type coercion)
    if (a == null || b == null) return false;

    if (typeof a === 'object') {
        // Priority 1: Floating point approximation (handles precision drift)
        if ('equalsApprox' in a && typeof (a as Approximate).equalsApprox === 'function') {
            return (a as Approximate).equalsApprox(b);
        }

        // Priority 2: Strict structural equality
        if ('equals' in a && typeof (a as Equatable).equals === 'function') {
            return (a as Equatable).equals(b);
        }
    }

    // For other objects, return false to trigger re-apply (conservative)
    return false;
}

/**
 * Shallow equality check for two objects. Compares each property using valuesEqual.
 * 
 * @param objA - First object to compare
 * @param objB - Second object to compare
 * @returns True if objects are shallowly equal, false otherwise
 */
export const shallowEquals = (objA: Record<string, unknown>, objB: Record<string, unknown>): boolean => {
    // If the two objects are the same object, return true
    if (objA === objB) {
        return true;
    }
    
    // If either is not an object (null or primitives), return false
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
    }
    
    // Get the keys of both objects
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    
    // If the number of keys is different, the objects are not equal
    if (keysA.length !== keysB.length) {
        return false;
    }
    
    // Check if all keys and their values are equal using valuesEqual
    for (let i = 0; i < keysA.length; i++) {
        const key = keysA[i];
        if (!valuesEqual(objA[key], objB[key])) {
            return false;
        }
    }
    
    return true;
}