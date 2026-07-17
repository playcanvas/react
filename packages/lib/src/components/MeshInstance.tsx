"use client";

import { FC, useEffect, useRef } from "react";
import {
  MeshInstance as PcMeshInstance,
  Mesh,
  Material,
  SkinInstance,
  VertexBuffer,
  MorphInstance,
  RenderComponent,
  Entity,
  VertexFormat
} from "playcanvas";
import { Serializable, PublicProps } from "../utils/types-utils.ts";
import { getStaticNullApplication, validatePropsPartial } from "../utils/validation.ts";
import { createComponentDefinition } from "../utils/validation.ts";
import { useParent } from "../hooks/use-parent.tsx";
import { useApp } from "../hooks/use-app.tsx";

/**
 * Extended instancing data with cleanup flag
 */
type InstancingDataWithCleanup = NonNullable<PcMeshInstance["instancingData"]> & {
  _destroyVertexBuffer?: boolean;
};

/**
 * Declarative wrapper for pc.MeshInstance.
 * Supports morphs, skins, and hardware instancing.
 */
export interface MeshInstanceProps
  extends Omit<Partial<PublicProps<PcMeshInstance>>, "mesh" | "material"> {
  mesh: Mesh;
  material?: Material;
  morphWeights?: number[];
  skinInstance?: SkinInstance;
  instancing?: {
    vertexBuffer?: VertexBuffer;
    matrices?: Float32Array;
    count?: number;
  };
  visible?: boolean;
}

/**
 * Internal implementation
 */
const MeshInstanceComponent: FC<MeshInstanceProps> = (props) => {
  const instanceRef = useRef<PcMeshInstance | null>(null);
  const parent = useParent();
  const app = useApp();
  const render = parent.render as RenderComponent | undefined;

  if (!render) console.warn("<MeshInstance> must be used inside a <Render> component");

  // Create / Destroy
  useEffect(() => {
    if (!render) return;

    const material = props.material ?? render.material ?? null;
    const mi = new PcMeshInstance(props.mesh, material, render.entity);

    // --- Morphs
    if (props.mesh.morph) {
      const morphInstance = new MorphInstance(props.mesh.morph);
      mi.morphInstance = morphInstance;

      if (props.morphWeights) {
        const count = Math.min(
          props.morphWeights.length,
          morphInstance.morph.targets.length
        );
        for (let i = 0; i < count; i++) {
          morphInstance.setWeight(i, props.morphWeights[i]);
        }
      }
    }

    // --- Skins
    if (props.skinInstance) {
      mi.skinInstance = props.skinInstance;
    }

    // --- Instancing
    if (props.instancing) {
      const { vertexBuffer, matrices, count } = props.instancing;
      const device = props.mesh.device ?? app?.graphicsDevice;

      if (vertexBuffer) {
        mi.setInstancing(vertexBuffer);
      } else if (matrices && count && device) {
        const format = VertexFormat.getDefaultInstancingFormat(device);
        const vb = new VertexBuffer(device, format, count, { data: matrices.buffer as ArrayBuffer });
        mi.setInstancing(vb);
        if (mi.instancingData) {
          (mi.instancingData as InstancingDataWithCleanup)._destroyVertexBuffer = true;
        }
      }

      if (count) mi.instancingCount = count;
    }

    mi.visible = props.visible ?? true;
    render.meshInstances.push(mi);
    instanceRef.current = mi;

    return () => {
      const idx = render.meshInstances.indexOf(mi);
      if (idx !== -1) render.meshInstances.splice(idx, 1);

      // clean up any auto-created instancing buffer
      const instancingData = mi.instancingData as InstancingDataWithCleanup | null;
      if (instancingData?._destroyVertexBuffer) {
        instancingData.vertexBuffer?.destroy();
      }

      instanceRef.current = null;
    };
  }, [render, props.mesh]);

  // --- Reactive updates
  useEffect(() => {
    const mi = instanceRef.current;
    if (!mi) return;

    if (props.material) mi.material = props.material;
    if (props.visible !== undefined) mi.visible = props.visible;

    // Update morph weights
    if (props.morphWeights && mi.morphInstance) {
      const count = Math.min(
        props.morphWeights.length,
        mi.morphInstance.morph.targets.length
      );
      for (let i = 0; i < count; i++) {
        mi.morphInstance.setWeight(i, props.morphWeights[i]);
      }
    }

    // Update instancing data
    if (props.instancing && mi.instancingData) {
      const { matrices, count } = props.instancing;
      if (matrices && mi.instancingData.vertexBuffer) {
        const vb = mi.instancingData.vertexBuffer;
        const view = vb.lock() as unknown as Float32Array;
        view.set(matrices);
        vb.unlock();
      }
      if (count) mi.instancingCount = count;
    }
  }, [props.material, props.visible, props.morphWeights, props.instancing]);

  return null;
};

/**
 * Schema definition
 */
const componentDefinition = createComponentDefinition<MeshInstanceProps, PcMeshInstance>(
  "MeshInstance",
  () =>
    new PcMeshInstance(
      null as unknown as Mesh,
      null as unknown as Material,
      new Entity("mock", getStaticNullApplication())
    ),
  (mi) => {
    const instancingData = mi.instancingData as InstancingDataWithCleanup | null;
    if (instancingData?._destroyVertexBuffer) {
      instancingData.vertexBuffer?.destroy();
    }
  },
  "MeshInstanceComponent"
);

componentDefinition.schema = {
  ...componentDefinition.schema,
  mesh: {
    validate: (v: unknown) => v instanceof Mesh,
    errorMsg: (v: unknown) => `Invalid value for prop "mesh": ${v}. Expected a pc.Mesh.`,
    default: undefined,
  },
  material: {
    validate: (v: unknown) => !v || v instanceof Material,
    errorMsg: (v: unknown) => `Invalid value for prop "material": ${v}. Expected a pc.Material.`,
    default: undefined,
  },
  morphWeights: {
    validate: (v: unknown) => !v || (Array.isArray(v) && v.every((n) => typeof n === "number")),
    errorMsg: (v: unknown) =>
      `Invalid value for prop "morphWeights": ${v}. Expected an array of numbers.`,
    default: undefined,
  },
  skinInstance: {
    validate: (v: unknown) => !v || v instanceof SkinInstance,
    errorMsg: (v: unknown) =>
      `Invalid value for prop "skinInstance": ${v}. Expected a pc.SkinInstance.`,
    default: undefined,
  },
  instancing: {
    validate: (v: unknown) => {
      if (!v) return true;
      if (typeof v !== "object" || v === null) return false;
      const obj = v as Record<string, unknown>;
      return (
        (obj.vertexBuffer instanceof VertexBuffer) ||
        (obj.matrices instanceof Float32Array)
      );
    },
    errorMsg: (v: unknown) =>
      `Invalid value for prop "instancing": ${v}. Expected { vertexBuffer?: VertexBuffer, matrices?: Float32Array, count?: number }.`,
    default: undefined,
  },
  visible: {
    validate: (v: unknown) => v === undefined || typeof v === "boolean",
    errorMsg: (v: unknown) => `Invalid value for prop "visible": ${v}. Expected a boolean.`,
    default: true,
  },
};

/**
 * Public wrapper
 */
export const MeshInstance: FC<MeshInstanceProps> = (props) => {
  const safeProps = validatePropsPartial(props, componentDefinition);
  return <MeshInstanceComponent {...(safeProps as Serializable<MeshInstanceProps>)} />;
};

export default MeshInstance;