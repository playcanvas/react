"use client"

import { FC, ReactElement, createContext, useContext } from "react";
import { useComponent } from "../hooks/index.ts";
import { MeshInstance } from "./MeshInstance.tsx";
import { Asset, Entity, MeshInstance as PcMeshInstance, type RenderComponent as PcRenderComponent } from "playcanvas";
import { PublicProps, Serializable } from "../utils/types-utils.ts";
import { getStaticNullApplication, validatePropsPartial, Schema } from "../utils/validation.ts";
import { createComponentDefinition } from "../utils/validation.ts";
import { Container } from "../Container.tsx";

const MeshInstanceContext = createContext<((instance: PcMeshInstance) => void) | null>(null);

export const useMeshInstanceRegistration = () => useContext(MeshInstanceContext);

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
    // console.log('Render', props.material.diffuse);
    const safeProps = validatePropsPartial(props, componentDefinition);

    // Don't render if the type is asset and the asset is not provided
    if(safeProps.type === "asset" && !safeProps.asset) return null;

    // Render a container if the asset is a container
    if (safeProps.asset?.type === 'container') {
        return <Container asset={safeProps.asset as Asset} >
            { safeProps.children }
        </Container>
    }

    // console.log('safeProps', safeProps);

    // Otherwise, render the component
    return <RenderComponent {...safeProps as Serializable<RenderProps>} >
        { safeProps.children }
    </RenderComponent>;
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
    /**
     * A set of MeshInstance components to render.
     */
    children?:  ReactElement<typeof MeshInstance> | ReactElement<typeof MeshInstance>[];
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
