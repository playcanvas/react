"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetViewer } from "./splat-viewer-context";
import { TooltipTrigger, TooltipContent, Tooltip } from "@/components/ui/tooltip";

type DownloadButtonProps = {
  variant?: "default" | "outline" | "ghost" | "link";
}

function DownloadButton({ variant = "ghost" }: DownloadButtonProps) {
  const { src, triggerDownload } = useAssetViewer(); // assume src is a URL string

  return (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                className="cursor-pointer pointer-events-auto"
                variant={variant} 
                size="icon"
                onClick={triggerDownload}
                disabled={!src}
                title="Download asset"
            >
                <DownloadIcon />
            </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={4}>
            Download
        </TooltipContent>
    </Tooltip>
  );
}

export { DownloadButton };