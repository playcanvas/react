import { FC } from "react";
import { useComponent } from "../hooks";
import { PublicProps } from "../utils/types-utils";
import { Asset, Entity, SpriteComponent } from "playcanvas";
import { createComponentDefinition, validatePropsWithDefaults, Schema, getStaticNullApplication } from "../utils/validation";

/**
 * The Sprite component allows an entity to render a 2D sprite.
 * 
 * @param {SpriteProps} props - The props to pass to the sprite component.
 * @see https://api.playcanvas.com/engine/classes/SpriteComponent.html
 * @example
 * <Entity>
 *  <Sprite asset={asset} />
 * </Entity>
 */
export const Sprite: FC<SpriteProps> = (props) => {

    const safeProps = validatePropsWithDefaults(props, componentDefinition);

    useComponent("sprite", safeProps, componentDefinition.schema);
    return null;
}

interface SpriteProps extends Partial<PublicProps<SpriteComponent>> {
    asset : Asset
}

const componentDefinition = createComponentDefinition<SpriteProps, SpriteComponent>(
    "Sprite",
    () => new Entity("mock-sprite", getStaticNullApplication()).addComponent('sprite') as SpriteComponent,
    (component) => (component as SpriteComponent).system.destroy(),
    "SpriteComponent"
)

componentDefinition.schema = {
    ...componentDefinition.schema,
    asset: {
        validate: (value: unknown) => value instanceof Asset,
        errorMsg: (value: unknown) => `Invalid value for prop "asset": "${value}". Expected an Asset.`,
        default: null
    }
} as Schema<SpriteProps, SpriteComponent>