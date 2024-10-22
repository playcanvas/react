export const shallowEquals = (objA: any, objB: any): boolean => {
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
      if (objA[key] !== objB[key]) {
        return false;
      }
    }
  
    return true;
  }