"use client";

import { TEXTURETYPE_RGBP } from "playcanvas"
import { useApp } from "@playcanvas/react/hooks"
import type { AssetOptions } from "@playcanvas/react/hooks"
import { useQuery } from "@tanstack/react-query";
import { fetchAsset } from "@playcanvas/react/utils"

/**
 * Loads an asset using react-query
 * 
 * @param {string} src - The URL of the texture asset. 
 * @param {string} type - The type of asset to load.
 * @param {AssetOptions} [options] - Additional properties to pass to the asset loader.
 * @returns {{ data: Asset, isPending: boolean }} - The texture asset and its loading state.
 */
export const useAsset = (src: string, type: string, options: AssetOptions = {}) => {
    const { props = {}, subscribe } = options;
    const app = useApp();
    const queryKey = [app.root?.getGuid(), src, type, props];

    // Construct a query for the asset
    return useQuery({ 
        queryKey,
        queryFn: () => app && fetchAsset({ app, url: src, type, props, onProgress: subscribe })
    })
}

/**
 * Loads a texture asset as an environment atlas
 * 
 * @param {string} src - The URL of the texture asset. 
 * @param {AssetOptions} [options] - Additional properties to pass to the asset loader.
 * @returns {{ data: Asset, isPending: boolean, release: Function }} - The texture asset and its loading state.
 */
export const useEnvAtlas = (src : string, options: AssetOptions = {}) => useAsset(src, 'texture', { 
    ...options, 
    props: {
        type: TEXTURETYPE_RGBP, 
        mipmaps: false,
        ...options?.props,
    },
});
  
export const useSplat = (src : string, options = {}) => useAsset(src, 'gsplat', options);

/**
 * Loads a glb asset 
 * 
 * @param {string} src - The URL of the glb. 
 * @param {AssetOptions} [options] - Additional properties to pass to the asset loader.
 * @returns {{ data: Asset, isPending: boolean, release: Function }} - The GLB asset and its loading state.
 */
export const useModel = (src : string, options = {}) => useAsset(src, 'container', options);


/**
 * Loads a texture asset
 * 
 * @param {string} src - The URL of the texture asset. 
 * @param {AssetOptions} [options] - Additional properties to pass to the asset loader.
 */
export const useTexture = (src : string, options = {}) => useAsset(src, 'texture', options);
