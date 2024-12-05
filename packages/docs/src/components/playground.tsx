'use client'

import { FC, useEffect, useRef } from "react";

import { Editor, EditorProvider, Preview } from './editor';
import { Suspense } from 'react';
import { Leva } from "leva";
import { FILLMODE_NONE, RESOLUTION_AUTO } from "playcanvas";
import { Application } from "@playcanvas/react";

import { useApp } from "@playcanvas/react/hooks";
import { TerminalIcon } from "lucide-react";

const ResizeHandler: FC<{ resizeRef: React.RefObject<HTMLDivElement> }> = ({ resizeRef }) => {
    const app = useApp();

    useEffect(() => {
        if (!resizeRef.current || !app) return;

        const resizeObserver = new ResizeObserver(() => {
            app.resizeCanvas();
        });

        resizeObserver.observe(resizeRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [app, resizeRef.current]);

    return null;
}

export interface PlaygroundProps {
    code?: string
    name?: string
    path?: string
}

const PlayGround: FC<PlaygroundProps> = ({ 
    code = '', 
    name = '',
    path = ''
}) => {

    const resizeRef = useRef<HTMLDivElement>(null);
    
    return (
        <EditorProvider initialCode={code} >

            <div id='leva-portal' className='h-0' onMouseMove={e => e.stopPropagation() } >
                <Leva collapsed hidden/>
            </div>
            <div className="w-screen h-screen" ref={resizeRef} >
                <Application usePhysics fillMode={FILLMODE_NONE} resolutionMode={RESOLUTION_AUTO} >
                    <ResizeHandler resizeRef={resizeRef}/>
                    <Suspense >
                        <Preview/>
                    </Suspense>
                </Application>
            </div>
            <Suspense>
                <div 
                    className='absolute top-[var(--nextra-navbar-height)] h-[calc(100vh-var(--nextra-navbar-height))] flex mx-auto max-w-[90rem] p-8'
                    onMouseMove={e => e.stopPropagation() }
                >
                    <div className='w-xl overflow-hidden rounded-xl shadow-lg opacity-70 hover:opacity-90 focused:opacity-90 transition-opacity duration-300'>
                        <div id='code-editor-header' className='flex justify-between items-center p-2 bg-zinc-800 px-4'>
                            <div id='code-editor-title' className='flex text-xs items-center justify-between font-mono opacity-80 w-full'>
                                <TerminalIcon className='w-4 h-4' />
                                <a 
                                    href={`https://github.com/playcanvas/react/tree/main/packages/docs/${path}`} 
                                    target='_blank' rel="noreferrer"
                                    className='px-2 hover:underline opacity-80 hover:opacity-100 transition-opacity duration-300'
                                >
                                    {name}
                                </a>
                            </div>
                        </div>
                        <Editor />
                    </div>
                </div>
            </Suspense>
        </EditorProvider>
    )
}

export default PlayGround;