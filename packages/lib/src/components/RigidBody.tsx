import { FC, useEffect } from "react";
import { useComponent, useParent } from "../hooks";
import { usePhysics } from "../contexts/physics-context";

type RigidBodyProps = {
    [key: string]: unknown;
    type?: string;
}

export const RigidBody: FC<RigidBodyProps> = (props) => {
    const entity = useParent();
    const { isPhysicsEnabled, isPhysicsLoaded, physicsError } = usePhysics();

    useEffect(() => {
        if (!isPhysicsEnabled) {
            throw new Error(
                'The `<RigidBody>` component requires `usePhysics` to be set on the Application. ' +
                'Please add `<Application usePhysics/>` to your root component.'
            );
        }

        if (physicsError) {
            throw new Error(
                `Failed to initialize physics: ${physicsError.message}. ` +
                'This might be due to network issues or browser compatibility problems.'
            );
        }
    }, [isPhysicsEnabled, physicsError]);

    // If no type is defined, infer if possible from a render component
    const type = entity.render && props.type === undefined ? entity.render.type : props.type;

    // Only create the component if physics is loaded
    if (isPhysicsLoaded) {
        useComponent("rigidbody", { ...props, type });
    }

    return null;
}