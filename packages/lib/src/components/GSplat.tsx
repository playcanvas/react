"use client"

import { FC } from "react";
import { useComponent } from "../hooks/index.ts";
import { Asset, Entity, GSplatComponent } from "playcanvas";
import { PublicProps } from "../utils/types-utils.ts";
import { validatePropsWithDefaults, createComponentDefinition, getStaticNullApplication } from "../utils/validation.ts";
/**
 * The GSplat component allows an entity to render a Gaussian Splat.
 * @param {GSplatProps} props - The props to pass to the GSplat component.
 * @see https://api.playcanvas.com/engine/classes/GSplatComponent.html
 * @example
 * const { data: splat } = useSplat('./splat.ply')
 * <GSplat asset={splat} />
 */
export const GSplat: FC<GSplatProps> = (props) => {

    const safeProps = validatePropsWithDefaults<GSplatProps, GSplatComponent>(props, componentDefinition);
    useComponent("gsplat", safeProps, componentDefinition.schema);
    return null

};

type GSplatProps = Partial<PublicProps<GSplatComponent>>

const componentDefinition = createComponentDefinition(
    "GSplat",
    () => new Entity("mock-gsplat", getStaticNullApplication()).addComponent('gsplat') as GSplatComponent,
    (component) => (component as GSplatComponent).system.destroy(),
    { apiName: "GSplatComponent" }
)

componentDefinition.schema = {
    ...componentDefinition.schema,
    asset: {
        validate: (val: unknown) => val instanceof Asset,
        errorMsg: (val: unknown) => `Invalid value for prop "asset": "${JSON.stringify(val)}". Expected an Asset.`,
        default: null
    }
}