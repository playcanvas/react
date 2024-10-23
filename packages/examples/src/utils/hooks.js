import { Asset, TEXTURETYPE_RGBP } from "playcanvas"
import { useApp } from "@playcanvas/react/hooks"
import { useQuery } from "@tanstack/react-query";
import { fetchAsset } from "@playcanvas/react/utils"

export const useAsset = (src, type, props) => {
    const app = useApp();
  
    return useQuery({ 
        queryKey: [src],
        queryFn: () => app && fetchAsset(app, src, type, props)
    })
}

/**
 * Loads a texture asset as an environment atlas
 * 
 * @param {string} src - The URL of the texture asset. 
 * @param {Object} props - Additional properties to pass to the asset loader.
 * @returns {{data: Asset, isPending: boolean}} - The texture asset and its loading state.
 */
export const useEnvAtlas = (src, props) => useAsset(src, 'texture', { 
    ...props, 
    type: TEXTURETYPE_RGBP, mipmaps: false
});
  
export const useSplat = (src, props) => useAsset(src, 'gsplat', props);

/**
 * Loads a glb asset 
 * 
 * @param {string} src - The URL of the glb. 
 * @param {Object} props - Additional properties to pass to the asset loader.
 * @returns {{data: Asset, isPending: boolean}} - The GLB asset and its loading state.
 */
export const useModel = (src, props) => useAsset(src, 'container', props);