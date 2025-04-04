"use client"

import { FC } from "react";
import { useComponent } from "../hooks";
import { Container } from "../Container";
import { Asset } from "playcanvas";
import { type RenderComponent as PcRenderComponent } from "playcanvas";
import { PublicProps } from "../utils/types-utils";
import { ComponentProps } from "../hooks/use-component";

type RenderComponentType = Partial<PublicProps<PcRenderComponent>>;
type RenderComponentTypeWithoutAsset = Omit<RenderComponentType, 'asset'>;

interface RenderProps extends RenderComponentTypeWithoutAsset {
    type: string;
    asset?: Asset;
    children?: React.ReactNode;
}

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

    // Render a container if the asset is a container
    if (props.asset?.type === 'container') {
        return <Container asset={props.asset as Asset} >
            { props.children }
        </Container>
    }

    // Otherwise, render the component
    return <RenderComponent {...props} />;
}