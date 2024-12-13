"use client";

import { Container, Entity } from '@playcanvas/react';
import { Camera, EnvAtlas } from '@playcanvas/react/components';
import { OrbitControls } from '@playcanvas/react/scripts';

import { useEnvAtlas, useModel } from '@/components/hooks/use-asset';
import Grid from '@/components/Grid';
import AutoRotate from '@/components/AutoRotate';
import { StaticPostEffects } from '@/components/PostEffects';
import { LoadingSpinner } from '@/components/LoadingSpinner';
const Example = () => {

    const { data: envMap } = useEnvAtlas('/environment-map.png');
    const { data: model } = useModel('/lamborghini_vision_gt.glb');

    if(!envMap || !model) return <LoadingSpinner />;

    return (<Entity>
        <EnvAtlas asset={envMap} intensity={0.5} showSkybox={false} />
        <Grid />
        <Entity name='camera' position={[4, 1, 4]}>
            <Camera clearColor='#090707' fov={28} />
            <OrbitControls inertiaFactor={0.07} distanceMin={6} distanceMax={10} pitchAngleMin={1} pitchAngleMax={90}/>
            <StaticPostEffects />
            <AutoRotate />
        </Entity>
        <Entity>
            <Container asset={model}/>
        </Entity>
    </Entity>)
}

export default Example;