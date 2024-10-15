import { Container, Entity } from "@playcanvas/react"
import { Camera, Script, EnvAtlas } from "@playcanvas/react/components"
import { CameraFrame, OrbitControls } from "@playcanvas/react/scripts"

import { useEnvMap, useModel } from "./utils/hooks"
import { useRef } from "react"

export const Game = () => {
  
    const { data: envMap, isPending: isEnvLoading } = useEnvMap('/umbrellas_2k.png');
    const { data: model, isPending: isModeLoading } = useModel('/statue.glb');

    const focusRef = useRef();

  // Don't render unless loaded
  if (isEnvLoading || isModeLoading) return null;
  return (
    <>
      <EnvAtlas asset={envMap} />

      <Entity>
        <Camera />
        <OrbitControls inertiaFactor={0.3} focusEntity={focusRef.current} />
      </Entity>

      <Entity name="Asset" ref={focusRef}>
        <Container asset={model} />
      </Entity>
    </>
  );
}