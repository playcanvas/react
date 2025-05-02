"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetViewer } from "./splat-viewer-context";
import { TooltipTrigger, TooltipContent, Tooltip } from "@/components/ui/tooltip";

type DownloadButtonProps = {
  variant?: "default" | "outline" | "ghost" | "link";
}

function DownloadButton({ variant = "ghost" }: DownloadButtonProps) {
  const { src } = useAssetViewer(); // assume src is a URL string

  const handleDownload = () => {
    if (!src) return;

    const link = document.createElement("a");
    link.href = src;
    link.download = src.split("/").pop() || "asset";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button
                className="cursor-pointer pointer-events-auto"
                variant={variant} 
                size="icon"
                onClick={handleDownload}
                disabled={!src}
                title="Download asset"
            >
                <DownloadIcon />
            </Button>
        </TooltipTrigger>
        <TooltipContent>
            Download
        </TooltipContent>
    </Tooltip>
  );
}

export { DownloadButton };