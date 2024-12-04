import { FC } from "react";
import { useComponent, useParent } from "../hooks";

type RigidBodyProps = {
    [key: string]: unknown;
}

export const RigidBody: FC<RigidBodyProps> = (props) => {

    const entity = useParent();

    // @ts-ignore Ammo is defined in the global scope in the browser
    if(!globalThis.Ammo && process.env.NODE_ENV !== 'production' ) {
        throw new Error('The `<RigidBody>` component requires `usePhysics` to be set on the Application. `<Application usePhysics/>` ')
    }

    // If no type is defined, infer if possible from a render component
    const type = entity.render && props.type === undefined ? entity.render.type : props.type;

    useComponent("rigidbody", { ...props, type } );
    return null
    
}