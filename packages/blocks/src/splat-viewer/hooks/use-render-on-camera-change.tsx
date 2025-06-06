import { useApp, useFrame } from "@playcanvas/react/hooks";
import { Entity as PcEntity } from "playcanvas";
import { useEffect, useRef } from "react";

const nearlyEquals = (a: Float32Array, b: Float32Array, epsilon = 1e-4): boolean => {
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) >= epsilon) return false;
  }
  return true;
};

/**
 * A custom React hook that triggers rendering when the camera's transform or projection matrix changes.
 * Only renders when the camera is visible in the viewport.
 *
 * @param {Entity | null} entity - The PlayCanvas entity representing the camera. If null, the hook does nothing.
 * @returns {void} This hook does not return a value but updates the rendering state of the application.
 */
export const useRenderOnCameraChange = (entity: PcEntity | null) => {
  const app = useApp();
  const prevWorld = useRef<Float32Array>(new Float32Array(16));
  const prevProj = useRef<Float32Array>(new Float32Array(16));
  const isVisible = useRef(true);

  /**
   * This hook ensures that rendering only happens when the canvas is visible in the viewport.
   * This takes precedence over the camera change detection. Eg if the camera is animating, but
   * the canvas is not visible, dont render.
   */

  useEffect(() => {
    const canvas = app.graphicsDevice.canvas;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (!isVisible.current) {
          app.renderNextFrame = false;
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [app]);

  /**
   * This hook ensures that rendering only happens when the camera has moved or it's projection has changed.
   * However if the canvas is not visible on the page it will take precedence.
   * Don't render if the canvas is not visible regardless of any animations.
   */
  useFrame(() => {
    if (!entity || !isVisible.current) return;
    const world = entity.getWorldTransform().data;
    const proj = entity.camera?.projectionMatrix?.data;

    if (!proj) {
      app.renderNextFrame = true;
      return;
    }

    const changed = !nearlyEquals(world, prevWorld.current) || !nearlyEquals(proj, prevProj.current);
    
    if (!app.renderNextFrame) {
      app.renderNextFrame = changed;
    }

    if (app.renderNextFrame) {
      prevWorld.current.set(world);
      prevProj.current.set(proj);
    }
  });
};