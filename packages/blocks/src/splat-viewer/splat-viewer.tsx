"use client"

import { Application } from "@playcanvas/react"
import { useApp, useSplat } from "@playcanvas/react/hooks"
import { GSplat } from "@playcanvas/react/components"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { AssetViewerProvider, useAssetViewer, useTimeline } from "./splat-viewer-context"
import { TooltipProvider } from "@components/ui/tooltip"
import { cn } from "@lib/utils"
import { AnimationTrack } from "./utils/animation"
import { SmartCamera } from "./smart-camera"
import { HelpDialog } from "./help-dialog"
import { FILLMODE_NONE } from "playcanvas"
import { RESOLUTION_AUTO } from "playcanvas"
export type CameraMode = 'orbit' |  'fly';

type CameraControlsProps = {
    /** 
     * The type of camera controls to use. 
     * 
     * - `orbit`: An orbit camera that follows the splat.
     * - `fly`: A fly camera that follows the splat.
     * 
     * @defaultValue 'orbit'
     */
    mode?: CameraMode,

    /**
     * The default mode of the camera.
     * 
     * @defaultValue 'orbit'
     */
    defaultMode?: CameraMode,
}


type SplatViewerComponentProps = CameraControlsProps & {
    /**
     * The url of an image to display whilst the asset is loading.
     */
    src: string | Record<string, unknown>,
    /**
     * The track to use for the animation 
     */
    track?: AnimationTrack,
    
    /**
     * Whether to automatically play the animation
     * @defaultValue false
     */
    autoPlay?: boolean,

    /**
     * A callback function for when the type of camera changes
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
    src
}: SplatViewerComponentProps) {

    const isSogsMeta = typeof src === 'object';
    const { asset, error } = useSplat(
        isSogsMeta ? "vfs://splat-sogs.json" : src, 
        isSogsMeta? src : {} );
    const { isInteracting } = useAssetViewer();
    const { isPlaying } = useTimeline();
    const app = useApp();

    // unload the asset when the component is unmounted
    useEffect(() => {
        return () => asset?.unload();
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
                <SmartCamera fov={30} />
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
    mode = 'orbit',
    defaultMode = 'orbit',
    onTypeChange,
    className, 
    children, 
    ...props 
} : SplatViewerProps) {

    const isControlled = !mode;
    const containerRef = useRef<HTMLDivElement>(null!);
    const [uncontrolledMode, setUncontrolledMode] = useState<CameraMode>(
        defaultMode
    );

    const setCameraMode = useCallback(
        (mode: CameraMode) => {
            if (!isControlled) setUncontrolledMode(mode);
            onTypeChange?.(mode);
        },
        [isControlled, onTypeChange]
    );

    const currentMode = isControlled ? mode : uncontrolledMode;

    return (
        <div ref={containerRef} className={cn("relative overflow-hidden", className)}> 
            <AssetViewerProvider 
                targetRef={containerRef} 
                src={src}
                mode={currentMode}
                setMode={setCameraMode}
            >
                <Suspense fallback={<PosterComponent poster={poster} />} >
                    <Application fillMode={FILLMODE_NONE} resolutionMode={RESOLUTION_AUTO} autoRender={false}>
                        <SplatComponent src={src} {...props} />
                    </Application>
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                </Suspense>
                <HelpDialog />
            </AssetViewerProvider>
        </div>
    )
}