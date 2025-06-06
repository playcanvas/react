"use client"

import { FC } from "react";
import { useComponent } from "../hooks";
import { Entity, GSplatComponent } from "playcanvas";
import { PublicProps } from "../utils/types-utils";
import { validatePropsWithDefaults, createComponentDefinition, getStaticNullApplication } from "../utils/validation";
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
    "GSplatComponent"
)