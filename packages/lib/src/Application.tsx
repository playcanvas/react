import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  FILLMODE_NONE,
  RESOLUTION_AUTO,
  Application as PlayCanvasApplication,
  Mouse,
  TouchDevice,
  Entity as PcEntity,
} from 'playcanvas';
import { AppContext, ParentContext } from './hooks';

interface ApplicationProps {
  children: React.ReactNode;
}

export const Application: React.FC<ApplicationProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <>
      <canvas
        className="pc-app"
        style={{ width: '100%', height: '100%' }}
        ref={canvasRef}
      />
      <ApplicationWithoutCanvas canvasRef={canvasRef}>
        {children}
      </ApplicationWithoutCanvas>
    </>
  );
};

interface ApplicationWithoutCanvasProps {
  children: React.ReactNode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ApplicationWithoutCanvas: React.FC<ApplicationWithoutCanvasProps> = ({
  children,
  canvasRef,
}) => {
  const [app, setApp] = useState<PlayCanvasApplication | null>(null);
  const appRef = useRef<PlayCanvasApplication | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !appRef.current) {
      const localApp = new PlayCanvasApplication(canvas, {
        mouse: new Mouse(canvas),
        touch: new TouchDevice(canvas),
      });

      
      localApp.start();
      localApp.setCanvasFillMode(FILLMODE_NONE);
      localApp.setCanvasResolution(RESOLUTION_AUTO);

      appRef.current = localApp;
      setApp(localApp);
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
    <AppContext.Provider value={appRef.current}>
      <ParentContext.Provider value={appRef.current?.root as PcEntity}>
        {children}
      </ParentContext.Provider>
    </AppContext.Provider>
  );
};