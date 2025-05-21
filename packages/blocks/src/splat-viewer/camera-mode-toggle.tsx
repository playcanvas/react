"use client"

import { Move3D, Rotate3D } from "lucide-react";
import { useAssetViewer } from "./splat-viewer-context";
import { Button } from "@components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

function CameraModeToggle() {

    const { mode, setMode } = useAssetViewer();
  
    return (<Tooltip>
        <TooltipTrigger asChild>
            <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer pointer-events-auto"
            onClick={() => setMode(mode === "orbit" ? "fly" : "orbit")}
            >
            { mode === 'orbit' 
                ? <Move3D />
                : <Rotate3D />
            }
            </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={4}>
            {mode === 'orbit' ? "Fly Camera" : "Orbit Camera"}
        </TooltipContent>
    </Tooltip>)
  }

export { CameraModeToggle };