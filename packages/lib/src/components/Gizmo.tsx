import { useApp } from "@playcanvas/react/hooks";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { CameraComponent, GraphNode, Gizmo as PcGizmo, RotateGizmo, ScaleGizmo, TransformGizmo, TranslateGizmo } from "playcanvas";

/**
 * A gizmo component that allows you to manipulate the nodes in the scene.
 * @param props - The props for the gizmo.
 * @param props.camera - The camera component to use for the gizmo.
 * @param props.nodes - The nodes to attach the gizmo to.
 * @param props.mode - The mode of the gizmo.
 * @param props.onCommit - The function to call when the gizmo is committed.
 * @returns A gizmo component.
 *
 * @example
 * ```tsx
 * <Gizmo camera={camera} nodes={nodes} mode="rotate" onCommit={onCommit} />
 * ```
 */
export function Gizmo({ camera, nodes, mode, onCommit }: Props) {
  const app = useApp();
  const gizmoRef = useRef<RotateGizmo | ScaleGizmo | TranslateGizmo>(null);
  const layer = useMemo(() => PcGizmo.createLayer(app), [app]);

  const onGizmoCommit = useCallback(() => {
    if (!gizmoRef.current) return;

    const updated = nodes.map((node) => ({
        id: node.name,
        position: node.getPosition().toArray(),
        rotation: node.getEulerAngles().toArray(),
        scale: node.getLocalScale().toArray()
      })) as EntityProps[];

    onCommit(updated);

  }, [nodes, onCommit]);

  useEffect(() => {
    switch (mode) {
      case "rotate":
        gizmoRef.current = new RotateGizmo(camera, layer);
        break;
      case "scale":
        gizmoRef.current = new ScaleGizmo(camera, layer);
        break;
      case "translate":
        gizmoRef.current = new TranslateGizmo(camera, layer);
        break;
    }

    gizmoRef.current.on(TransformGizmo.EVENT_TRANSFORMEND, onGizmoCommit);

    return () => {
      gizmoRef.current?.destroy?.();
    };
  }, [camera, layer, mode]);

  useEffect(() => {
    if (!gizmoRef.current) return;
    gizmoRef.current.attach(nodes);
  }, [nodes]);

  return null;
}

type Mode = "rotate" | "scale" | "translate";

type EntityProps = {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

type Props = {
  /**
   * The camera component to use for the gizmo.
   */
  camera: CameraComponent;
  /**
   * The nodes to attach the gizmo to.
   */
  nodes: GraphNode[];
  /**
   * The mode of the gizmo.
   */
  mode: Mode;
  /**
   * The function to call when the gizmo is committed.
   */
  onCommit: (props: EntityProps[]) => void;
};