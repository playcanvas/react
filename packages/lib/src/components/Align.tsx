import { BoundingBox, Entity as PcEntity, Mat4, RenderComponent, Vec3 } from "playcanvas";
import { Children, ReactNode, useEffect, useRef, useState } from "react";
import { Entity } from "../Entity";

interface AlignProps {
    align: {
        left?: boolean;
        right?: boolean;
        top?: boolean;
        bottom?: boolean;
        front?: boolean;
        back?: boolean;
    };
    children: ReactNode;
}

export const Align = (props: AlignProps) => {
    const { align, children } = props;

    const containerRef = useRef<PcEntity>(null);
    const boundsRef = useRef<BoundingBox>(new BoundingBox(new Vec3(), new Vec3()));
    const [, setBounds] = useState<BoundingBox | null>(null);

    // all children should be part of the scene hierarchy now
    useEffect(() => {
        const entity : PcEntity | null = containerRef.current;
        const bounds : BoundingBox = boundsRef.current;

        if (!entity) return;

        bounds.center.set(0, 0, 0);
        bounds.halfExtents.set(0.0, 0.0, 0.0);

        const tmpAABB : BoundingBox = new BoundingBox();
        const invWorldTransform : Mat4 = new Mat4();

        const renderComponents = entity.findComponents("render") as RenderComponent[];

        // Compute the bounds of all render components
        const updatedBounds = renderComponents.reduce((bounds, component) => {
            const meshInstances = component.meshInstances;
            meshInstances.forEach((mi) => {
                invWorldTransform.copy(mi.node.getWorldTransform()).invert();
                tmpAABB.setFromTransformedAabb(mi.aabb, invWorldTransform);
                bounds.add(tmpAABB);
            });
            return bounds;
        }, bounds);

        boundsRef.current = updatedBounds;
        setBounds(updatedBounds);
    }, [Children.count(children)]);

    const { left, right, top, bottom, front, back } = align;
    const { center, halfExtents } = boundsRef.current;

    const position: [number, number, number] = [
        left ? halfExtents.x : right ? -halfExtents.x : center.x,
        bottom ? halfExtents.y * 2 : top ? -halfExtents.y * 2 : center.y,
        front ? halfExtents.z * 0.5 : back ? -halfExtents.z * 0.5 : center.z,
    ];

    return (
        <Entity ref={containerRef} position={position}>
            {children}
        </Entity>
    );
};