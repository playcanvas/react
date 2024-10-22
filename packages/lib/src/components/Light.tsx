import { FC } from "react";
import { useComponent } from "../hooks";
interface LighttProps {
    type: string;
}

export const Light: FC<LighttProps> = (props) => {

    useComponent("light", props);
    return null
    
}