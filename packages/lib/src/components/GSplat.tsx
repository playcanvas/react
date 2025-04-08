"use client"

import { FC, useLayoutEffect, useRef } from "react";
import { useParent } from "../hooks";
import { Asset, Entity, GSplatComponent } from "playcanvas";
import { PublicProps } from "../utils/types-utils";
import { Schema, validatePropsWithDefaults, createComponentDefinition, ComponentDefinition, getStaticNullApplication } from "../utils/validation";

/**
 * The GSplat component allows an entity to render a Gaussian Splat.
 * @param {GSplatProps} props - The props to pass to the GSplat component.
 * @see https://api.playcanvas.com/engine/classes/GSplatComponent.html
 * @example
 * const { data: splat } = useSplat('./splat.ply')
 * <GSplat asset={splat} />
 */
export const GSplat: FC<GSplatProps> = (props) => {

    const safeProps = validatePropsWithDefaults(props, componentDefinition as ComponentDefinition<GSplatProps>);

    const { asset, vertex, fragment } = safeProps;
    const parent: Entity = useParent();
    const assetRef = useRef<Entity | null>(null);

    useLayoutEffect(() => {
        if (asset) {
            assetRef.current = asset.resource.instantiate({ vertex, fragment });
            if (assetRef.current) parent.addChild(assetRef.current);
        }

        return () => {
            if (!assetRef.current) return;
            parent.removeChild(assetRef.current);
        };
    }, [asset]);

    return null;
};

interface GSplatProps extends Partial<PublicProps<GSplatComponent>> {
    /**
     * The asset to use for the GSplat.
     */
    asset: Asset;
    /**
     * The vertex shader to use for the GSplat.
     */
    vertex?: string;
    /**
     * The fragment shader to use for the GSplat.
     */
    fragment?: string;
}

const componentDefinition = createComponentDefinition(
    "GSplat",
    () => new Entity("mock-gsplat", getStaticNullApplication()).addComponent('gsplat') as GSplatComponent,
    (component) => (component as GSplatComponent).system.destroy(),
    "GSplatComponent"
)

// include additional props
componentDefinition.schema = {
    ...componentDefinition.schema,
    asset: {
        validate: (value: unknown) => value instanceof Asset,
        errorMsg: (value: unknown) => `Invalid value for prop "asset": ${value}. Expected an Asset.`,
        default: undefined
    },
    vertex: {
        validate: (value: unknown) => !value || typeof value === 'string',
        errorMsg: (value: unknown) => `Vertex shader must be a string, received ${value}`,
        default: null // Allows engine to handle the default shader
    },
    fragment: {
        validate: (value: unknown) => !value || typeof value === 'string',    
        errorMsg: (value: unknown) => `Fragment shader must be a string, received ${value}`,
        default: null // Allows engine to handle the default shader
    }
} as Schema<GSplatComponent>