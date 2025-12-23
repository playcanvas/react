import { Application, Entity } from '@playcanvas/react'
import { Camera, GSplat, Light, Script } from '@playcanvas/react/components'
import { useSplat } from '@playcanvas/react/hooks'
import {
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  TONEMAP_ACES,
  SHADOW_PCSS_32F,
  Vec3
} from 'playcanvas'
// @ts-expect-error - CameraControls types not available
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs'
import { BackLink, StatusOverlay } from '@/components'

// @ts-expect-error - Grid types not available
import { Grid as GridScript } from "playcanvas/scripts/esm/grid.mjs";
import { FC } from "react";
import { ShadowCatcher } from '@/components/ShadowCatcher'

const Grid: FC = ({ ...props }) => {
    return <Entity scale={[1000, 1, 1000]}>
        <Script script={GridScript} {...props} />
    </Entity>
}
function Scene() {
  const { asset, loading, error } = useSplat('./biker.compressed.ply')

  if (error) {
    return <StatusOverlay status="error" message={error} />
  }

  if (loading || !asset) {
    return <StatusOverlay status="loading" />
  }

  return (
    <>
      <ShadowCatcher width={15} depth={15} intensity={0.75} />
      <Grid />
      {/* Camera with Orbit Controls */}
      <Entity position={[-0.8, 2, 6]}>
        <Camera
          clearColor={"#333333"}
          toneMapping={TONEMAP_ACES}
        />
        <Script
          script={CameraControls}
          sceneSize={10}
          focusPoint={new Vec3(-1.5, 0.05, 0)}
          // enableOrbit={true}
          // enablePan={true}
          enableFly={false}
          inertiaFactor={0.2}
        />
      </Entity>

      {/* Biker GSplat */}
      <Entity name="biker" position={[-1.5, 0.05, 0]} rotation={[180, 90, 0]} scale={[0.7, 0.7, 0.7]}>
        <GSplat 
          asset={asset} 
          castShadows={false}
        />
      </Entity>


      {/* Directional light with shadows */}
      <Entity name="directionalLight" rotation={[55, 0, 20]}>
        <Light
          type="directional"
          color={"#ffffff"}
          castShadows={true}
          intensity={1}
          shadowBias={0.2}
          normalOffsetBias={0.05}
          shadowDistance={10}
          shadowIntensity={0.5}
          shadowResolution={2048}
          shadowType={SHADOW_PCSS_32F}
          penumbraSize={10}
          penumbraFalloff={4}
          shadowSamples={16}
          shadowBlockerSamples={16}
        />
      </Entity>
    </>
  )
}

function SimpleSplat() {
  return (
    <>
      <BackLink />
      <Application
        fillMode={FILLMODE_FILL_WINDOW}
        resolutionMode={RESOLUTION_AUTO}
        // Disable anti-aliasing as gaussian splats do not benefit from it and it's expensive
        graphicsDeviceOptions={{ antialias: false }}
      >
        <Scene />
      </Application>
    </>
  )
}

export default SimpleSplat
