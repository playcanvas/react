"use client"

import { FC } from "react";
import { useComponent } from "../hooks";
import { Container } from "../Container";
import { Asset, Entity, type RenderComponent as PcRenderComponent } from "playcanvas";
import { PublicProps } from "../utils/types-utils";
import { ComponentProps } from "../hooks/use-component";
import { getStaticNullApplication, validateAndSanitizeProps, ComponentDefinition } from "../utils/validation";
import { createComponentDefinition } from "../utils/validation";

const RenderComponent: FC<ComponentProps> = (props) => {
    useComponent("render", props);
    return null;
}

/**
 * A Render component allows an entity to render a 3D model. You can specify the type of model to render with the `type` prop,
 * which can be a primitive shape, or a model asset.
 * 
 * @param {RenderProps} props - The props to pass to the render component.
 * @see https://api.playcanvas.com/engine/classes/RenderComponent.html
 * 
 * @example
 * const { data: asset } = useAsset('./statue.glb')
 * <Entity name='Box'   >
 *  <Render type="box" />
 * </Entity>
 * 
 * @example
 * <Entity name='asset'>
 *  <Render type="asset" asset={asset} />
 * </Entity>
 */
export const Render: FC<RenderProps> = (props : RenderProps) => {

    const safeProps = validateAndSanitizeProps(props, componentDefinition as ComponentDefinition<RenderProps>);

    // Render a container if the asset is a container
    if (safeProps.asset?.type === 'container') {
        return <Container asset={safeProps.asset as Asset} >
            { safeProps.children }
        </Container>
    }

    // Otherwise, render the component
    return <RenderComponent {...safeProps} />;
}


const primitiveTypes = ["asset", "box", "capsule", "cone", "cylinder", "plane", "sphere", "torus"] as const;
type PrimitiveType = typeof primitiveTypes[number];

interface RenderProps extends Omit<Partial<PublicProps<PcRenderComponent>>, 'asset'> {
    /**
     * The type of primitive shape to render.
     * @default "box"
     */
    type: PrimitiveType;
    /**
     * The asset to render.
     */
    asset?: Asset;
    children?: React.ReactNode;
}

const componentDefinition = createComponentDefinition(
    "Render",
    () => new Entity('mock-render', getStaticNullApplication()).addComponent('render') as PcRenderComponent,
    (component) => (component as PcRenderComponent).system.destroy(),
    "RenderComponent"   
)

componentDefinition.schema = {
    ...componentDefinition.schema,
    asset: {
        validate: (value: unknown) => value instanceof Asset,
        errorMsg: (value: unknown) => `Invalid value for prop "asset": ${value}. Expected an Asset.`,
        default: undefined
    },
    type: {
        validate: (value: unknown) => typeof value === 'string' && primitiveTypes.includes(value as PrimitiveType),
        errorMsg: (value: unknown) => `Invalid value for prop "type": ${value}. Expected one of: "${primitiveTypes.join('", "')}".`,
        default: "box"
    }
}

export default Render;
