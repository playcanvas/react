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
 *  Create a render component on an entity. If the asset is a container, 
 * it will be rendered as a container. Otherwise, it will be rendered as a 
 * render component.
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