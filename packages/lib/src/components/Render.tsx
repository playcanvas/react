"use client"

import { FC } from "react";
import { useComponent } from "../hooks";
import { Container } from "../Container";
import { Asset, Entity, type RenderComponent as PcRenderComponent } from "playcanvas";
import { PublicProps, Serializable } from "../utils/types-utils";
import { getStaticNullApplication, validatePropsWithDefaults, Schema } from "../utils/validation";
import { createComponentDefinition } from "../utils/validation";

const RenderComponent: FC<RenderProps> = (props) => {
    useComponent("render", props, componentDefinition.schema as Schema<RenderProps, PcRenderComponent>);
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
export const Render: FC<RenderProps> = (props) => {

    const safeProps = validatePropsWithDefaults(props, componentDefinition);

    // Don't render if the type is asset and the asset is not provided
    if(safeProps.type === "asset" && !safeProps.asset) return null;

    console.log("safeProps asset", safeProps.children);

    // Render a container if the asset is a container
    if (safeProps.asset?.type === 'container') {
        return <Container asset={safeProps.asset as Asset} >
            { safeProps.children }
        </Container>
    }

    // Otherwise, render the component
    return <RenderComponent {...safeProps as Serializable<RenderProps>} />;
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

const componentDefinition = createComponentDefinition<RenderProps, PcRenderComponent>(
    "Render",
    () => new Entity('mock-render', getStaticNullApplication()).addComponent('render') as PcRenderComponent,
    (component) => (component as PcRenderComponent).system.destroy(),
    "RenderComponent"   
)

componentDefinition.schema = {
    ...componentDefinition.schema,
    children: {
        validate: (value: unknown) => typeof value === 'object' && value !== null,
        errorMsg: (value: unknown) => `Invalid value for prop "children": ${value}. Expected an object.`,
        default: undefined
    },
    asset: {
        validate: (value: unknown) => !value || value instanceof Asset,
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
