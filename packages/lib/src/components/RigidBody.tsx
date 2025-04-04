import { FC, useEffect } from "react";
import { useComponent, useParent } from "../hooks";
import { usePhysics } from "../contexts/physics-context";
import { warnOnce } from "../utils/validation";
import { PublicProps } from "../utils/types-utils";
import { RigidBodyComponent } from "playcanvas";

interface RigidBodyProps extends Partial<PublicProps<RigidBodyComponent>> {
    type?: "box"
        | "capsule"
        | "compound"
        | "cone"
        | "cylinder"
        | "mesh"
        | "sphere"
}

/**
 * Adding a RigidBody component to an entity allows it to participate in the physics simulation.
 * Rigid bodies have mass, and can be moved around by forces. Ensure `usePhysics` is set on the Application
 * to use this component.
 * 
 * @param {RigidBodyProps} props - The props to pass to the rigid body component.   
 * @see https://api.playcanvas.com/engine/classes/RigidBodyComponent.html
 * @example
 * <Entity>
 *  <RigidBody type="box" />
 * </Entity>
 */
export const RigidBody: FC<RigidBodyProps> = (props) => {
    const entity = useParent();
    const { isPhysicsEnabled, isPhysicsLoaded, physicsError } = usePhysics();

    useEffect(() => {
        if (!isPhysicsEnabled) {
            warnOnce(
                'The `<RigidBody>` component requires physics to be enabled.\n\n' +
                'To fix this:\n' +
                '1. Add `usePhysics` prop to your root Application component:\n' +
                '   <Application usePhysics>\n' +
                '     <Entity>\n' +
                '       <RigidBody type="box" mass={1} />\n' +
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
    useComponent(isPhysicsLoaded ? "rigidbody" : null, { ...props, type });

    return null;
}