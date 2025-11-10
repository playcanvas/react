import { FC, useEffect } from "react";
import { useComponent } from "../hooks/index.ts";
import { usePhysics } from "../contexts/physics-context.tsx";
import { createComponentDefinition, getStaticNullApplication, warnOnce, ComponentDefinition, validatePropsPartial, Schema } from "../utils/validation.ts";
import { PublicProps, Serializable } from "../utils/types-utils.ts";
import { BODYTYPE_STATIC, BODYTYPE_DYNAMIC, BODYTYPE_KINEMATIC, Entity, RigidBodyComponent } from "playcanvas";

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

    const { isPhysicsEnabled, isPhysicsLoaded, physicsError } = usePhysics();

    const safeProps = validatePropsPartial(props, componentDefinition as ComponentDefinition<RigidBodyProps, RigidBodyComponent>);

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
                'For more information, see: https://developer.playcanvas.com/user-manual/playcanvas-react/guide/physics'
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
                'For more information, see: https://developer.playcanvas.com/user-manual/playcanvas-react/guide/physics#troubleshooting'
            );
        }
    }, [isPhysicsEnabled, physicsError]);

    // Always call useComponent - it will handle component lifecycle internally
    useComponent(isPhysicsLoaded ? "rigidbody" : null, safeProps, componentDefinition.schema as Schema<RigidBodyProps, RigidBodyComponent> );

    return null;
}

const rigidBodyTypes = [BODYTYPE_STATIC, BODYTYPE_DYNAMIC, BODYTYPE_KINEMATIC] as const;
type RigidBodyType = typeof rigidBodyTypes[number];

interface RigidBodyProps extends Partial<Serializable<PublicProps<RigidBodyComponent>>> {
    /**
     * Sets the rigid body type determines how the body is simulated.
     * @default "static"
     */
    type?: RigidBodyType
}

const componentDefinition = createComponentDefinition(
    "RigidBody",
    () => new Entity("mock-rigidbody", getStaticNullApplication()).addComponent('rigidbody') as RigidBodyComponent,
    (component) => (component as RigidBodyComponent).system.destroy(),
    { apiName: "RigidBodyComponent" }
)


componentDefinition.schema = {
    ...componentDefinition.schema,
    type: {
        validate: (value: unknown) => typeof value === 'string' && rigidBodyTypes.includes(value as RigidBodyType),
        errorMsg: (value: unknown) => `Invalid value for prop "type": ${value}. Expected one of: "${rigidBodyTypes.join(", ")}".`,
        default: "static"
    }
}