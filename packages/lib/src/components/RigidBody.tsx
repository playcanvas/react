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

export const RigidBody: FC<RigidBodyProps> = (props) => {
    const entity = useParent();
    const { isPhysicsEnabled, isPhysicsLoaded, physicsError } = usePhysics();

    useEffect(() => {
        if (!isPhysicsEnabled) {
            warnOnce(
                'The `<RigidBody>` component requires `usePhysics` to be set on the Application. ' +
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

    // @ts-expect-error Ammo is defined in the global scope in the browser
    if(isPhysicsLoaded && !globalThis.Ammo ) {
        throw new Error('The `<RigidBody>` component requires `usePhysics` to be set on the Application. `<Application usePhysics/>` ')
    }

    // If no type is defined, infer if possible from a render component
    const type = entity.render && props.type === undefined ? entity.render.type : props.type;

    // Always call useComponent - it will handle component lifecycle internally
    useComponent(isPhysicsLoaded ? "rigidbody" : null, { ...props, type });

    return null;
}