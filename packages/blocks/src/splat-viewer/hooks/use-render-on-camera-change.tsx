import { useApp, useFrame } from "@playcanvas/react/hooks";
import { Entity } from "playcanvas";
import { useRef } from "react";

const nearlyEquals = (a: Float32Array, b: Float32Array, epsilon = 1e-4): boolean => {
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) >= epsilon) return false;
  }
  return true;
};

export const useRenderOnCameraChange = (entity: Entity | null) => {
  const app = useApp();
  const prevWorld = useRef<Float32Array>(new Float32Array(16));
  const prevProj = useRef<Float32Array>(new Float32Array(16));

  useFrame(() => {
    if (!entity) return;
    const world = entity.getWorldTransform().data;
    const proj = entity.camera?.projectionMatrix?.data;

    if (!proj) return;

    let changed = false;

    if (!app.autoRender && !app.renderNextFrame) {
      changed = !nearlyEquals(world, prevWorld.current) || !nearlyEquals(proj, prevProj.current);

      if (changed) {
        console.log("changed");
        app.renderNextFrame = true;
      }
    }

    if (app.renderNextFrame) {
      if (changed || app.autoRender) {
        prevWorld.current.set(world);
        prevProj.current.set(proj);
      }
    }
  });
};