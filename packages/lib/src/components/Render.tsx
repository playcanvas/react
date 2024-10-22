import { FC } from "react";
import { useComponent } from "../hooks";

interface RenderProps {
}

export const Render: FC<RenderProps> = (props) => {

    useComponent("render", props);
    return null;

}