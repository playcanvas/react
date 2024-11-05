import { FC } from "react";
import { useComponent } from "../hooks";

type LightProps = {
    type: string;
}

export const Light: FC<LightProps> = (props) => {

    useComponent("light", props);
    return null
    
}