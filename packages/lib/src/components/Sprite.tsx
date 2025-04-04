import { FC } from "react";
import { useComponent } from "../hooks";
import { PublicProps } from "../utils/types-utils";
import { Asset, Entity, SpriteComponent } from "playcanvas";
import { createComponentDefinition, validateAndSanitizeProps, Schema, ComponentDefinition, getStaticNullApplication } from "../utils/validation";
import { ComponentProps } from "../hooks/use-component";

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

    const safeProps = validateAndSanitizeProps(props, componentDefinition as ComponentDefinition<SpriteProps>);

    useComponent("sprite", safeProps as unknown as ComponentProps);
    return null;
}

interface SpriteProps extends Partial<PublicProps<SpriteComponent>> {
    asset : Asset
}

const componentDefinition = createComponentDefinition(
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
} as Schema<SpriteProps>