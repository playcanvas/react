"use client"

import { FC } from "react";
import { useComponent } from "../hooks";
import { Color } from "playcanvas";
import { useColors } from "../utils/color";

interface CameraProps {
    [key: string]: unknown;
    clearColor?: Color | string
}

/**
 * The Camera component is used to define the position and properties of a camera entity. 
 */
export const Camera: FC<CameraProps> = (props) => {

    const colorProps = useColors(props, ['clearColor'])

    useComponent("camera", { ...props, ...colorProps });
    return null;

}