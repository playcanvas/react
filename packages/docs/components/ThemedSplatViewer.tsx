"use client";
import { Viewer } from "@playcanvas/blocks";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@lib/utils";

export function ThemedSplatViewer({ src }: { src: string }) {

    const [variant, setVariant] = useState<"noir" | "paris" | "neutral" | "none">("paris");

    return <>
        <div className='relative mb-4 lg:mb-12'>
            <Viewer.Splat variant={variant} src={src} className="aspect-4:1 mt-8 lg:my-8 -mx-4 lg:-mx-6 bg-gray-200 md:rounded-lg shadow-xl cursor-grab active:cursor-grabbing" >
                <Viewer.Progress className="bg-[#e0004d]" />
            </Viewer.Splat>
            <div className='lg:absolute bottom-0 right-0 w-full py-2 lg:py-8 lg:text-background text-xs italic text-center pointer-events-none'>
                <span className="pointer-events-auto">
                    Rendered with the <code>Splat</code> block — a React component for Gaussian splats.{" "}
                    <a className="underline text-bold" href="/blocks/splat-viewer">Learn more →</a>
                </span>
            </div>
            <div className='w-full absolute top-0 flex flex-row gap-2 p-2 lg:p-4 justify-center'>
                <Button size="sm" variant="link" className={cn("text-background opacity-50 hover:opacity-100 cursor-pointer text-xs", variant === "noir" && "underline")} onClick={() => setVariant("noir")}>Noir</Button>
                <Button size="sm" variant="link" className={cn("text-background opacity-50 hover:opacity-100 cursor-pointer text-xs", variant === "neutral" && "underline")} onClick={() => setVariant("neutral")}>Neutral</Button>
                <Button size="sm" variant="link" className={cn("text-background opacity-50 hover:opacity-100 cursor-pointer text-xs", variant === "paris" && "underline")} onClick={() => setVariant("paris")}>Paris</Button>
                <Button size="sm" variant="link" className={cn("text-background opacity-50 hover:opacity-100 cursor-pointer text-xs", variant === "none" && "underline")} onClick={() => setVariant("none")}>None</Button>
            </div>
        </div>
    </>
}