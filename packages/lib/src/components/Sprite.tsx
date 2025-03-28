import { FC } from "react";
import { useComponent } from "../hooks";
import { PublicProps } from "../utils/types-utils";
import { type Asset, SpriteComponent } from "playcanvas";

interface SpriteProps extends Partial<PublicProps<SpriteComponent>> {
    asset : Asset
}

export const Sprite: FC<SpriteProps> = ({ ...props }) => {

    useComponent("sprite", props);
    return null;

}