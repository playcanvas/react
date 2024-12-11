import { Entity, Vec3, Script as PcScript } from "playcanvas";
import { Script } from "../../components/Script";
import { OrbitCamera, OrbitCameraInputMouse, OrbitCameraInputTouch } from "./orbit-camera";

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

type PcScriptType = new (...args: unknown[]) => PcScript

export const OrbitControls = ({ 
    distanceMax = 20, distanceMin = 18, pitchAngleMax = 90, pitchAngleMin = 0, inertiaFactor = 0.0, focusEntity = null, pivotPoint = new Vec3(), frameOnStart = true, distance = 0,
    mouse = { orbitSensitivity: 0.3, distanceSensitivity: 0.15 }, 
    touch = { orbitSensitivity: 0.4, distanceSensitivity: 0.2 }, 
 } : OrbitControls) => {
    
    const orbitCameraProps : OrbitCameraProps = { distanceMax, distanceMin, pitchAngleMax, pitchAngleMin, inertiaFactor, focusEntity, pivotPoint, frameOnStart, distance }
    
    return <>
        <Script script={OrbitCamera as PcScriptType} {...orbitCameraProps}/>
        <Script script={OrbitCameraInputMouse as PcScriptType} {...mouse}/>
        <Script script={OrbitCameraInputTouch as PcScriptType} {...touch} />
    </>
}