import { useCallback, useRef } from 'react';

export type SubscribeFn<T> = (fn: (value: T) => void) => () => void;
export type NotifyFn<T> = (value: T) => void;

/**
 * A hook for subscribing to a value.
 * @example
 * const { subscribe, notify } = useSubscribe<number>();
 * subscribe((value) => console.log(value));
 * notify(1);
 * 
 * @returns `subscribe` and `notify` functions.
 */
export function useSubscribe<T>() : [SubscribeFn<T>, NotifyFn<T>] {
  const subscribers = useRef(new Set<(value: T) => void>());

  const subscribe: SubscribeFn<T> = useCallback((fn: (value: T) => void) => {
    subscribers.current.add(fn);
    return () => subscribers.current.delete(fn);
  }, []);

  const notify: NotifyFn<T> = useCallback((value: T) => {
    subscribers.current.forEach((fn) => fn(value));
  }, []);

  return [subscribe, notify];
} 