import { FILLMODE_NONE, Application as PlayCanvasApplication, RESOLUTION_AUTO, Mouse, TouchDevice } from "playcanvas";
import { useLayoutEffect, useRef, useState } from "react";
import { AppContext, ParentContext } from "./hooks";

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
    const appRef = useRef(null);
  
    useLayoutEffect(() => {
      if (canvasRef.current && !appRef.current) {
        const localApp = new PlayCanvasApplication(canvasRef.current, {
          mouse: new Mouse(canvasRef.current),
          touch: new TouchDevice(canvasRef.current),
          // graphicsDeviceOptions: {
          //   alpha: true
          // }
        });
  
        
        appRef.current = localApp;
        setApp(localApp);

        localApp.start();
        localApp.setCanvasFillMode(FILLMODE_NONE);
        localApp.setCanvasResolution(RESOLUTION_AUTO);
      }
  
      return () => {
        if (!appRef.current) return;
        appRef.current.destroy();
        appRef.current = null;
        setApp(null);
      };

    }, [canvasRef]);
  
    if (!app) return null;
  
    return (
      <AppContext.Provider value={app}>
        <ParentContext.Provider value={app.root}>{children}</ParentContext.Provider>
      </AppContext.Provider>
    );
  };