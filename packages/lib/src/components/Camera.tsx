"use client"

import { FC } from "react";
import { useComponent } from "../hooks";
import { CameraComponent, Entity } from "playcanvas";
import { useColors, WithCssColors } from "../utils/color";
import { PublicProps } from "../utils/types-utils";
import { validateAndSanitizeProps, createComponentDefinition, ComponentDefinition, getStaticNullApplication } from "../utils/validation";

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

    const safeProps = validateAndSanitizeProps(props as Record<string, unknown>, componentDefinition as ComponentDefinition<CameraProps>);

    const colorProps = useColors(safeProps, ['clearColor'])

    useComponent("camera", { ...safeProps, ...colorProps });
    return null;

}

type CameraProps = Partial<WithCssColors<PublicProps<CameraComponent>>>;

const componentDefinition = createComponentDefinition(
    "Camera",
    () => new Entity("mock-camera", getStaticNullApplication()).addComponent('camera') as CameraComponent,
    (component) => (component as CameraComponent).system.destroy(),
    "CameraComponent"
)