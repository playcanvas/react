"use client"

import { Application, Entity } from "@playcanvas/react"
import { useApp, useParent, useSplat } from "@playcanvas/react/hooks"
import { Camera, GSplat, Script } from "@playcanvas/react/components"
import { Suspense, useEffect, useRef, useState } from "react"
import { Script as PcScript } from 'playcanvas'

import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { BoundingBox, GSplatComponent, Vec3 } from "playcanvas"
import { AssetViewerProvider } from "./splat-viewer-context"
import { TooltipProvider } from "../tooltip"
import { cn } from "@/lib/utils"
import { StaticPostEffects } from "@/components/PostEffects"

type CameraControlsProps = {
    /* The type of camera controls to use */
    type?: 'auto' | 'orbit' | 'fly',
}

type SplatViewerComponentProps = CameraControlsProps & {
    /* The url od the resource */
    src: string,
    /* The url of the poster image */
    poster?: string,
}

type PosterComponentProps = {
    /* The url of the poster image */
    src?: string,
}

type SplatViewerProps = SplatViewerComponentProps & PosterComponentProps & {
    /* The className of the container */
    className?: string,
    /* The children of the component */
    children?: React.ReactNode,
}

class AutoRotate extends PcScript {
    update() {

        // @ts-expect-error CameraControls is not defined in the script
        const cameraControls = this.entity.script?.cameraControls as CameraControls;

        if (!cameraControls) {
            return
        }
    }
}

function SplatComponent({ src, type }: SplatViewerComponentProps) {

    const { asset, error } = useSplat(src)
    
    if (error) throw new Error(error);
    if (!asset) return null;

    return (
        <>
            <InteractiveCamera type={type} />
            <GSplat asset={asset} />
        </>
    )
}

function PosterComponent({ src }: PosterComponentProps) {
    return (
        <img src={src} alt="poster" />
    )
}

type CameraControlsProps2 = {
    /* The type of camera controls to use */
    type?: 'auto' | 'orbit' | 'fly',
    /* The focus point of the camera */
    focus?: [number, number, number]
}

function CameraController({ focus = [0, 0, 0] }: CameraControlsProps2) {

    const entity = useParent();

    useEffect(() => {
        // @ts-expect-error CameraControls is not defined in the script
        const controls = entity.script?.cameraControls as CameraControls;
        if (controls) {
            controls.focus(new Vec3().fromArray(focus));
        }
    }, [...focus]);

    return (<>
        <Script script={CameraControls} rotateSpeed={0.5} rotateDamping={0.985}/*enableFly={type === 'fly'} */ />
        <Script script={AutoRotate} />
    </>);
}

type Pose = {
    position: [number, number, number],
    target: [number, number, number]
}

const stylized = {
    "lighting": {
        "exposure": 1.0,
        "skyBoxIntensity": 1.0
    },
    "rendering": {
        "renderFormat": 18,
        "renderTargetScale": 1,
        "sharpness": 0,
        "samples": 4,
        "toneMapping": 4,
        "fog": "none",
        "fogColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 1
        },
        "fogRange": [
            0,
            100
        ],
        "fogDensity": 0.01,
        "renderFormatFallback0": 12,
        "renderFormatFallback1": 14,
        "sceneColorMap": false,
        "sceneDepthMap": false,
        "fogStart": 0,
        "fogEnd": 100
    },
    "ssao": {
        "type": "none",
        "intensity": 0.5,
        "radius": 30,
        "samples": 12,
        "power": 6,
        "minAngle": 10,
        "scale": 1,
        "blurEnabled": true
    },
    "bloom": {
        "enabled": true,
        "intensity": 0.03,
        "lastMipLevel": 1
    },
    "grading": {
        "enabled": true,
        "brightness": 0.93,
        "contrast": 1.16,
        "saturation": 1.4,
        "tint": {
            "r": 1,
            "g": 0.9333333333333333,
            "b": 0.8666666666666667,
            "a": 1
        }
    },
    "vignette": {
        "enabled": true,
        "intensity": 0.4,
        "inner": 0.25,
        "outer": 1.52,
        "curvature": 0.78
    },
    "taa": {
        "enabled": false,
        "jitter": 0.4
    },
    "fringing": {
        "enabled": true,
        "intensity": 10
    }
}

function InteractiveCamera({ fov = 30 }: { type?: 'auto' | 'orbit' | 'fly', fov?: number }) {

    const app = useApp();
    const [pose, setPose] = useState<Pose>(null);

    useEffect(() => {
        // get the gsplat
        const gsplat = app.root.findComponent('gsplat') as GSplatComponent;

        // calculate scene bounding box
        const bbox = gsplat?.instance?.meshInstance?.aabb ?? new BoundingBox();
        const sceneSize = bbox.halfExtents.length() * 0.8;
        const distance = sceneSize / Math.sin(fov / 180 * Math.PI * 0.5);

        const position = new Vec3(2, 1, 2).normalize().mulScalar(distance).add(bbox.center);
        const target = bbox.center;

        // const inferIsObjectExperience = !bbox.containsPoint(position);

        setPose({
            position: [position.x, position.y, position.z],
            target: [target.x, target.y, target.z]
        });

    }, [app]);

    if (!pose) return null;

    return (
        <Entity name='camera' position={pose.position} >
            <Camera fov={fov} clearColor='#f3e8ff'/>
            <CameraController focus={pose.target} />
            <StaticPostEffects {...stylized}/>
        </Entity>
    )
}


/**
 * The SplatViewer is a component that displays a Gaussian Splat.
 */
export function SplatViewer( { src, poster, children, className, ...props } : SplatViewerProps) {

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className={cn("relative overflow-hidden", className)}> 
            <AssetViewerProvider targetRef={containerRef} src={src}>
                <Suspense fallback={<PosterComponent src={poster} />} >
                    <Application fillMode="NONE" resolutionMode="AUTO">
                        <SplatComponent src={src} {...props} />
                    </Application>
                    <div className="absolute w-full h-full top-0 left-0 pointer-events-none flex items-end justify-start p-2 gap-2">
                        <TooltipProvider>
                            {children}
                        </TooltipProvider>
                    </div>
                </Suspense>
            </AssetViewerProvider>
        </div>
    )
}