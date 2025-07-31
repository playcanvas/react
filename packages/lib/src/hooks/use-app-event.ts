import { useEffect, useCallback } from "react";
import { useApp } from "./use-app.tsx";
import { warnOnce } from "../utils/validation.ts"

/**
 * Generic hook for subscribing to PlayCanvas application events.
 * Supports events with different parameter signatures using TypeScript conditional types.
 * 
 * @param {'update' | 'prerender' | 'postrender'} event - The event name to subscribe to
 * @param callback - The callback function to execute when the event fires
 * 
 * @example
 * ```tsx
 * // Event with delta time - TypeScript will enforce (dt: number) => void
 * useAppEvent('update', (dt) => console.log('Frame time:', dt));
 * 
 * // Events with no parameters - TypeScript will enforce () => void
 * useAppEvent('prerender', () => console.log('Pre-render'));
 * useAppEvent('postrender', () => console.log('Post-render'));
 * ```
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   // Frame update with delta time
 *   useAppEvent('update', (dt) => {
 *     console.log('Frame delta time:', dt);
 *   });
 * 
 *   // App lifecycle events
 *   useAppEvent('prerender', () => {
 *     console.log('Pre-rendering');
 *   });
 * 
 *   return null;
 * }
 * ```
 */
type EventCallbackMap = {
  /**
   * @param dt - The delta time since the last frame
   * @returns void
   */
  update: (dt: number) => void;
  /**
   * @returns void
   */
  prerender: () => void;
  /**
   * @returns void
   */
  postrender: () => void;
};

type AppEventName = keyof EventCallbackMap;

export function useAppEvent<T extends AppEventName>(
  event: T,
  callback: EventCallbackMap[T]
): void {
  const app = useApp();

  const handler = useCallback((dt?: number) => {
    if (event === 'update') {
      (callback as (dt: number) => void)(dt!);
    } else {
      (callback as () => void)();
    }
  }, [callback, event]);

  useEffect(() => {
    if (!app) {
      throw new Error("`useAppEvent` must be used inside an `<Application />` component");
    }

    app.on(event, handler);
    return () => {
      app.off(event, handler);
    };
  }, [app, handler, event]);
}

/**
 * useFrame hook — registers a callback on every frame update.
 * The callback receives the delta time (dt) since the last frame.
 * 
 * @deprecated Use useAppEvent('update', callback) instead
 */
export const useFrame = (callback: (dt: number) => void) => {
  warnOnce("`useFrame` is deprecated and will be removed in a future release. Please use useAppEvent('update', callback) instead.")
  return useAppEvent('update', callback);
};