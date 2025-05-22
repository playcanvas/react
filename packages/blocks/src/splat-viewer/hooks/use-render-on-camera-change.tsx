import { useApp, useFrame } from "@playcanvas/react/hooks";
import { Entity } from "playcanvas";
import { useRef } from "react";

const nearlyEquals = (a: Float32Array, b: Float32Array, epsilon = 1e-4): boolean => {
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) >= epsilon) return false;
  }
  return true;
};

/**
 * A custom React hook that triggers rendering when the camera's transform or projection matrix changes.
 *
 * @param {Entity | null} entity - The PlayCanvas entity representing the camera. If null, the hook does nothing.
 * @returns {void} This hook does not return a value but updates the rendering state of the application.
 */
export const useRenderOnCameraChange = (entity: Entity | null) => {
  const app = useApp();
  const prevWorld = useRef<Float32Array>(new Float32Array(16));
  const prevProj = useRef<Float32Array>(new Float32Array(16));

  app.renderNextFrame = true;

  useFrame(() => {
    if (!entity) return;
    const world = entity.getWorldTransform().data;
    const proj = entity.camera?.projectionMatrix?.data;

    if (!proj) {
      app.renderNextFrame = true;
      return;
    }

    const changed = !nearlyEquals(world, prevWorld.current) || !nearlyEquals(proj, prevProj.current);
    
    app.renderNextFrame = changed;

    if (app.renderNextFrame) {
      prevWorld.current.set(world);
      prevProj.current.set(proj);
    }
  });
};