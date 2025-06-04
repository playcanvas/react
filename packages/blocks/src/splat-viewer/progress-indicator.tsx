"use client"

import { useEffect, useRef } from "react";
import { useAssetViewer } from "./splat-viewer-context";
// import { useFrame } from "@playcanvas/react/hooks";

function Progress() {
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<number>(0);
    const { asset, subscribeToProgress } = useAssetViewer();

    useEffect(() => {
        const unsubscribe = subscribeToProgress((progress) => {
            progressRef.current = progress;
        });
        return () => unsubscribe();
    }, [subscribeToProgress]);

    // useFrame(() => {
        // if (progressBarRef.current) {
        //     progressBarRef.current.style.width = `${progressRef.current * 100}%`;
        // }
    // })

    if (asset) return null;

    return (
        <div ref={progressBarRef} className="w-full h-1 absolute inset-0 top-0 left-0 bg-accent" />
    )
}

export default Progress;