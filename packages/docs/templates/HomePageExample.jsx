"use client";

import { Container, Entity } from '@playcanvas/react';
import { Camera, Environment, Script } from '@playcanvas/react/components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { Vec2 } from 'playcanvas';

import { useEnvAtlas, useModel } from '@components/hooks/use-asset';
import Grid from '@components/Grid';
import AutoRotate from '@components/AutoRotate';
import { StaticPostEffects } from '@components/PostEffects';
import ShadowCatcher from '@components/ShadowCatcher';

const OrbitControls = ({ zoomRange = [1, 10], pitchRange = [-90, -5], ...props} ) => {
    return <Script script={CameraControls} enableFly={false} zoomRange={new Vec2(zoomRange[0], zoomRange[1])} pitchRange={new Vec2(pitchRange[0], pitchRange[1])} {...props} />
};


const Example = () => {

    const { data: envAtlas } = useEnvAtlas('/environment-map.png');
    const { data: model } = useModel('/lamborghini_vision_gt.glb');

    return (<Entity>
        { envAtlas && <Environment envAtlas={envAtlas} showSkybox={false} skyboxIntensity={2}/> }
        <Grid />
        <ShadowCatcher width={5} depth={5} />
        <Entity name='camera' position={[4, 1, 4]}>
            <Camera clearColor='#090707' fov={28} renderSceneColorMap={true} />
            <OrbitControls inertiaFactor={0.07} zoomRange={[6, 10]} pitchRange={[-90, -5]}/>
            <StaticPostEffects />
            <AutoRotate />
        </Entity>
        <Entity>
            { model && <Container asset={model}/> }
        </Entity>
    </Entity>)
}

export default Example;