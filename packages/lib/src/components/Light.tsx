import { FC } from "react";
import { useComponent } from "../hooks";
import { useColors, WithCssColors } from "../utils/color";
import { Entity, LightComponent } from "playcanvas";
import { PublicProps } from "../utils/types-utils";
import { createSchema, validateAndSanitizeProps } from "../utils/validation";

/**
 * The Light component adds a light source to the entity. A light can be a directional, omni, or spot light.
 * Lights can be moved and orientated with the `position` and `rotation` props of its entity.
 * @param {LightProps} props - The props to pass to the light component.
 * 
 * @example
 * <Entity rotation={[0, 10, 0]}>
 *  <Light type="directional" />
 * </Entity>
 */
export const Light: FC<LightProps> = (props) => {

    const safeProps = validateAndSanitizeProps(props as Partial<LightComponent>, schema, 'Light');
    const colorProps = useColors(safeProps, ['color'])

    useComponent("light", { ...safeProps, ...colorProps });
    return null

}

interface LightProps extends Partial<WithCssColors<PublicProps<LightComponent>>> {
    type: "directional" | "omni" | "spot";
}

const schema = createSchema(
    () => new Entity().addComponent('light') as LightComponent,
    (component) => (component as LightComponent).system.destroy()
)