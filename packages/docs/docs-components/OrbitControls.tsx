"use client"

import { Script } from '@playcanvas/react/components';
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs'
import { Vec2 } from 'playcanvas';

export const OrbitControls = ({ zoomRange = [1, 10], pitchRange = [-90, -5], ...props} ) => {
    return <Script script={CameraControls} enableFly={false} zoomRange={new Vec2(zoomRange[0], zoomRange[1])} pitchRange={new Vec2(pitchRange[0], pitchRange[1])} {...props} />
};