import { FC } from "react";
import { useComponent } from "../hooks";
import { useColors, WithCssColors } from "../utils/color";
import { LightComponent } from "playcanvas";
import { PublicProps } from "../utils/types-utils";

interface LightProps extends Partial<WithCssColors<PublicProps<LightComponent>>> {
    type: "directional" | "omni" | "spot";
}

export const Light: FC<LightProps> = (props) => {

    const colorProps = useColors(props, ['color'])

    useComponent("light", { ...props, ...colorProps });
    return null
    
}