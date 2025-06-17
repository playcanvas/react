"use client"

import { Application, Entity } from "@playcanvas/react"
import { useApp, useSplat } from "@playcanvas/react/hooks"
import { GSplat } from "@playcanvas/react/components"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { AssetViewerProvider, useAssetViewer, useTimeline } from "./splat-viewer-context"
import { TooltipProvider } from "@components/ui/tooltip"
import { cn } from "@lib/utils"
import { AnimationTrack } from "./utils/animation"
import { SmartCamera } from "./smart-camera"
import { HelpDialog } from "./help-dialog"
import { RESOLUTION_AUTO, FILLMODE_NONE } from "playcanvas"
import { useSubscribe } from "./hooks/use-subscribe"
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
     * The style of the camera to use.
     * 
     * - `paris`: A warm saturated style.   
     * - `neutral`: A neutral style.
     * - `noir`: A black/white style.
     * 
     * @defaultValue 'neutral'
     */
    variant?: "paris" | "neutral" | "noir" | 'none' | Record<string, unknown>,

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

    /**
     * A callback function for when the asset progress changes
     */
    onAssetProgress?: (progress: number) => void,
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

const identity = (a: unknown) => a;

function SplatComponent({
    src,
    variant = "neutral",
    onAssetProgress
}: SplatViewerComponentProps) {
    const isObject = typeof src === 'object';
    const { asset, error, subscribe } = useSplat(
        isObject ? "vfs://force-use-sogs-parser.json" : src,
        isObject ? { data: src, options: { mapUrl: identity }} : {} );

    const { isInteracting } = useAssetViewer();
    const { isPlaying } = useTimeline();
    const app = useApp();

    // unload the asset when the component is unmounted
    useEffect(() => {
        return () => asset?.unload();
    }, [asset]);

    useEffect(() => {
        return subscribe(({ progress }) => onAssetProgress?.(progress));
    }, [subscribe, onAssetProgress]);

    // Hide the cursor when the timeline is playing and the user is not interacting
    useEffect(() => {
        if (app.graphicsDevice.canvas) {
            app.graphicsDevice.canvas.style.cursor = isPlaying && !isInteracting ? 'none' : 'grab';
        }
    }, [isInteracting, app, isPlaying]);

    // Update cursor on mouse down/up
    useEffect(() => {
        const canvas = app.graphicsDevice.canvas;
        if (!canvas) return;

        const onMouseDown = () => {
            canvas.style.cursor = 'grabbing';
        };

        const onMouseUp = () => {
            canvas.style.cursor = isPlaying && !isInteracting ? 'none' : 'grab';
        };

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mouseup', onMouseUp);
            canvas.removeEventListener('mouseleave', onMouseUp);
        };
    }, [app, isPlaying, isInteracting]);
    
    if (error) throw new Error(error);
    if (!asset) return null;

    return (
        <>
            { 
                // type === 'animation' ? <AnimationCamera fov={30} track={track} /> : 
                // type === 'orbit' ? <InteractiveCamera fov={30} /> :
                // <InteractiveCamera fov={30} type={type} /> 
                <SmartCamera fov={30} variant={variant} />
            }
            <Entity rotation={[0, 0, 180]}>
                <GSplat asset={asset} />
            </Entity>
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
    variant = "neutral",
    poster,
    mode = 'orbit',
    defaultMode = 'orbit',
    onTypeChange,
    className, 
    children
} : SplatViewerProps) {

    const [subscribe, notify] = useSubscribe<number>();
    const onAssetProgress = useCallback((progress: number) => notify(progress), [src, notify]);

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
                subscribe={subscribe}
            >
                <Suspense fallback={<PosterComponent poster={poster} />} >
                    <Application fillMode={FILLMODE_NONE} resolutionMode={RESOLUTION_AUTO} autoRender={false}>
                        <SplatComponent src={src} onAssetProgress={onAssetProgress} variant={variant} />
                    </Application>
                    <TooltipProvider>
                        { children }
                    </TooltipProvider>
                </Suspense>
                <HelpDialog />
            </AssetViewerProvider>
        </div>
    )
}