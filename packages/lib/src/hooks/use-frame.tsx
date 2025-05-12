import { useEffect, useCallback } from "react";
import { useApp } from "./use-app";

/**
 * useFrame hook — registers a callback on every frame update.
 * The callback receives the delta time (dt) since the last frame.
 */
export const useFrame = (callback: (dt: number) => void) => {
  const app = useApp();

  // memoize handler so we can clean up properly
  const handler = useCallback(
    (dt: number) => {
      callback(dt);
    },
    [callback]
  );

  useEffect(() => {
    if (!app) return;

    app.on("update", handler);
    return () => {
      app.off("update", handler);
    };
  }, [app, handler]);
};