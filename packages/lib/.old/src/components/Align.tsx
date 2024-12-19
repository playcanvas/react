"use client"

import { BoundingBox, Entity as PcEntity, RenderComponent, Vec3, Application, Mat4 } from "playcanvas";
import { Children, useLayoutEffect, useRef, useState } from "react";
import { Entity } from "../Entity";
import { useApp, useParent } from "../hooks";

interface AlignProps {
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    front?: boolean;
    back?: boolean;
    children?: React.ReactNode;
}

export const Align = (props: AlignProps) => {
    const { left, right, top, bottom, front, back, children } = props;
  
    const containerRef = useRef<PcEntity>(null);
    const boundsRef = useRef<BoundingBox>(new BoundingBox(new Vec3(), new Vec3()));
    const [, setBounds] = useState<BoundingBox | null>(null);
    const app: Application = useApp();
    const parent: PcEntity = useParent();
  
    // all children should be part of the scene hierarchy now
    useLayoutEffect(() => {
      if (!app) return;
  
      const entity: PcEntity | null = containerRef.current;
      const bounds: BoundingBox = boundsRef.current;
  
      if (!entity) return;
  
      bounds.center.set(0, 0, 0);
      bounds.halfExtents.set(0.0, 0.0, 0.0);
  
      const tmpAABB: BoundingBox = new BoundingBox();
      const invWorldTransform: Mat4 = new Mat4();
  
      const renderComponents = entity.findComponents("render") as RenderComponent[];
  
      // Compute the bounds of all render components
      const updatedBounds = renderComponents.reduce((bounds, component) => {
        const meshInstances = component.meshInstances;
        meshInstances.forEach((mi) => {
            invWorldTransform.copy(mi.node.getWorldTransform()).invert();
            tmpAABB.setFromTransformedAabb(mi.aabb, invWorldTransform);
            bounds.add(mi.aabb);
        });
        return bounds;
      }, bounds);
  
      boundsRef.current = updatedBounds;
      setBounds(updatedBounds);
    }, [app, parent, Children.count(children)]);
  
    const { center, halfExtents } = boundsRef.current;
  
    // Align based on bounds and alignment flags
    const position: [number, number, number] = [
      left ? -center.x + halfExtents.x : right ? -center.x - halfExtents.x : -center.x,
      bottom ? -center.y + halfExtents.y : top ? -center.y - halfExtents.y : -center.y,
      front ? -center.z + halfExtents.z : back ? -center.z - halfExtents.z : -center.z,
    ];
  
    return (
      <Entity ref={containerRef} position={position}>
        {children}
      </Entity>
    );
};