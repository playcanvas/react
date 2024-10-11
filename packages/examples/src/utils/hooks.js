import { TEXTURETYPE_RGBP } from "playcanvas"
import { useApp } from "@playcanvas/react"
import { useQuery } from "@tanstack/react-query";
import { fetchAsset } from "@playcanvas/react/utils"

export const useAsset = (src, type, props) => {
    const app = useApp();
  
    return useQuery({ 
      queryKey: [src],
      queryFn: () => fetchAsset(app, src, type, props)
    })
  }
  
export const useEnvMap = (src, props) => useAsset(src, 'texture', { 
    ...props, 
    type: TEXTURETYPE_RGBP, mipmaps: false
});
  
export const useSplat = (src, props) => useAsset(src, 'gsplat', props);
export const useModel = (src, props) => useAsset(src, 'container', props);