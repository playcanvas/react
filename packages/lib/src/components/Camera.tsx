import { FC } from "react";
import { useComponent } from "../hooks";

interface CameraProps {
    [key: string]: any;
}

/**
 * The Camera component is used to define the position and properties of a camera entity. 
 */
export const Camera: FC<CameraProps> = (props : any) => {

    useComponent("camera", props);
    return null;

}