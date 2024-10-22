import { FC } from "react";
import { useComponent } from "../hooks";
interface LightProps {
    type: string;
}

export const Light: FC<LightProps> = (props) => {

    useComponent("light", props);
    return null
    
}