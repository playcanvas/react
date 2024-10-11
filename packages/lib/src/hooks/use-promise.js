import { useState, useEffect } from 'react';

/** 
 * A simple cache system that takes an array or object
 * which is used as a key for the cache. The items in the cache 
 * do not need to be serializable, and can be objects or functions. 
 */
class NestedCache {

    // internal key
    #INTERNAL_KEY = Symbol('internal key');

    objectCache = new WeakMap();
    primitiveCache = new Map();

    get(keys = {}) {
        keys = this.#extractKeysFromObject(keys);
        let currentCache = this.#getCache(keys[0]);

        for (const key of keys) {
            if (!currentCache.has(key)) {
                return undefined;
            }
            currentCache = currentCache.get(key);
        }

        return currentCache.get(this.#INTERNAL_KEY);
    }

    /**
     * Set a value in the cache.
     * @param {object} keys - An object whose values are used to create a cache key.
     * @param {*} value - The value to store in the cache.
     */
    set(keys = {}, value) {
        keys = this.#extractKeysFromObject(keys);
        let currentCache = this.#getCache(keys[0]);

        for(const key of keys){
            if(!currentCache.has(key)){

                // if the key is an object, use a WeakMap for better memory management
                // const newCache = typeof key === 'object' ? new WeakMap() : new Map();
                currentCache.set(key, new Map());

            }
            currentCache = currentCache.get(key);
        }

        // set the value in the last cache
        currentCache.set(this.#INTERNAL_KEY, value);   
    }
    
    has(keys= []) {
        return this.get(keys) !== undefined;
    }

    delete(keys = {}) {
        keys = this.#extractKeysFromObject(keys);
        let currentCache = this.#getCache(keys[0]);
    
        const stack = [];
    
        for (const key of keys) {
            if (!currentCache.has(key)) {
                return false;
            }
            stack.push([currentCache, key]);
            currentCache = currentCache.get(key);
        }
    
        if (currentCache.has(this.#INTERNAL_KEY)) {
            currentCache.delete(this.#INTERNAL_KEY);
            // Clean up empty maps to prevent memory leaks
            for (let i = stack.length - 1; i >= 0; i--) {
                const [parent, key] = stack[i];
                const child = parent.get(key);
                if (child.size === 0) {
                    parent.delete(key);
                } else {
                    break;
                }
            }
            return true;
        }
    
        return false;
    }
    
    /**
     * Extract keys from an object and return them in a consistent order.
     * @param {Object} obj - The object to extract keys from.
     * @returns {Array} An array of keys.
     */
    #extractKeysFromObject(obj) {
        const keys = Object.keys(obj).sort();
        return keys.map(key => obj[key]);
    }

    /**
     * Get the appropriate cache for the first key.
     * @param {*} firstKey - The first key in the keys array.
     * @returns {Map|WeakMap} The appropriate cache (Map or WeakMap).
     */
    #getCache(firstKey) {
        return typeof firstKey === 'object' && firstKey !== null ? this.objectCache : this.primitiveCache;
    }
}

const cache = new NestedCache();

const usePromise = (deps, promiseFactory) => {

    // cache then validate
    if (!cache.has(deps)) {
        const promise = promiseFactory(deps)
        .then(response => {
                const remove = () => cache.delete(deps);
                cache.set(deps, { status: 'success', response, remove });
                return [response, remove];
            })
            .catch(error => {
                const remove = () => cache.delete(deps);
                cache.set(deps, { status: 'error', error, remove });
                throw [error, remove];
            });
            
        const remove = () => cache.delete(deps);
        cache.set(deps, { status: 'pending', promise, remove });
    }

    const { status, response, promise, error, remove } = cache.get(deps);

    if (status === 'pending') {
        throw promise;
    } else if (status === 'error') {
        throw error;
    } else if (status === 'success') {
        return [response, remove];
    }
};

export default usePromise;