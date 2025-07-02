import { useEffect, useCallback } from "react";
import { useApp } from "./use-app.tsx";

// Type for events with delta time
type DeltaTimeEvents = 'update' | 'prerender' | 'postrender';

// Type for events with no parameters
type NoParamEvents = 'start' | 'stop' | 'destroy';

// Type for events with multiple parameters
type MultiParamEvents = 'prerender:layer' | 'postrender:layer';

// Conditional type to determine callback signature based on event
type EventCallback<T extends string> = 
  T extends DeltaTimeEvents ? (dt: number) => void :
  T extends NoParamEvents ? () => void :
  T extends MultiParamEvents ? (camera: unknown, layer: unknown, transparent: boolean) => void :
  (...args: unknown[]) => void;

/**
 * Generic hook for subscribing to PlayCanvas application events.
 * Supports events with different parameter signatures using TypeScript conditional types.
 * 
 * @param event - The event name to subscribe to
 * @param callback - The callback function to execute when the event fires
 * 
 * @example
 * ```tsx
 * // Event with delta time - TypeScript will enforce (dt: number) => void
 * useAppEvent('update', (dt) => console.log('Frame time:', dt));
 * useAppEvent('prerender', (dt) => console.log('Pre-render time:', dt));
 * useAppEvent('postrender', (dt) => console.log('Post-render time:', dt));
 * 
 * // Event with no parameters - TypeScript will enforce () => void
 * useAppEvent('start', () => console.log('App started'));
 * useAppEvent('stop', () => console.log('App stopped'));
 * useAppEvent('destroy', () => console.log('App destroyed'));
 * 
 * // Event with multiple parameters - TypeScript will enforce the correct signature
 * useAppEvent('prerender:layer', (camera, layer, transparent) => {
 *   console.log('Pre-rendering layer:', layer.name, 'transparent:', transparent);
 * });
 * 
 * // Custom events - TypeScript will allow any signature
 * useAppEvent('custom:event', (data, timestamp) => {
 *   console.log('Custom event:', data, 'at:', timestamp);
 * });
 * ```
 */
export const useAppEvent = <T extends string>(
  event: T,
  callback: EventCallback<T>
) => {
  const app = useApp();

  // memoize handler so we can clean up properly
  const handler = useCallback(
    (...args: unknown[]) => {
      (callback as (...args: unknown[]) => void)(...args);
    },
    [callback]
  );

  useEffect(() => {
    if (!app) {
      throw new Error("`useApp` must be used within an Application component");
    }

    app.on(event, handler);
    return () => {
      app.off(event, handler);
    };
  }, [app, handler, event]);
};

/**
 * useFrame hook — registers a callback on every frame update.
 * The callback receives the delta time (dt) since the last frame.
 * 
 * @deprecated Use useAppEvent('update', callback) instead
 */
export const useFrame = (callback: (dt: number) => void) => {
  return useAppEvent('update', callback);
};

/*
 * Example usage:
 * 
 * function MyComponent() {
 *   // Frame update with delta time
 *   useAppEvent('update', (dt) => {
 *     console.log('Frame delta time:', dt);
 *   });
 * 
 *   // App lifecycle events
 *   useAppEvent('start', () => {
 *     console.log('Application started');
 *   });
 * 
 *   // Layer rendering events
 *   useAppEvent('prerender:layer', (camera, layer, transparent) => {
 *     if (layer.name === 'UI') {
 *       console.log('Rendering UI layer');
 *     }
 *   });
 * 
 *   return <Entity />;
 * }
 */