import { SHADERPASS_WORLDNORMAL, TEXTURETYPE_RGBP } from "playcanvas"

import { Container, Entity, useApp } from "@playcanvas/react"
import { Camera, Script, EnvAtlas } from "@playcanvas/react/components"
import { CameraFrame, OrbitControls } from "@playcanvas/react/scripts"
import { fetchAsset } from "@playcanvas/react/utils"

import { useQuery } from '@tanstack/react-query';
import { Render } from "@playcanvas/react/components"

const useAsset = (src, type, props) => {
  const app = useApp();

  return useQuery({ 
    queryKey: [src],
    queryFn: () => fetchAsset(app, src, type, props)
  })
}

const useEnvMap = (src, props) => useAsset(src, 'texture', { 
  ...props, 
  type: TEXTURETYPE_RGBP, mipmaps: false
});

const useSplat = (src, props) => useAsset(src, 'gsplat', props);
const useModel = (src, props) => useAsset(src, 'container', props);

export const Game = () => {
  
    const { data: envMap } = useEnvMap('/assets/outdoor_umbrellas_2k.png');
    const { data: model } = useModel('/assets/statue.glb');

    return <>

        <EnvAtlas asset={envMap} />

        <Entity>
          <Camera/>
          <OrbitControls inertiaFactor={0.1} />
          <Script script={CameraFrame} />
        </Entity>

        <Entity scale={[1, 1, 1]}>
          {/* <Container asset={model} /> */}
          <Render type={'box'} />
        </Entity>
    
    </>
}