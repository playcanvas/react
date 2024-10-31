import { Asset, TEXTURETYPE_RGBP } from "playcanvas"
import { useApp } from "@playcanvas/react/hooks"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAsset } from "@playcanvas/react/utils"
import { useCallback, useEffect, useLayoutEffect } from "react";

export const useAsset = (src, type, props) => {
    const app = useApp();
    const queryClient = useQueryClient();
    const queryKey = [app.root?.getGuid(), src, type, props];

    // Construct a query for the asset
    const query = useQuery({ 
        queryKey,
        queryFn: () => app && fetchAsset(app, src, type, props)
    })

    // Create a `release` that removes the query from the cache
    const release = useCallback(_ => {  
        queryClient.removeQueries({ queryKey });
    }, [queryClient, ...queryKey] );

    // When a query is removed, delete the corresponding resource
    useLayoutEffect(_ => {
        const unsubscribe = queryClient.getQueryCache().subscribe(({ type, query }) => {
            if (type === "removed") {
                const asset = query.state?.data;
                asset?.unload();
            }
        });
        return unsubscribe;
    }, [queryClient])

    return { ...query, release };
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