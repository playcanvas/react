"use client"

import { FC, useEffect } from "react";
import { useComponent, useParent } from "../hooks";
import { usePhysics } from "../contexts/physics-context";
import { warnOnce } from "../utils/warn-once";

type CollisionProps = {
    [key: string]: unknown;
    type?: string;
}

export const Collision: FC<CollisionProps> = (props) => {
    const entity = useParent();
    const { isPhysicsEnabled, isPhysicsLoaded, physicsError } = usePhysics();

    useEffect(() => {
        if (!isPhysicsEnabled) {
            warnOnce(
                'The `<Collision>` component requires `usePhysics` to be set on the Application. ' +
                'Please add `<Application usePhysics/>` to your root component.',
                false // Show in both dev and prod
            );
        }

        if (physicsError) {
            warnOnce(
                `Failed to initialize physics: ${physicsError.message}. ` +
                "Run `npm install sync-ammo` in your project, if you haven't done so already.",
                false // Show in both dev and prod
            );
        }
    }, [isPhysicsEnabled, physicsError]);

    // If no type is defined, infer if possible from a render component
    const type = entity.render && props.type === undefined ? entity.render.type : props.type;

    // Always call useComponent - it will handle component lifecycle internally
    useComponent(isPhysicsLoaded ? "collision" : null, { ...props, type });

    return null;
}