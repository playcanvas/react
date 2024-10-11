import { Container, Entity } from "@playcanvas/react"
import { Camera, Script, EnvAtlas, GSplat } from "@playcanvas/react/components"
import { CameraFrame, OrbitControls, Grid } from "@playcanvas/react/scripts"

import { useEnvMap, useModel, useSplat } from "./utils/hooks"

export const Game = () => {
  
    const { data: envMap } = useEnvMap('/assets/outdoor_umbrellas_2k.png');
    const { data: model } = useModel('/assets/statue.glb');
    const { data: splat } = useSplat('/assets/biker.ply');

    return <>

        <EnvAtlas asset={envMap} />

        <Entity>
          <Camera/>
          <OrbitControls inertiaFactor={0.1} />
          <Script script={CameraFrame} />
          {/* <Script script={Grid} /> */}
        </Entity>

        <Entity scale={[1, 1, 1]}>
          <Container asset={model} />
          {/* <GSplat asset={splat} /> */}
        </Entity>
    
    </>
}