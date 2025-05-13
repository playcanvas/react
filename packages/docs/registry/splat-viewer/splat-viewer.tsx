"use client"

import { Application, Entity } from "@playcanvas/react"
import { useApp, useParent, useSplat } from "@playcanvas/react/hooks"
import { Camera, GSplat, Script } from "@playcanvas/react/components"
import { Suspense, useEffect, useRef, useState } from "react"
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs';
import { GSplatComponent, Vec3 } from "playcanvas"
import { AssetViewerProvider, useAssetViewer, useTimeline } from "./splat-viewer-context"
import { TooltipProvider } from "@components/ui/tooltip"
import { cn } from "@lib/utils"
import { StaticPostEffects } from "@components/PostEffects"
import { AnimationTrack } from "./utils/animation"
import { computeStartingPose } from "./utils/pose"
import style from "./utils/style"
import { SmartCamera } from "./smart-camera"

// mock anim track
// import { mockAnimTrack } from "./utils/mock-anim-track"

type CameraControlsProps = {
    /** 
     * The type of camera controls to use. 
     * 
     * - `orbit`: An orbit camera that follows the splat.
     * - `fly`: A fly camera that follows the splat.
     */
    type: 'orbit' |  'fly',
}

type SplatViewerComponentProps = CameraControlsProps & {
    /**
     * The url of the resource 
     */
    src: string,
    /**
     * The track to use for the animation 
     */
    track?: AnimationTrack,
    
    /**
     * Whether to automatically play the animation
     */
    autoPlay?: boolean,

    /**
     * The function to call when the type of camera changes
     */
    onTypeChange?: (type: 'orbit' | 'fly') => void,
}

type PosterComponentProps = {
    /**
     * The url of the poster image 
     */
    poster?: string,
}

export type SplatViewerProps = SplatViewerComponentProps & PosterComponentProps & {

    /**
     * The className of the container 
     */
    className?: string,

    /**
     * The children of the component 
     */
    children?: React.ReactNode,

    /**
     * Whether to automatically play the animation
     */
    autoPlay?: boolean,
}

function SplatComponent({ 
    src, 
    type = 'orbit',
    autoPlay = true, 
    track = null 
}: SplatViewerComponentProps) {

    const { asset, error } = useSplat(src)
    const { isInteracting } = useAssetViewer();
    const { isPlaying } = useTimeline();
    const app = useApp();

    // unload the asset when the component is unmounted
    useEffect(() => {
        return () => {
            asset?.unload();
        }
    }, [asset]);

    // Hide the cursor when the timeline is playing and the user is not interacting
    useEffect(() => {
        if (app.graphicsDevice.canvas) {
            // eslint-disable-next-line react-compiler/react-compiler
            app.graphicsDevice.canvas.style.cursor = isPlaying && !isInteracting ? 'none' : '';
        }
    }, [isInteracting, app]);
    
    if (error) throw new Error(error);
    if (!asset) return null;

    return (
        <>
            { 
                // type === 'animation' ? <AnimationCamera fov={30} track={track} /> : 
                // type === 'orbit' ? <InteractiveCamera fov={30} /> :
                // <InteractiveCamera fov={30} type={type} /> 
                <SmartCamera type={type} fov={30} />
            }
            <GSplat asset={asset} />
        </>
    )
}

function PosterComponent({ poster }: PosterComponentProps) {
    return (
        <img src={poster} alt="poster" />
    )
}

type CameraControlsProps2 = {
    /* The focus point of the camera */
    focus?: [number, number, number]
    enablePan: boolean,
    enableFly: boolean,
    enableOrbit: boolean,
}

function CameraController({ focus = [0, 0, 0], ...props }: CameraControlsProps2) {

    const entity = useParent();

    useEffect(() => {
        // @ts-expect-error CameraControls is not defined in the script
        const controls = entity.script?.cameraControls as CameraControls;
        if (controls) {
            controls.focus(new Vec3().fromArray(focus));
        }
    }, [...focus]);

    return (<>
        <Script script={CameraControls} rotateSpeed={0.5} rotateDamping={0.985} {...props} />
    </>);
}

type PoseType = {
    position: [number, number, number],
    target: [number, number, number]
}



function InteractiveCamera({ 
    fov = 30, 
    type = 'orbit' 
}: { fov: number, type?: 'orbit' | 'fly' }) {

    const app = useApp();
    const [pose, setPose] = useState<PoseType>({
        position: [2, 1, 2],
        target: [0, 0, 0]
    });

    useEffect(() => {
        const gsplat = app.root.findComponent('gsplat') as GSplatComponent;
        const initialPose = computeStartingPose(gsplat, fov);

        console.log('interactive camera', initialPose);
        setPose(initialPose);

    }, [app]);

    if (!pose) return null;

    return (
        <Entity name='camera' position={pose.position} >
            <Camera fov={fov} clearColor='#f3e8ff'/>
            <CameraController focus={pose.target} 
                enablePan={type === 'fly'}
                enableFly={type === 'fly'}
                enableOrbit={type === 'orbit'}
            />
            <StaticPostEffects {...style.paris}/>
        </Entity>
    )
}

// function AnimationCamera({ fov = 30, track }: { fov: number, track: AnimationTrack }) {

//     const entityRef = useRef<PcEntity>(null);
//     const { subscribe } = useTimeline();
//     const animation = AnimCamera.fromTrack(track);

//     useEffect(() => {
//         const pose = new Pose();
        
//         const unsubscribe = subscribe((t: number) => {
//             if (!animation) return;
//             console.log(t, track.frameRate, track.duration);
//             animation.cursor.value = t * track.frameRate;
//             animation.update();
//             animation.getPose(pose);
//             const entity = entityRef.current;
//             entity.setPosition(animation.position);
//             entity.setRotation(pose.rotation);
//         });

//         return unsubscribe;
        
//     }, [subscribe]);

//     if (!track) {
//         console.warn('No track provided');
//         return null;
//     }

//     return (
//         <Entity name='camera' ref={entityRef}>
//             <Camera fov={fov} clearColor='#f3e8ff'/>
//         </Entity>
//     )
// }

/**
 * The SplatViewer is a component that displays a Gaussian Splat.
 */
export function SplatViewer( { 
    src, 
    poster,
    className, 
    children, 
    ...props 
} : SplatViewerProps) {

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className={cn("relative overflow-hidden", className)}> 
            <AssetViewerProvider targetRef={containerRef} src={src}>
                <Suspense fallback={<PosterComponent poster={poster} />} >
                    <Application fillMode="NONE" resolutionMode="AUTO" autoRender={true}>
                        <SplatComponent src={src} {...props} />
                    </Application>
                    {/* <div className="absolute w-full h-full top-0 left-0 pointer-events-none flex items-end justify-start p-2 gap-2"> */}
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                    {/* </div> */}
                </Suspense>
            </AssetViewerProvider>
        </div>
    )
}