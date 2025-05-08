"use client"

import { Application, Entity } from "@playcanvas/react"
import { useApp, useParent, useSplat } from "@playcanvas/react/hooks"
import { Camera, GSplat, Script } from "@playcanvas/react/components"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Entity as PcEntity } from "playcanvas"
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { GSplatComponent, Vec3 } from "playcanvas"
import { AssetViewerProvider, useTimeline } from "./splat-viewer-context"
import { TooltipProvider } from "../tooltip"
import { cn } from "@/lib/utils"
import { StaticPostEffects } from "@/components/PostEffects"
import { AnimationTrack, AnimCamera } from "./utils/animation"
import { computeStartingPose, Pose } from "./utils/pose"

// mock anim track
import { mockAnimTrack } from "./utils/mock-anim-track"

type CameraControlsProps = {
    /* The type of camera controls to use */
    type?: 'animation' | 'orbit' | 'fly',
}

type SplatViewerComponentProps = CameraControlsProps & {
    /* The url od the resource */
    src: string,
    /* The url of the poster image */
    poster?: string,
    /* The track to use for the animation */
    track?: AnimationTrack,
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

function SplatComponent({ src, type, track }: SplatViewerComponentProps) {

    const { asset, error } = useSplat(src)

    // unload the asset when the component is unmounted
    useEffect(() => {
        return () => {
            asset?.unload();
        }
    }, [asset]);
    
    if (error) throw new Error(error);
    if (!asset) return null;

    return (
        <>
            { 
                type === 'animation' ? <AnimationCamera fov={30} track={track} /> : 
                type === 'orbit' ? <InteractiveCamera fov={30} /> :
                <InteractiveCamera fov={30} /> 
            }
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

function InteractiveCamera({ fov = 30 }: { fov: number }) {

    const app = useApp();
    const [pose, setPose] = useState<Pose>(null);

    useEffect(() => {
        const gsplat = app.root.findComponent('gsplat') as GSplatComponent;
        const initialPose = computeStartingPose(gsplat, fov);
        setPose(initialPose);

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

function AnimationCamera({ fov = 30, track }: { fov: number, track: AnimationTrack }) {

    const entityRef = useRef<PcEntity>(null);
    const { subscribe } = useTimeline();
    const animation = AnimCamera.fromTrack(track);

    useEffect(() => {
        const pose = new Pose();
        
        const unsubscribe = subscribe((t: number) => {
            if (!animation) return;
            console.log(t, track.frameRate, track.duration);
            animation.cursor.value = t * track.frameRate;
            animation.update();
            animation.getPose(pose);
            const entity = entityRef.current;
            entity.setPosition(animation.position);
            entity.setRotation(pose.rotation);
        });

        return unsubscribe;
        
    }, [subscribe]);

    if (!track) {
        console.warn('No track provided');
        return null;
    }

    return (
        <Entity name='camera' ref={entityRef}>
            <Camera fov={fov} clearColor='#f3e8ff'/>
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
                        <SplatComponent src={src} {...props} track={mockAnimTrack[0]}/>
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