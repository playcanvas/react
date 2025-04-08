"use client"

import { FC, useEffect, useLayoutEffect } from "react";
import { useApp } from "../hooks";
import { Application, Asset } from "playcanvas";
import { createComponentDefinition, getStaticNullApplication, validatePropsWithDefaults } from "../utils/validation";

interface EnvAtlasProps {
    asset: Asset;
    intensity?: number;
    showSkybox?: boolean;
}

/**
 * An environment atlas is a texture for rendering a skybox and global reflections.
 */
export const EnvAtlas: FC<EnvAtlasProps>= (props) => {

    const safeProps = validatePropsWithDefaults(props, componentDefinition);
    const { asset, intensity } = safeProps;

    const app: Application = useApp();
    
    useEffect(() => {
        if (!asset?.resource) return;
        console.log(asset.loaded);
        console.log('updating env atlas', !!asset.resource);
        app.scene.envAtlas = asset.resource;
        
        // const layer = app?.scene?.layers?.getLayerByName('Skybox');
        
        // if(layer) {
        //     layer.enabled = showSkybox ?? true;
        // }
    
        app.scene.skyboxIntensity = intensity ?? 1;
        app.scene.skyboxLuminance = intensity ?? 1;

        // return () => {
        //     if(app && app.scene) {
        //         // @ts-expect-error `envAtlas` should support @type {Texture | null}
        //         app.scene.envAtlas = null;
        //     }
        // }

    }, [app, asset?.resource]);


    // useLayoutEffect(() => {
    //     if (!asset?.resource) return;
    //     // console.log('updating intensity', intensity);
        
    //     console.log(app)

    //     console.log("intensity", app.scene.skyboxIntensity, intensity);
    // }, [app, showSkybox, intensity, asset?.resource]);

    return null

}

const componentDefinition = {
    name: "EnvAtlas",
    schema: {
        asset: {
            validate: (value: unknown) => {
                console.warn('asset', value, value instanceof Asset);
                return !value || value instanceof Asset;
            },
            errorMsg: (value: unknown) => `Invalid value for prop "asset": ${value}. Expected an Asset.`,
            default: null
        },
        intensity: {
            validate: (value: unknown) => typeof value === "number",
            errorMsg: (value: unknown) => `Invalid value for prop "intensity": ${value}. Expected a number.`,
            default: 1
        },
        showSkybox: {
            validate: (value: unknown) => typeof value === "boolean",
            errorMsg: (value: unknown) => `Invalid value for prop "showSkybox": ${value}. Expected a boolean.`,
            default: true
        }
    }
}