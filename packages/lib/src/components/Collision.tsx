"use client"

import { FC, useEffect } from "react";
import { useComponent, useParent } from "../hooks";
import { usePhysics } from "../contexts/physics-context";
import { validateAndSanitizeProps, warnOnce, createComponentDefinition, ComponentDefinition } from "../utils/validation";
import { CollisionComponent, Entity } from "playcanvas";
import { PublicProps } from "../utils/types-utils";

/**
 * The Collision component adds a collider to the entity. This enables the entity to collide with other entities.
 * You can manually define the shape of the collider with the `type` prop, or let the component infer the shape from a `Render` component.
 * @param {CollisionProps} props - The props to pass to the collision component.
 * @see https://api.playcanvas.com/engine/classes/CollisionComponent.html
 * 
 * @example
 * <Entity>
 *  <Collision type="box" />
 *  <Render /> // will infer the shape from the render component
 * </Entity>
 */
export const Collision: FC<CollisionProps> = (props) => {

    const safeProps = validateAndSanitizeProps(props as Record<string, unknown>, componentDefinition as ComponentDefinition<CollisionProps>);

    const entity = useParent();
    const { isPhysicsEnabled, isPhysicsLoaded, physicsError } = usePhysics();

    useEffect(() => {
        if (!isPhysicsEnabled) {
            warnOnce(
                'The `<Collision>` component requires physics to be enabled.\n\n' +
                'To fix this:\n' +
                '1. Add `usePhysics` prop to your root Application component:\n' +
                '   <Application usePhysics>\n' +
                '     <Entity>\n' +
                '       <Collision type="box" />\n' +
                '     </Entity>\n' +
                '   </Application>\n\n' +
                '2. Make sure you have the required dependencies installed:\n' +
                '   npm install sync-ammo\n\n' +
                'For more information, see: https://playcanvas-react.vercel.app/docs/physics'
            );
        }

        if (physicsError) {
            warnOnce(
                `Physics initialization failed: ${physicsError.message}\n\n` +
                'To fix this:\n' +
                '1. Install the required dependency:\n' +
                '   npm install sync-ammo\n\n' +
                '2. Make sure your bundler is configured to handle WASM files\n\n' +
                '3. Check that your server is configured to serve .wasm files with the correct MIME type\n\n' +
                'For more information, see: https://playcanvas-react.vercel.app/docs/physics#troubleshooting'
            );
        }
    }, [isPhysicsEnabled, physicsError]);

    // If no type is defined, infer if possible from a render component
    const type = entity.render && props.type === undefined ? entity.render.type : props.type;

    // Always call useComponent - it will handle component lifecycle internally
    useComponent(isPhysicsLoaded ? "collision" : null, { ...safeProps, type });

    return null;
}

interface CollisionProps extends Partial<PublicProps<CollisionComponent>> {
    type?: "box"
        | "capsule"
        | "compound"
        | "cone"
        | "cylinder"
        | "mesh"
        | "sphere"
}

const componentDefinition = createComponentDefinition(
    "Collision",
    () => new Entity().addComponent('collision') as CollisionComponent,
    (component) => (component as CollisionComponent).system.destroy(),
    "CollisionComponent"
)