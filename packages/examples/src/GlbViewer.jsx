import { Container, Entity } from '@playcanvas/react';
import { Camera, Script, EnvAtlas, Light, Render } from '@playcanvas/react/components';
import { CameraFrame, OrbitControls, Grid } from '@playcanvas/react/scripts';
import { useApp, useMaterial} from '@playcanvas/react/hooks';
import {
  BLEND_MULTIPLICATIVE,
  Script as BaseScript,
  Color,
  EVENT_MOUSEDOWN,
  SHADERPASS_FORWARD,
  SHADERPASS_WORLDNORMAL,
  TONEMAP_ACES2,
} from 'playcanvas';

import { useEnvMap, useModel } from './utils/hooks';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

export const GlbViewer = ({
  envMapSrc = '/umbrellas_2k.png',
  src = '/statue.glb',
  shading = SHADERPASS_FORWARD,
}) => {

  const app = useApp();

  const { data: envMap, isPending: isEnvLoading } = useEnvMap(envMapSrc);
  const { data: model, isPending: isModeLoading } = useModel(src);
  const diffuse = useMemo(_ => new Color(0.18, 0.16, 0.158));
  const clearColor = useMemo(_ => new Color(0.18, 0.16, 0.158));
  const floor = useMaterial({ blendType: BLEND_MULTIPLICATIVE, useSkybox: false });

  useEffect(() => {
    if (isModeLoading || isEnvLoading) return;
    const camera = app.root.findOne((en) => en.camera)?.camera;
    camera?.setShaderPass(shading);
  }, [shading, app, isModeLoading, isEnvLoading]);

  useLayoutEffect(() => {
    if(!app || !app.scene || !app.scene.layers) return;
    app.scene.layers.getLayerByName('Skybox').enabled = false;
    app.scene.skyboxIntensity = 0.6;
    app.scene.toneMapping = TONEMAP_ACES2;
  }, [app]);

  if (isEnvLoading || isModeLoading) return null;

  return (
    <Entity>
      <EnvAtlas asset={envMap} />
      <Script script={Grid} />

      <Entity name='camera' position={[4, 4, 4]}>
        <Camera clearColor={clearColor} fov={25} newClip={1} farClip={1000000}/>
        <OrbitControls inertiaFactor={0.07} distanceMin={30} distanceMax={30} />
      </Entity>

      <Entity name='floor' scale={[10000, 1, 10000]} position={[0, 0.1, 0]}>
        <Render type='plane' receiveShadows material={floor}/>
      </Entity>

      <Entity name='light' rotation={[45, 350, 20]}  >
        <Light type='directional' castShadows shadowIntensity={0.7}/>
      </Entity>

      <Entity name='asset'>
        <Container asset={model} castShadows/>
      </Entity>
    </Entity>
  );
};
