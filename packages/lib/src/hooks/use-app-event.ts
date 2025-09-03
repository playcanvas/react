import { useEffect, useCallback } from "react";
import { useApp } from "./use-app.tsx";
import { warnOnce } from "../utils/validation.ts"

/**
 * Base event callback map for PlayCanvas application events.
 * This can be extended to include custom events.
 */
export type BaseEventCallbackMap = {
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

/**
 * Generic hook for subscribing to PlayCanvas application events.
 * Supports both built-in events and custom events with proper TypeScript typing.
 * 
 * @param event - The event name to subscribe to
 * @param callback - The callback function to execute when the event fires
 * 
 * @example
 * ```tsx
 * // Built-in events with type safety
 * useAppEvent('update', (dt) => console.log('Frame time:', dt));
 * useAppEvent('prerender', () => console.log('Pre-render'));
 * useAppEvent('postrender', () => console.log('Post-render'));
 * ```
 * 
 * @example
 * ```tsx
 * // Custom events with custom event map - no inheritance needed
 * interface MyEventMap {
 *   levelComplete: (level: number, score: number) => void;
 *   playerDeath: (position: [number, number, number]) => void;
 * }
 * 
 * useAppEvent<MyEventMap>('levelComplete', (level, score) => {
 *   console.log(`Level ${level} completed with score ${score}`);
 * });
 * 
 * useAppEvent<MyEventMap>('playerDeath', (position) => {
 *   console.log('Player died at', position);
 * });
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
export function useAppEvent<
  TEventMap = BaseEventCallbackMap,
  TEventName extends keyof TEventMap = keyof TEventMap
>(
  event: TEventName,
  callback: TEventMap[TEventName]
): void {
  const app = useApp();

  const handler = useCallback((...args: unknown[]) => {
    if (event === 'update') {
      // update event always receives delta time as first argument
      (callback as (dt: number) => void)(args[0] as number);
    } else {
      // All other events receive no arguments
      (callback as () => void)();
    }
  }, [callback, event]);

  useEffect(() => {
    if (!app) {
      throw new Error("`useAppEvent` must be used inside an `<Application />` component");
    }

    app.on(event as string, handler);
    return () => {
      app.off(event as string, handler);
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