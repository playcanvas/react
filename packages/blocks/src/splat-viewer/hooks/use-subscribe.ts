import { useCallback, useRef } from 'react';

/**
 * A hook for subscribing to a value.
 * @example
 * const { subscribe, notify } = useSubscribe<number>();
 * subscribe((value) => console.log(value));
 * notify(1);
 * 
 * @returns A tuple of `subscribe` and `notify` functions.
 */
export function useSubscribe<T>() {
  const subscribers = useRef(new Set<(value: T) => void>());

  const subscribe = useCallback((fn: (value: T) => void) => {
    subscribers.current.add(fn);
    return () => subscribers.current.delete(fn);
  }, []);

  const notify = useCallback((value: T) => {
    subscribers.current.forEach((fn) => fn(value));
  }, []);

  return { subscribe, notify };
} 