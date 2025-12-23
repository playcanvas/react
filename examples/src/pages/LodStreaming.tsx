import { useEffect, useState, useRef } from 'react'
import { Application, Entity } from '@playcanvas/react'
import { Camera, GSplat, Script } from '@playcanvas/react/components'
import { useApp, useSplat, useAppEvent } from '@playcanvas/react/hooks'
import {
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  TONEMAP_ACES,
  Vec3,
  Color,
  platform
} from 'playcanvas'
// @ts-expect-error - CameraControls types not available
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs'
// @ts-expect-error - GsplatRevealRadial types not available
import { GsplatRevealRadial } from 'playcanvas/scripts/esm/gsplat/reveal-radial.mjs'
import { 
  BackLink, 
  StatusOverlay, 
  ControlsPanel, 
  ControlGroup, 
  Checkbox, 
  Select,
  StatsPanel,
  StatRow
} from '@/components'

// LOD preset definitions with customizable distances
type LODPreset = {
  range: [number, number]
  lodDistances: number[]
}

const LOD_PRESETS: Record<string, LODPreset> = {
  'desktop-max': {
    range: [0, 5],
    lodDistances: [10, 20, 40, 80, 120, 150, 200]
  },
  'desktop': {
    range: [1, 5],
    lodDistances: [5, 10, 25, 50, 65, 90, 150]
  },
  'mobile-max': {
    range: [2, 5],
    lodDistances: [5, 7, 12, 25, 75, 120, 200]
  },
  'mobile': {
    range: [3, 5],
    lodDistances: [2, 4, 6, 10, 75, 120, 200]
  }
}

const LOD_OPTIONS = [
  { value: 'desktop-max', label: 'Desktop Max (0-5)' },
  { value: 'desktop', label: 'Desktop (1-5)' },
  { value: 'mobile-max', label: 'Mobile Max (2-5)' },
  { value: 'mobile', label: 'Mobile (3-5)' }
]

// Configuration
const CONFIG = {
  name: 'Roman-Parish',
  url: 'https://code.playcanvas.com/examples_data/example_roman_parish_02/lod-meta.json',
  lodUpdateDistance: 0.5,
  lodUnderfillLimit: 5,
  cameraPosition: [10.3, 2, -10] as [number, number, number],
  eulerAngles: [-90, 0, 0] as [number, number, number],
  moveSpeed: 4,
  moveFastSpeed: 15,
  focusPoint: [12, 3, 0] as [number, number, number]
}

// Type augmentation for PlayCanvas Scene.gsplat
type SceneWithGsplat = {
  gsplat: {
    lodUpdateAngle: number
    lodBehindPenalty: number
    radialSorting: boolean
    lodUpdateDistance: number
    lodUnderfillLimit: number
    colorizeLod: boolean
    lodRangeMin: number
    lodRangeMax: number
  }
  skyboxMip: number
  exposure: number
}

// Type for stats.frame with gsplats
type FrameStats = {
  gsplats: number
}

