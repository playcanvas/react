"use client"

import { FC } from "react";
import { useComponent } from "../hooks/index.ts";
import { CameraComponent, Entity } from "playcanvas";
import { PublicProps, Serializable } from "../utils/types-utils.ts";
import { validatePropsPartial, createComponentDefinition, getStaticNullApplication } from "../utils/validation.ts";

/**
 * The Camera component makes an entity behave like a camera and gives you a view into the scene.
 * Moving the container entity will move the camera.
 * 
 * @param {CameraProps} props - The props to pass to the camera component.
 * 
 * @example
 * <Entity>
 *   <Camera fov={75} near={0.1} far={1000} />
 * </Entity>
 */
export const Camera: FC<CameraProps> = (props) => {

    const safeProps = validatePropsPartial(props, componentDefinition);

    useComponent("camera", safeProps, componentDefinition.schema);
    return null;

}

type CameraProps = Partial<Serializable<PublicProps<CameraComponent>>>;

const componentDefinition = createComponentDefinition<CameraProps, CameraComponent>(
    "Camera",
    () => new Entity("mock-camera", getStaticNullApplication()).addComponent('camera') as CameraComponent,
    (component) => (component as CameraComponent).system.destroy(),
    { apiName: "CameraComponent" }
)

export { componentDefinition as cameraComponentDefinition };