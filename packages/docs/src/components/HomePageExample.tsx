"use client";

import { Container, Entity } from '@playcanvas/react';
import { Camera, EnvAtlas } from '@playcanvas/react/components';
import { OrbitControls } from '@playcanvas/react/scripts';

import { Asset } from 'playcanvas';

import { useEnvAtlas, useModel } from './hooks/use-asset';
import Grid from './Grid';
import AutoRotate from './AutoRotate';
import { StaticPostEffects } from './PostEffects';

export const HomePageExample = () => {

    const { data: envMap } = useEnvAtlas('/environment-map.png');
    const { data: model } = useModel('/lamborghini_vision_gt.glb');

    // return (<Application className='hover:cursor-grab active:cursor-grabbing w-full' fillMode="NONE" resolutionMode="AUTO">
    return (<Entity>
        <EnvAtlas asset={envMap as Asset} intensity={0.5} showSkybox={false} />
        <Grid />
        <Entity name='camera' position={[4, 1, 4]}>
            <Camera clearColor='#090707' fov={28} />
            <OrbitControls inertiaFactor={0.07} distanceMin={6} distanceMax={10} pitchAngleMin={1} pitchAngleMax={90}/>
            {/* <StaticPostEffects /> */}
            <AutoRotate />
        </Entity>

        <Entity>  
            <Container asset={model as Asset}/>
        </Entity>
    </Entity>)
}