import { FILLMODE_NONE, Application as PlayCanvasApplication, RESOLUTION_AUTO, Mouse, TouchDevice } from "playcanvas";
import { useLayoutEffect, useRef, useState } from "react";
import { AppContext } from "./contexts/app-context";
import { ParentContext } from "./contexts/parent-context";
import { Entity } from "./Entity";

export const Application = ({ children }) => {
    const canvas = useRef();
    return <>
        <canvas className="pc-app" style={{ width: '100%', height: '100%' }} ref={canvas}/>
        <ApplicationWithoutCanvas canvasRef={canvas}>
            { children }
        </ApplicationWithoutCanvas>
    </>
}

export const ApplicationWithoutCanvas = ({ children, canvasRef }) => {

    const [app, setApp] = useState();

    useLayoutEffect(() => {
        if(canvasRef.current && !app){

            console.log('starting')

            const localApp = new PlayCanvasApplication(canvasRef.current, {
                mouse: new Mouse(canvasRef.current),
                touch: new TouchDevice(canvasRef.current)
            });
            
            setApp(localApp);
            localApp.start();

            localApp.setCanvasFillMode(FILLMODE_NONE);
            localApp.setCanvasResolution(RESOLUTION_AUTO);
            
        }
        
        return () => {
            console.log('destroying')
            setApp(null);
        };
    }, [canvasRef]);
    
    
    if(!app) return null;

    // console.log(app.scene)
    
    return (
        <AppContext.Provider value={app}>
            <ParentContext.Provider value={app.root}>
                {/* <Entity > */}
                { children }
                {/* </Entity> */}
            </ParentContext.Provider>
        </AppContext.Provider>
    )
}