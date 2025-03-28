"use client"

import { FC } from "react";
import { useComponent } from "../hooks";
import { CameraComponent } from "playcanvas";
import { useColors, WithCssColors } from "../utils/color";
import { PublicProps } from "../utils/types-utils";

type CameraProps = Partial<WithCssColors<PublicProps<CameraComponent>>>;

/**
 * The Camera component is used to define the position and properties of a camera entity. 
 */
export const Camera: FC<CameraProps> = (props) => {

    const colorProps = useColors(props, ['clearColor'])

    useComponent("camera", { ...props, ...colorProps });
    return null;

}