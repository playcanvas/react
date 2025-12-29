import { useRef, ComponentRef } from 'react'
import { Application, Entity } from '@playcanvas/react'
import { Camera, GSplat, Script } from '@playcanvas/react/components'
import { useSplat, useAppEvent } from '@playcanvas/react/hooks'
import {
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  TONEMAP_ACES,
  Vec3
} from 'playcanvas'
// @ts-expect-error - CameraControls types not available
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs'
// @ts-expect-error - Grid types not available
import { Grid as GridScript } from 'playcanvas/scripts/esm/grid.mjs'
import { BackLink, StatusOverlay } from '@/components'
import { FC } from 'react'

const Grid: FC = () => {
  return (
    <Entity scale={[1000, 1, 1000]}>
      <Script script={GridScript} />
    </Entity>
  )
}

function Scene() {
  // Load splat assets - use local biker from public folder
  const { asset: bikerAsset, loading: bikerLoading, error: bikerError } = useSplat('./biker.compressed.ply')

  // Ref for entity rotation animation  
  const rotatingRef = useRef<ComponentRef<typeof Entity>>(null);

  // Rotate one of the splats each frame for visual interest
  useAppEvent('update', (dt: number) => {
    if (rotatingRef.current) {
      rotatingRef.current.rotate(0, 30 * dt, 0)
    }
  })

  if (bikerError) {
    return <StatusOverlay status="error" message={bikerError} />
  }

  if (bikerLoading || !bikerAsset) {
    return <StatusOverlay status="loading" />
  }

  return (
    <>
      <Grid />

      {/* First Biker GSplat - center */}
      <Entity 
        name="biker-center" 
        position={[0, 0.05, 0]} 
        rotation={[180, 90, 0]} 
        scale={[0.7, 0.7, 0.7]}
      >
        <GSplat asset={bikerAsset} />
      </Entity>

      {/* Second Biker GSplat - left (cloned) */}
      <Entity 
        name="biker-left" 
        position={[-3, 0.05, 0]} 
        rotation={[180, 45, 0]} 
        scale={[0.7, 0.7, 0.7]}
      >
        <GSplat asset={bikerAsset} />
      </Entity>

      {/* Third Biker GSplat - right, animated rotation */}
      <Entity 
        ref={rotatingRef}
        name="biker-right" 
        position={[3, 0.05, 0]} 
        rotation={[180, -45, 0]} 
        scale={[0.7, 0.7, 0.7]}
      >
        <GSplat asset={bikerAsset} />
      </Entity>

      {/* Camera with Orbit Controls */}
      <Entity position={[-3, 2, 8]}>
        <Camera
          clearColor="#333333"
          toneMapping={TONEMAP_ACES}
        />
        <Script
          script={CameraControls}
          sceneSize={15}
          focusPoint={new Vec3(0, 0.5, 0)}
          enableFly={false}
          inertiaFactor={0.2}
        />
      </Entity>
    </>
  )
}

function MultiSplat() {
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

export default MultiSplat

