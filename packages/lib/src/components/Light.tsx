import { FC } from "react";
import { useComponent } from "../hooks";
import { useColors } from "../utils/color";

type LightProps = {
    type: "directional" | "omni" | "spot";
}

export const Light: FC<LightProps> = (props) => {

    const colorProps = useColors(props, ['color'])

    useComponent("light", { ...props, ...colorProps });
    return null
    
}