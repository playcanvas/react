import { FC } from "react";
import { useComponent } from "../hooks";

interface SpriteProps {
    [key: string]: unknown;
}

export const Sprite: FC<SpriteProps> = (props) => {

    useComponent("sprite", props);
    return null;

}