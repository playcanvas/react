import { useEffect, useLayoutEffect, useMemo } from 'react';

import { Container, Entity } from '@playcanvas/react';
import { Camera, Script, EnvAtlas } from '@playcanvas/react/components';
import { CameraFrame, OrbitControls, Grid, ShadowCatcher } from '@playcanvas/react/scripts';
import { useApp} from '@playcanvas/react/hooks';
import { Color, SHADERPASS_FORWARD, TONEMAP_ACES2 } from 'playcanvas';

import { useEnvMap, useModel } from './utils/hooks';
import { AutoRotator } from './scripts/auto-rotator';

export const GlbViewer = ({
  envMapSrc = '/potsdamer-platz-rgbp.png',
  src = '/statue.glb',
  shading = SHADERPASS_FORWARD,
}) => {

  const app = useApp();
  const sc = .14;
  const { data: envMap, isPending: isEnvLoading } = useEnvMap(envMapSrc);
  const { data: model, isPending: isModeLoading } = useModel(src);
  const clearColor = useMemo(_ => new Color(65/255 * sc, 52/255* sc, 49/255* sc, 1));

  // Toggles the 
  useEffect(() => {
    if (isModeLoading || isEnvLoading) return;
    const camera = app.root.findOne((en) => en.camera)?.camera;
    camera?.setShaderPass(shading);
  }, [shading, app, isModeLoading, isEnvLoading]);

  useLayoutEffect(() => {
    if(!app || !app.scene || !app.scene.layers) return;
    app.scene.layers.getLayerByName('Skybox').enabled = false;
    app.scene.ambientLight.set(0, 0, 0);
    app.scene.ambientLuminance = 0;
    app.scene.clusteredLightingEnabled = false;
    app.scene.exposure = .6;
    app.scene.skyboxIntensity = .8;
    app.scene.toneMapping = TONEMAP_ACES2;
  }, [app]);

  if (isEnvLoading || isModeLoading) return null;

  return (
    <Entity>
      <EnvAtlas asset={envMap} />
      <Script script={Grid} />

      {/* The Camera with some default post */}
      <Entity name='camera' position={[4, 2, 4]}>
        <Camera clearColor={clearColor} fov={28} nearClip={1} farClip={10} exposure={1}/>
        <OrbitControls inertiaFactor={0.07} distanceMin={8} distanceMax={8} pitchAngleMin={1} pitchAngleMax={90}/>
        <Script script={AutoRotator} />
        <Script script={CameraFrame} 
          toneMapping={4}
          grading={{
            enabled: true,
            brightness: 1.1,
            contrast: 1.08,
            saturation: 1.2,
            tint: new Color(1, 1, 1, 1)
          }}
          ssao={{ type: 'none' }}
          bloom={{ enabled: true, intensity: 0.12, lastMipLevel: 1 }}
          taa={{ enabled: false, jitter: 0.8 }}
          fringing={{ enabled: true, intensity: 6 }} 
        />
      </Entity>

      {/* THe GLB Asset to load */}
      <Entity name='asset'>
        <Script script={ShadowCatcher} />
        <Container asset={model} castShadows/>
      </Entity>
    </Entity>
  );
};
