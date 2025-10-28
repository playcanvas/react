import { Entity, Vec3 } from "playcanvas";
import { Script } from "../../components/Script.tsx";
import { OrbitCamera, OrbitCameraInputMouse, OrbitCameraInputTouch } from "./orbit-camera.js";
import { warnOnce } from "../../utils/validation.ts";

type OrbitCameraProps = {
    distanceMax?: number
    distanceMin?: number
    pitchAngleMax?: number
    pitchAngleMin?: number
    inertiaFactor?: number
    focusEntity?: Entity | null
    frameOnStart?: boolean
    distance?: number
    pivotPoint?: Vec3 | null
}

type OrbitCameraInputProps = {
    orbitSensitivity?: number;
    distanceSensitivity?: number;
};

type OrbitControls = OrbitCameraProps & {
    mouse?: OrbitCameraInputProps;
    touch?: OrbitCameraInputProps;
};

export const OrbitControls = ({ 
    distanceMax = 20, distanceMin = 18, pitchAngleMax = 90, pitchAngleMin = 0, inertiaFactor = 0.0, focusEntity = null, pivotPoint = new Vec3(), frameOnStart = true, distance = 0,
    mouse = { orbitSensitivity: 0.3, distanceSensitivity: 0.15 }, 
    touch = { orbitSensitivity: 0.4, distanceSensitivity: 0.2 }, 
 } : OrbitControls) => {

    warnOnce('The `<OrbitControls/>` component is deprecated and will be removed in a future release. Use the PlayCanvas `CameraControls` script from `playcanvas` via the `<Script/>` component instead: `<Script script={CameraControls}/>`.');
    
    const orbitCameraProps : OrbitCameraProps = { distanceMax, distanceMin, pitchAngleMax, pitchAngleMin, inertiaFactor, focusEntity, pivotPoint, frameOnStart, distance }
    
    return <>
        <Script script={OrbitCamera} {...orbitCameraProps}/>
        <Script script={OrbitCameraInputMouse} {...mouse}/>
        <Script script={OrbitCameraInputTouch} {...touch} />
    </>
}