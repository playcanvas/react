"use client";

import React, { useRef, useEffect } from 'react';
import { reconciler } from './reconciler';
import * as pc from 'playcanvas';

interface CanvasProps {
  children?: React.ReactNode;
  // onInitialize?: (app: pc.Application) => void;
}

export const PlayCanvasCanvas: React.FC<CanvasProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * This ref holds the "Fiber root" object returned by createContainer(...),
   * NOT just the container data. We'll store that once we initialize.
   */
  const fiberRootRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Create the PlayCanvas app
    const app = new pc.Application(canvasRef.current, {
      mouse: new pc.Mouse(canvasRef.current),
      touch: new pc.TouchDevice(canvasRef.current),
      elementInput: new pc.ElementInput(canvasRef.current),
      keyboard: new pc.Keyboard(window),
    });

    app.start();

    window.pc = pc

    // Setup defaults if desired
    app.scene.exposure = 1;
    // app.scene.gammaCorrection = pc.GAMMA_SRGB;
    // app.scene.toneMapping = pc.TONEMAP_ACES;
    app.scene.ambientLight = new pc.Color(0.4, 0.4, 0.4);

    // if (onInitialize) {
    //   onInitialize(app);
    // }

    // 2. Create the container object (plain JS) that the reconciler uses.
    const rootContainer = { app };

    // 3. Create the Fiber root from that container object
    // @ts-ignore
    const fiberRoot = reconciler.createContainer(
      rootContainer,
      // 0,     // RootTag (0 = legacy, 1 = concurrent, etc.)
      // null,  // hydration callbacks
      // false, // isStrictMode
      // null,  // concurrentUpdatesByDefaultOverride
      // '',    // identifierPrefix
      // (_) => _, // onRecoverableError
      // null   // transitionCallbacks
    );

    // @ts-ignore
    fiberRoot.onUncaughtError = (error) => {
      console.error('Uncaught error in PlayCanvasCanvas:', error);
    };

    

    // 4. Store the Fiber root in our ref for future updates
    fiberRootRef.current = fiberRoot;

    // element: ReactNode,
    //         container: OpaqueRoot,
    //         parentComponent?: Component<any, any> | null,
    //         callback?: (() => void) | null,
    // 5. Perform the initial render
    // reconciler.updateContainer(children, fiberRoot, null);
    reconciler.updateContainer(children, fiberRoot, null);

    // Cleanup when unmounting
    return () => {
      app.destroy();
      fiberRootRef.current = null;
    };
  }, [children]);

  // If `children` changes at runtime, we re-render onto the same Fiber root
  // useEffect(() => {
  //   if (fiberRootRef.current) {
  //     reconciler.updateContainer(children, fiberRootRef.current, null);
  //   }
  // }, [children]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '800px', height: '600px' }}
    />
  );
};