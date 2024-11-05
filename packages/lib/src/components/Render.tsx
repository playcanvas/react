import { FC } from "react";
import { useComponent } from "../hooks";

interface RenderProps {
    type: string;
    [key: string]: unknown;
}

export const Render: FC<RenderProps> = (props) => {

    useComponent("render", props);
    return null;

}