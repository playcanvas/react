"use client";

import { Slider } from "@components/ui/slider";
import { useTimeline } from "./splat-viewer-context.ts";
import { Button } from "@components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import { TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

function PlayButton() {

    const { setIsPlaying, isPlaying } = useTimeline();

    return (
        <>
            <TooltipTrigger asChild>
                <Button size='icon' variant='ghost' className="cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
                    { isPlaying ? <PauseIcon /> : <PlayIcon /> }
                </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>
                { isPlaying ? "Pause" : "Play" }
            </TooltipContent>
        </>
    )
}

function Timeline() {
    
    const { getTime, setTime, setIsPlaying, onCommit } = useTimeline();

    const onValueChange = ([val]: number[]) => {
        setIsPlaying(false);
        setTime(val);
    };
    
    const onValueCommit = ([val]: number[]) => {
        onCommit?.(val);
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