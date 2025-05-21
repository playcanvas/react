"use client";

import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { useAssetViewer } from "./splat-viewer-context";
import { TooltipTrigger, TooltipContent, Tooltip } from "@components/ui/tooltip";

const FullScreenToggleIcon = ({ isFullscreen }: { isFullscreen: boolean }) => {
    return isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />;
}

type FullScreenButtonProps = {
    variant?: "default" | "outline" | "ghost" | "link";
}

function FullScreenButton({ variant = "ghost" }: FullScreenButtonProps) {
    const { isFullscreen, toggleFullscreen } = useAssetViewer();

    return (<Tooltip>
        <TooltipTrigger asChild>
            <Button className="cursor-pointer pointer-events-auto" variant={variant} size="icon" onClick={toggleFullscreen}>
                <FullScreenToggleIcon isFullscreen={isFullscreen} />
            </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={4}>
            {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        </TooltipContent>
    </Tooltip>);
}

export { FullScreenButton };