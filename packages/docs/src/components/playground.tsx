'use client'

import { FC, useEffect, useRef } from "react";

import { Editor, EditorProvider, Preview } from './editor';
import { Suspense } from 'react';
import { Leva } from "leva";
import { FILLMODE_FILL_WINDOW, RESOLUTION_AUTO } from "playcanvas";
import { Application } from "@playcanvas/react";

import { useApp } from "@playcanvas/react/hooks";

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
}

const PlayGround: FC<PlaygroundProps> = ({ 
    code = '', 
    name = '' 
}) => {

    const resizeRef = useRef<HTMLDivElement>(null);
    
    return (
        <EditorProvider initialCode={code} >

            <div id='leva-portal' className='h-0' onMouseMove={e => e.stopPropagation() } >
                <Leva collapsed hidden/>
            </div>
            <div className="absolute top-0 left-0 w-full h-full" ref={resizeRef} >
                <Application usePhysics fillMode={FILLMODE_FILL_WINDOW} resolutionMode={RESOLUTION_AUTO} >
                    <ResizeHandler resizeRef={resizeRef}/>
                    <Suspense >
                        <Preview/>
                    </Suspense>
                </Application>
            </div>
            <Suspense>
                <div 
                    className='h-full flex mx-auto max-w-[90rem] x:pl-[max(env(safe-area-inset-left),1.5rem)] x:pr-[max(env(safe-area-inset-right),1.5rem)] py-12'
                    onMouseMove={e => e.stopPropagation() }
                >
                    <div className='w-xl overflow-hidden rounded-xl shadow-lg opacity-80 hover:opacity-100 transition-opacity duration-300'>
                        <div id='code-editor-header' className='flex justify-between items-center p-2 bg-gray-800 px-4'>
                            <div id='code-editor-title' className='text-xs font-mono opacity-80'>
                                {name}
                            </div>
                            <div id='code-editor-actions' className='flex items-center gap-2'>
                                <button
                                    className="p-1.5 hover:bg-gray-700 rounded-md transition-colors duration-200"
                                    title="More options"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Add dropdown menu functionality
                                    }}
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
                                    >
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="19" cy="12" r="1" />
                                        <circle cx="5" cy="12" r="1" />
                                    </svg>
                                </button>
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