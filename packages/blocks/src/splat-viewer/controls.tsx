
"use client"

import { useAssetViewer, useTimeline } from "./splat-viewer-context.tsx";
import { cn } from "@lib/utils";

type ControlsProps = {
    /**
     * The className of the controls
     */
    className?: string,
    /**
     * When enabled, the controls will be hidden when the user is not interacting with the asset.
     * @defaultValue false
     */
    autoHide?: boolean,
    /**
     * The children of the controls
     */
    children: React.ReactNode,
}

export function Controls({ className, autoHide = false, children }: ControlsProps) {
  const { isInteracting } = useAssetViewer();
  const { isPlaying } = useTimeline();

  return (
    <div
      className={cn(
        "absolute w-full bottom-0 left-0 pointer-events-none",
        "flex items-end justify-start p-2 gap-2",
        "transition-opacity duration-500",
        autoHide && isPlaying && !isInteracting ? "opacity-0" : "opacity-100",
        className
      )}
    >
        {children}
    </div>
  );
}