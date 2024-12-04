"use client"

import { FC, useLayoutEffect } from "react";
import { useComponent, useParent } from "../hooks";
import { AnimComponent, Asset, Entity } from "playcanvas";

interface AnimProps {
    [key: string]: unknown;
    asset : Asset
}

/**
 * The Camera component is used to define the position and properties of a camera entity. 
 */
export const Anim: FC<AnimProps> = ({ asset, ...props }) => {

    // Create the anim component
    useComponent("anim", props);

    // Get the associated Entity
    const entity : Entity = useParent();

    // Assign Asset animations to Anim component
    useLayoutEffect(() => {

        const anim : AnimComponent | undefined = entity.anim

        if( asset?.resource ) console.log('anim', asset.resource);

        // Early out if component instantiation fails, or the asset contains no animations
        if(!anim || !asset?.resource?.animations || asset.resource.animations.length === 0) return;

        console.log('animations', asset.resource.animations);
        
        // Filter out non animations, and assign animations to component
        asset.resource.animations
            .filter((animation: Asset) => animation.type ==='animation')
            .forEach((animation: Asset) => {
                anim.assignAnimation('animation', animation.resource)
            });

    }, [asset?.id, entity.getGuid()])

    return null;
}