import { FC } from "react";
import { useComponent } from "../hooks";
import { useColors, WithCssColors } from "../utils/color";
import { Entity, LightComponent } from "playcanvas";
import { PublicProps } from "../utils/types-utils";
import { validateAndSanitizeProps, createComponentDefinition, ComponentDefinition, getStaticNullApplication, Schema } from "../utils/validation";

/**
 * The Light component adds a light source to the entity. A light can be a directional, omni, or spot light.
 * Lights can be moved and orientated with the `position` and `rotation` props of its entity.
 * 
 * @param {LightProps} props - The props to pass to the light component.
 * @see https://api.playcanvas.com/engine/classes/LightComponent.html
 * 
 * @example
 * <Entity rotation={[0, 10, 0]}>
 *  <Light type="directional" />
 * </Entity>
 */
export const Light: FC<LightProps> = (props) => {

    const safeProps = validateAndSanitizeProps(props as Partial<LightComponent>, componentDefinition as ComponentDefinition<LightProps>);
    const colorProps = useColors(safeProps, ['color'])

    useComponent("light", { ...safeProps, ...colorProps });
    return null

}

interface LightProps extends Partial<WithCssColors<PublicProps<LightComponent>>> {
    type: "directional" | "omni" | "spot";
}

const componentDefinition = createComponentDefinition(
    "Light",
    () => new Entity('mock-light', getStaticNullApplication()).addComponent('light') as LightComponent,
    (component) => (component as LightComponent).system.destroy(),
    "LightComponent"
)

componentDefinition.schema = {
    ...componentDefinition.schema,
    type: {
        validate: (value: unknown) => typeof value === 'string' && ['directional', 'omni', 'spot'].includes(value as string),
        errorMsg: (value: unknown) => `Invalid value for prop "type": ${value}. Expected one of: "directional", "omni", "spot".`,
        default: "directional"
    }
} as Schema<LightProps>