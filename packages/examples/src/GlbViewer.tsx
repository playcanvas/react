import { Container, Entity } from "@pc-react";
import { Align, Camera, EnvAtlas, Script } from "@pc-react/components";
import { useEnvAtlas, useModel } from "./utils/hooks";
import { AutoRotator, CameraFrame, Grid, OrbitControls, ShadowCatcher } from "@pc-react/scripts";
import { FC, useLayoutEffect } from "react";
import { useApp } from "@pc-react/hooks";
import { usePostControls } from "./utils/post-controls";

type GlbViewerProps = {
  /** The url to the glb */
  src: string
  /** The url to an environment atlas texture, which is used for lighting */
  envMapSrc: string,
}

export const GlbViewer: FC<GlbViewerProps> = ({ 
  src = '/environment-map.png',
  envMapSrc = '/lamborghini_vision_gt.glb'
}) => {

  const app = useApp();
  const postSettings = usePostControls();

  const { data: envMap, isPending: isEnvLoading } = useEnvAtlas(envMapSrc);
  const { data: model, isPending: isModeLoading } = useModel(src, { autoRelease : true });

  useLayoutEffect(() => {
    const layer = app?.scene?.layers?.getLayerByName('Skybox');
    if(layer){
      layer.enabled = false;
    }
  }, [app]);


  if (isEnvLoading || isModeLoading) return null;

  return (
    <Entity>
      <EnvAtlas asset={envMap} />
      <Script script={Grid} />

      {/* The Camera with some default post */}
      <Entity name='camera' position={[4, 2, 4]}>
        <Camera clearColor='#090707' fov={28} nearClip={1} farClip={100} exposure={1}/>
        <OrbitControls inertiaFactor={0.07} distanceMin={6} distanceMax={10} pitchAngleMin={1} pitchAngleMax={90}/>
        <Script script={AutoRotator} />
        <Script script={CameraFrame} {...postSettings}/>
      </Entity>

      {/* The GLB Asset to load */}
      <Entity name='asset' >
        <Script script={ShadowCatcher} intensity={0.9}/>
        <Align bottom>
          <Container 
            onPointerOver={() => console.log('hover')}
            onPointerOut={() => console.log('out')}
            asset={model} 
            castShadows
          />
         </Align>
      </Entity>
    </Entity>
  );
  
};
