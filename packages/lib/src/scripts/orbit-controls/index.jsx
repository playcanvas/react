import { Script } from "../../components/Script";
import { OrbitCamera, OrbitCameraInputMouse, OrbitCameraInputTouch } from "./orbit-camera";

export const OrbitControls = ({ 
    distanceMax = 20, distanceMin = 18, pitchAngleMax, pitchAngleMin, inertiaFactor = 0.0, focusEntity = null, frameOnStart = true, distance = 0,
    mouse = { orbitSensitivity: 0.3, distanceSensitivity: 0.15 }, 
    touch = { orbitSensitivity: 0.4, distanceSensitivity: 0.2 }, 
 }) => {
    
    const orbitCameraProps = { distanceMax, distanceMin, pitchAngleMax, pitchAngleMin, inertiaFactor, focusEntity, frameOnStart, distance }
    
    return <>
        <Script script={OrbitCamera} {...orbitCameraProps}/>
        <Script script={OrbitCameraInputMouse} {...mouse}/>
        <Script script={OrbitCameraInputTouch} {...touch} />
    </>
}