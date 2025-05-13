"use client"

import { Application } from "@playcanvas/react"
import { useApp, useSplat } from "@playcanvas/react/hooks"
import { GSplat } from "@playcanvas/react/components"
import { Suspense, useEffect, useRef } from "react"
import { AssetViewerProvider, useAssetViewer, useTimeline } from "./splat-viewer-context"
import { TooltipProvider } from "@components/ui/tooltip"
import { cn } from "@lib/utils"
import { AnimationTrack } from "./utils/animation"
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
}

function SplatComponent({ 
    src, 
    type = 'orbit',
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