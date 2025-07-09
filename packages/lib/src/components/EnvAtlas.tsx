"use client"

import { FC, useEffect, useLayoutEffect } from "react";
import { useApp } from "../hooks/index.ts";
import { Application, Asset, Texture } from "playcanvas";
import { validatePropsWithDefaults } from "../utils/validation.ts";

interface EnvAtlasProps {
    /**
     * The asset to use for the environment atlas.
     */
    asset: Asset;
    /**
     * The intensity of the skybox.
     * @default 1
     */
    skyboxIntensity?: number;
    /**
     * The luminance of the skybox.
     * @default 1
     */
    skyboxLuminance?: number;
    /**
     * Whether to show the skybox.
     * @default true
     */
    showSkybox?: boolean;
}

/**
 * An environment atlas is a texture for rendering a skybox and global reflections.
 * @deprecated This component is deprecated. 
 * Use the <Environment envAtlas={asset} /> component instead.
 */
export const EnvAtlas: FC<EnvAtlasProps>= (props) => {

    const safeProps = validatePropsWithDefaults(props, componentDefinition);
    const { asset, skyboxIntensity = 1, skyboxLuminance = 1, showSkybox = true } = safeProps;
    const app: Application = useApp();
    const layer = app?.scene?.layers?.getLayerByName('Skybox');

    useEffect(() => {
        if (!asset?.resource) return;
        app.scene.envAtlas = asset.resource as Texture;
    
        return () => {
            if(app && app.scene) {
                app.scene.envAtlas = null;
            }
        }

    }, [app, asset?.resource]);


    useLayoutEffect(() => {
        if (!asset?.resource || !layer) return;
        
        
        if(layer) {
            layer.enabled = showSkybox;
        }
    
        app.scene.skyboxIntensity = skyboxIntensity;
        app.scene.skyboxLuminance = skyboxLuminance;

    }, [asset?.resource, layer, skyboxIntensity, skyboxLuminance, showSkybox]);

    return null

}

const componentDefinition = {
    name: "EnvAtlas",
    schema: {
        asset: {
            validate: (value: unknown) => !value || value instanceof Asset,
            errorMsg: (value: unknown) => `Invalid value for prop "asset": ${value}. Expected an Asset.`,
            default: null
        },
        skyboxIntensity: {
            validate: (value: unknown) => typeof value === "number",
            errorMsg: (value: unknown) => `Invalid value for prop "skyboxIntensity": ${value}. Expected a number.`,
            default: 1
        },
        skyboxLuminance: {
            validate: (value: unknown) => typeof value === "number",
            errorMsg: (value: unknown) => `Invalid value for prop "skyboxLuminance": ${value}. Expected a number.`,
            default: 1
        },
        showSkybox: {
            validate: (value: unknown) => typeof value === "boolean",
            errorMsg: (value: unknown) => `Invalid value for prop "showSkybox": ${value}. Expected a boolean.`,
            default: true
        }
    }
}