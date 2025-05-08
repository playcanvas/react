"use client";

import { Slider } from "@/components/ui/slider";
import { useTimeline } from "./splat-viewer-context";
import { Button } from "../button";
import { PauseIcon, PlayIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { TooltipProvider } from "../tooltip";

function PlayButton() {

    const { setIsPlaying, isPlaying } = useTimeline();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size='icon' variant='ghost' className="cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
                        { isPlaying ? <PauseIcon /> : <PlayIcon /> }
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    { isPlaying ? "Pause" : "Play" }
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function Timeline() {
    
    const { getTime, setTime, setIsPlaying, onCommit, subscribe } = useTimeline();

    const onValueChange = ([val]: number[]) => {
        setIsPlaying(false);
        setTime(val);
    };
    
    const onValueCommit = ([val]: number[]) => {
        onCommit(val);
    }

    return (<>
        <PlayButton />
        <Slider 
            defaultValue={[getTime()]} 
            max={1} 
            min={0} 
            step={0.001} 
            onValueChange={onValueChange} 
            onValueCommit={onValueCommit}
        />
    </>)
}   

export { Timeline };