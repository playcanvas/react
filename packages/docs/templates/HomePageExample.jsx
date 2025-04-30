"use client";

import { Container, Entity } from '@playcanvas/react';
import { Camera, EnvAtlas } from '@playcanvas/react/components';
import { OrbitControls } from '@playcanvas/react/scripts';

import { useEnvAtlas, useModel } from '@components/hooks/use-asset';
import Grid from '@components/Grid';
import AutoRotate from '@components/AutoRotate';
import { StaticPostEffects } from '@components/PostEffects';
import ShadowCatcher from '@components/ShadowCatcher';

const Example = () => {

    const { data: envMap } = useEnvAtlas('/environment-map.png');
    const { data: model } = useModel('/lamborghini_vision_gt.glb');

    return (<Entity>
        <EnvAtlas asset={envMap} skyboxIntensity={1.2} showSkybox={false} />
        <Grid />
        <ShadowCatcher width={5} depth={5} />
        <Entity name='camera' position={[4, 1, 4]}>
            <Camera clearColor='#090707' fov={28} />
            <OrbitControls inertiaFactor={0.07} distanceMin={6} distanceMax={10} pitchAngleMin={1} pitchAngleMax={90}/>
            <StaticPostEffects />
            <AutoRotate />
        </Entity>
        <Entity>
            { model && <Container asset={model}/> }
        </Entity>
    </Entity>)
}

export default Example;