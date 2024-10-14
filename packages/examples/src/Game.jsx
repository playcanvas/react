import { Container, Entity } from "@playcanvas/react"
import { Camera, Script, EnvAtlas } from "@playcanvas/react/components"
import { CameraFrame, OrbitControls } from "@playcanvas/react/scripts"

import { useEnvMap, useModel } from "./utils/hooks"

export const Game = () => {
  
    const { data: envMap, isPending: isEnvLoading } = useEnvMap('/assets/ballroom_2k.png');
    const { data: model, isPending: isModeLoading } = useModel('/assets/statue.glb');

    // Don't render unless the 
    if(isEnvLoading || isModeLoading) return null;

    return <>

        <EnvAtlas asset={envMap} />

        <Entity >
          <Camera />
          <OrbitControls inertiaFactor={0.1} />
          <Script script={CameraFrame} />
        </Entity>

        <Entity name='Asset' scale={[1, 1, 1]}>
          <Container asset={model} />
        </Entity>
    
    </>
}