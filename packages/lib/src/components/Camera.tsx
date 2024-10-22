import { FC } from "react";
import { useComponent } from "../hooks";

interface CameraProps {
    [key: string]: any;
}

export const Camera: FC<CameraProps> = (props : any) => {

    useComponent("camera", props);
    return null;

}