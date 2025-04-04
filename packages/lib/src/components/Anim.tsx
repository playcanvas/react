"use client"

import { FC, useLayoutEffect } from "react";
import { useComponent, useParent } from "../hooks";
import { AnimComponent, Asset, Entity } from "playcanvas";
import { PublicProps } from "../utils/types-utils";
import { WithCssColors } from "../utils/color";
import { validateAndSanitizeProps, createComponentDefinition, ComponentDefinition, getStaticNullApplication } from "../utils/validation";

/**
 * The Anim component allows an entity to play animations.
 * GLB's and GLTF's often contain animations. When you attach this component to an entity,
 * it will automatically animate them. You'll also need a Render component to display the entity.
 * 
 * @param {AnimProps} props - The props to pass to the animation component.
 * @see https://api.playcanvas.com/engine/classes/AnimComponent.html
 * 
 * @example
 * <Entity>
 *   <Render type="asset" asset={asset} />
 *   <Anim asset={asset} clip="Walk" loop />
 * </Entity>
 */
export const Anim: FC<AnimProps> = ({ asset, ...props }) => {

    const safeProps = validateAndSanitizeProps(props as Record<string, unknown>, componentDefinition as ComponentDefinition<AnimProps>);

    // Create the anim component
    useComponent("anim", safeProps as Partial<AnimComponent>);

    // Get the associated Entity
    const entity : Entity = useParent();

    // Assign Asset animations to Anim component
    useLayoutEffect(() => {

        const anim : AnimComponent | undefined = entity.anim

        // Early out if component instantiation fails, or the asset contains no animations
        if(!anim || !asset?.resource?.animations || asset.resource.animations.length === 0) return;
        
        // Filter out non animations, and assign animations to component
        asset.resource.animations
            .filter((animation: Asset) => animation.type ==='animation')
            .forEach((animation: Asset) => {
                anim.assignAnimation('animation', animation.resource)
            });

    }, [asset?.id, entity.getGuid()])

    return null;
}

interface AnimProps extends Partial<WithCssColors<PublicProps<AnimComponent>>> {
    asset : Asset
}


const componentDefinition = createComponentDefinition(
    "Anim",
    () => new Entity("mock-anim", getStaticNullApplication()).addComponent('anim') as AnimComponent,
    (component) => (component as AnimComponent).system.destroy()
)