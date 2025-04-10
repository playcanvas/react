
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

type Equalable = {
    equals: (other: unknown) => boolean;
  };
  
  function hasEqualsMethod(obj: unknown): obj is Equalable {
    return typeof obj === 'object' && 
      obj !== null && 
      'equals' in obj && 
      typeof (obj as Equalable).equals === 'function';
  }
  
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
    
    // Check if all keys and their values are equal
    for (let i = 0; i < keysA.length; i++) {
        const key = keysA[i];
        const propA = objA[key];
        const propB = objB[key];
        // If the object has an equality operator, use this
        if(hasEqualsMethod(propA)) {
            return propA.equals(propB);
        } else if (propA !== propB) {
            return false;
        }
    }
    
    return true;
}