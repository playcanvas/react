import { BoundingBox, Mat4, Vec3 } from "playcanvas";
import { Children, useEffect, useRef, useState } from "react";
import { Entity } from "../Entity";

  
export const Align = (props) => {

    const align = props;
    const children = props.children;

    const containerRef = useRef(null);
    const boundsRef = useRef(new BoundingBox(new Vec3(), new Vec3()));
    const[bounds, setBounds] = useState();

    // all children should be part of the scene hierarchy now
    useEffect(() => {

        const entity = containerRef.current;
        const bounds = boundsRef.current

        if (!entity) return;

        bounds.center.set(0, 0, 0);
        bounds.halfExtents.set(0.0, 0.0, 0.0);
        
        const tmpAABB = new BoundingBox()
        const invWorldTransform = new Mat4();
        
        const renderComponents = entity.findComponents('render');

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
        setBounds(updatedBounds)
    }, [Children.count(children)] );

    const { left, right, top, bottom, front, back } = align;
    const { center, halfExtents } = boundsRef.current;

    const position = [
        left ? halfExtents.x : right ? -halfExtents.x : center.x,
        bottom ? halfExtents.y * 2 : top ? -halfExtents.y * 2 : center.y,
        front ? halfExtents.z * .5 : back ? -halfExtents.z * .5 : center.z,
    ]

    return <Entity ref={containerRef} position={position}>
        { children }
    </Entity>
}