"use client";

import React, { useRef, useLayoutEffect } from 'react';
import {
  FILLMODE_NONE,
  RESOLUTION_AUTO,
  Application as PcApplication,
  Mouse,
  TouchDevice
} from 'playcanvas';

import { reconciler } from './reconciler';
import { AppContext } from './hooks';
import { FiberProvider, useContextBridge } from 'its-fine';

import { type SyntheticMouseEvent, type SyntheticPointerEvent } from './utils/synthetic-event';
import { type OptionalPublicMutableNoFunctions } from './types';
// import type {ReadonlyKeysOf} from 'type-fest';

interface GraphicsOptions extends OptionalPublicMutableNoFunctions<pc.GraphicsDevice> {}

interface ApplicationProps extends OptionalPublicMutableNoFunctions<pc.Application> {
    children?: React.ReactNode,
    /** The class name to attach to the canvas component */
    className?: string,
    /** A style object added to the canvas component */
    style?: Record<string, unknown>
    /** Whether to use the PlayCanvas Physics system. */
    usePhysics?: boolean,
    /** Graphics Settings */
    graphicsDeviceOptions?: GraphicsOptions
}

interface BaseApplicationProps extends ApplicationProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const BaseApplication: React.FC<BaseApplicationProps> = ({
  children, 
  canvasRef,
  className = 'pc-app', 
  usePhysics = false,
  style = { width: '100%', height: '100%' },
  fillMode = FILLMODE_NONE,
  resolutionMode = RESOLUTION_AUTO,
  graphicsDeviceOptions,
  ...rest
}) => {

  const appRef = useRef<pc.Application | null>(null);
  const fiberRootRef = useRef<any>(null);
  const Bridge = useContextBridge();

  if (!canvasRef) {
    throw new Error('Canvas ref is required');
  }

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && !appRef.current) {

      const app = new PcApplication(canvas, {
        mouse: new Mouse(canvas),
        touch: new TouchDevice(canvas),
        graphicsDeviceOptions
      });

      // @ts-ignore
      globalThis.app = app

      app.start();
      
      // @ts-ignore
      const fiberRoot = reconciler.createContainer({ app });
      fiberRoot.onUncaughtError = (error: Error) => {
        console.error('Uncaught error in playcanvas-react:', error);
      };
      
      fiberRootRef.current = fiberRoot;
      appRef.current = app;
    }

    // Cleanup when unmounting
    return () => {
      appRef.current?.destroy();
      appRef.current = null;
      fiberRootRef.current = null;
    };

  }, [canvasRef, ...(graphicsDeviceOptions ? Object.values(graphicsDeviceOptions) : [])]);


  // Update the container when the children change
  useLayoutEffect(() => {
    const app = appRef.current;
    const fiberRoot = fiberRootRef.current;

    if (!app) {
      throw new Error('App not found');
    }

    if (!fiberRoot) {
      throw new Error('Fiber root not found');
    }
    
    reconciler.updateContainer(
      <Bridge>
        <AppContext.Provider value={app}>
          { children }
        </AppContext.Provider>
      </Bridge>, fiberRoot, null);
  }, [children, canvasRef]);


  // Some props can be updated without re-creating the app
  useLayoutEffect(() => {
    if(!appRef.current) return;
    const app : pc.Application = appRef.current;

    app.setCanvasFillMode(fillMode);
    app.setCanvasResolution(resolutionMode);
  
    Object.assign(app, rest);
  }, [fillMode, resolutionMode, ...Object.values(rest)]);

  return null;
};

export const ApplicationWithoutCanvas: React.FC<BaseApplicationProps> = ({
  children,
  canvasRef,
  ...props
}) => {
  return <FiberProvider>
    <BaseApplication {...props} canvasRef={canvasRef}>
      {children}
    </BaseApplication>
  </FiberProvider>
};

/**
 * The **Application** component is the root node of the PlayCanvas React api. It creates a canvas element
*/
export const Application: React.FC<ApplicationProps> = ({ 
  children, 
  className = 'pc-app', 
  style = { width: '100%', height: '100%' },
  ...props
}) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <>
      <canvas
        className={className}
        style={style}
        ref={canvasRef}
      />
        <ApplicationWithoutCanvas canvasRef={canvasRef} {...props}>
          {children}
        </ApplicationWithoutCanvas>
    </>
  );
};

// TYPES
export type PointerEventCallback = (event: SyntheticPointerEvent) => void;
export type MouseEventCallback = (event: SyntheticMouseEvent) => void;

interface EntityProps {
    // PlayCanvas specific props
    name?: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    enabled?: boolean;
    
    // React specific props
    children?: React.ReactNode;
    onPointerUp?: PointerEventCallback;
    onPointerDown?: PointerEventCallback;
    onPointerOver?: PointerEventCallback;
    onPointerOut?: PointerEventCallback;
    onClick?: MouseEventCallback;

}


/*
 * The following type utility extracts the available components from the host ComponentSystemRegistry.
 * This allows the types to reflect the available components in the host
*/
// type SystemKeys = Pick<pc.ComponentSystemRegistry, ReadonlyKeysOf<pc.ComponentSystemRegistry>>;
// type AllSystemIntrinsics = {
//   [K in keyof SystemKeys]:
//     // @ts-ignore
//     React.RefAttributes<SystemKeys[K]["ComponentType"]> & 
//     // @ts-ignore
//     OptionalPublicMutableNoFunctions<SystemKeys[K]["ComponentType"]>
// };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements /*extends AllSystemIntrinsics*/ { 
      entity: React.RefAttributes<pc.Entity> & EntityProps;
      camera: React.RefAttributes<pc.CameraComponent>;
      light: React.RefAttributes<pc.LightComponent>;
      render: React.RefAttributes<pc.RenderComponent>;
      pcscript: React.RefAttributes<pc.ScriptComponent>;
      anim: React.RefAttributes<pc.AnimComponent>;
    }
  }
}