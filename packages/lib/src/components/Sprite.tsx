import { FC } from "react";
import { useComponent } from "../hooks";

interface SpriteProps {
}

export const Sprite: FC<SpriteProps> = (props) => {

    useComponent("sprite", props);
    return null;

}