function Scene() {
  const app = useApp()
  const { asset, loading, error } = useSplat(CONFIG.url)

  const [highRes, setHighRes] = useState(false)
  const [debugLod, setDebugLod] = useState(false)
  const [lodPreset, setLodPreset] = useState(platform.mobile ? 'mobile' : 'desktop')
  
  // Refs for direct DOM manipulation (avoids React re-renders at 60fps)
  const resolutionRef = useRef<HTMLSpanElement>(null)
  const gsplatsRef = useRef<HTMLSpanElement>(null)

  // Apply resolution settings
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1
    app.graphicsDevice.maxPixelRatio = highRes ? Math.min(dpr, 2) : (dpr >= 2 ? dpr * 0.5 : dpr)
    app.resizeCanvas()
  }, [app, highRes])

  // Configure scene gsplat settings and skybox
  useEffect(() => {
    const scene = app.scene as unknown as SceneWithGsplat

    // Skybox settings
    scene.skyboxMip = 1
    scene.exposure = 1.5

    // GSplat LOD settings
    scene.gsplat.lodUpdateAngle = 90
    scene.gsplat.lodBehindPenalty = 5
    scene.gsplat.radialSorting = true
    scene.gsplat.lodUpdateDistance = CONFIG.lodUpdateDistance
    scene.gsplat.lodUnderfillLimit = CONFIG.lodUnderfillLimit
  }, [app])

  // Apply colorize LOD setting
  useEffect(() => {
    const scene = app.scene as unknown as SceneWithGsplat
    scene.gsplat.colorizeLod = debugLod
  }, [app, debugLod])

  // Apply LOD preset
  useEffect(() => {
    if (!asset || !asset.loaded) return

    const scene = app.scene as unknown as SceneWithGsplat
    const presetData = LOD_PRESETS[lodPreset] || LOD_PRESETS.desktop
    scene.gsplat.lodRangeMin = presetData.range[0]
    scene.gsplat.lodRangeMax = presetData.range[1]

    // Note: lodDistances would need to be set on the gsplat entity component
    // This requires finding the entity by name after it's created
    const gsplatEntity = app.root.findByName(CONFIG.name) as { gsplat?: { lodDistances: number[] } } | null
    if (gsplatEntity?.gsplat) {
      gsplatEntity.gsplat.lodDistances = presetData.lodDistances
    }
  }, [app, asset, lodPreset])

  // Update stats via direct DOM manipulation (no React re-renders)
  useAppEvent('update', () => {
    const bb = app.graphicsDevice.backBufferSize
    const frameStats = app.stats.frame as unknown as FrameStats
    
    if (resolutionRef.current) {
      resolutionRef.current.textContent = `${bb.x} x ${bb.y}`
    }
    if (gsplatsRef.current) {
      gsplatsRef.current.textContent = frameStats.gsplats?.toLocaleString() ?? '0'
    }
  })

  if (error) {
    return <StatusOverlay status="error" message={error} />
  }

  if (loading || !asset || !asset.loaded) {
    return <StatusOverlay status="loading" />
  }

  return (
    <>
      {/* Camera with CameraControls script */}
      <Entity position={CONFIG.cameraPosition}>
        <Camera
          fov={75}
          toneMapping={TONEMAP_ACES}
          clearColor={new Color(0.2, 0.2, 0.2) as unknown as string}
        />
        <Script
          script={CameraControls}
          sceneSize={500}
          moveSpeed={CONFIG.moveSpeed}
          moveFastSpeed={CONFIG.moveFastSpeed}
          enableOrbit={false}
          enablePan={false}
          focusPoint={new Vec3(...CONFIG.focusPoint)}
        />
      </Entity>

      {/* GSplat Entity with Reveal Effect */}
      <Entity name={CONFIG.name} rotation={CONFIG.eulerAngles}>
        <GSplat asset={asset} unified={true} />
        <Script
          script={GsplatRevealRadial}
          center={new Vec3(...CONFIG.focusPoint)}
          speed={5}
          acceleration={0}
          delay={3}
          oscillationIntensity={0.2}
          endRadius={25}
        />
      </Entity>

      {/* UI Controls */}
      <ControlsPanel>
        <ControlGroup>
          <Checkbox 
            label="High Res" 
            checked={highRes} 
            onChange={setHighRes} 
          />
        </ControlGroup>

        <ControlGroup>
          <Checkbox 
            label="Colorize LOD" 
            checked={debugLod} 
            onChange={setDebugLod} 
          />
        </ControlGroup>

        <ControlGroup>
          <Select
            label="LOD Preset"
            value={lodPreset}
            onChange={setLodPreset}
            options={LOD_OPTIONS}
          />
        </ControlGroup>

        <StatsPanel>
          <StatRow label="Resolution:" ref={resolutionRef} />
          <StatRow label="GSplat Count:" ref={gsplatsRef} />
        </StatsPanel>
      </ControlsPanel>
    </>
  )
}

function LodStreaming() {
  return (
    <>
      <BackLink />
      <Application
        fillMode={FILLMODE_FILL_WINDOW}
        resolutionMode={RESOLUTION_AUTO}
        graphicsDeviceOptions={{ antialias: false }}
      >
        <Scene />
      </Application>
    </>
  )
}

export default LodStreaming
