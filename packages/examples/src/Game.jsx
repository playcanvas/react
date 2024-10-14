import { Container, Entity } from "@playcanvas/react"
import { Camera, Script, EnvAtlas } from "@playcanvas/react/components"
import { CameraFrame, OrbitControls } from "@playcanvas/react/scripts"

import { useEnvMap, useModel } from "./utils/hooks"

export const Game = () => {
  
    const { data: envMap } = useEnvMap('/assets/outdoor_umbrellas_2k.png');
    const { data: model } = useModel('/assets/statue.glb');

    return <>

        <EnvAtlas asset={envMap} />

        <Entity>
          <Camera/>
          <OrbitControls inertiaFactor={0.1} />
        </Entity>

        <Entity scale={[1, 1, 1]}>
          <Container asset={model} />
        </Entity>
    
    </>
}