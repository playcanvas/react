import React, { FC, PropsWithChildren, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FILLMODE_NONE,
  FILLMODE_FILL_WINDOW,
  FILLMODE_KEEP_ASPECT,
  RESOLUTION_AUTO,
  Application as PlayCanvasApplication,
  Mouse,
  TouchDevice,
  Entity as PcEntity,
  RESOLUTION_FIXED,
} from 'playcanvas';
import { AppContext, ParentContext } from './hooks';
import { PointerEventsContext } from './contexts/pointer-events-context';
import { usePicker } from './utils/picker';
import { PhysicsProvider } from './contexts/physics-context';

interface GraphicsOptions {
  /** Boolean that indicates if the canvas contains an alpha buffer. */
  alpha?: boolean, //true,
  /** Boolean that indicates that the drawing buffer is requested to have a depth buffer of at least 16 bits. */
  depth?: boolean, //true
  /** Boolean that indicates that the drawing buffer is requested to have a stencil buffer of at least 8 bits. */
  stencil?: boolean, //true
  /** Boolean that indicates whether or not to perform anti-aliasing if possible. */
  antialias?: boolean, //true
  /** Boolean that indicates that the page compositor will assume the drawing buffer contains colors with pre-multiplied alpha. */
  premultipliedAlpha?: boolean, //true
  /** If the value is true the buffers will not be cleared and will preserve their values until cleared or overwritten by the author. */
  preserveDrawingBuffer?: boolean, //false
  /** A hint to the user agent indicating what configuration of GPU is suitable for the WebGL context. */
  powerPreference?: 'default' | 'high-performance' | 'low-power' // 'default'
  /** Boolean that indicates if a context will be created if the system performance is low or if no hardware GPU is available. */
  failIfMajorPerformanceCaveat?: boolean,//false
  /** Boolean that hints the user agent to reduce the latency by desynchronizing the canvas paint cycle from the event loop. */
  desynchronized?: boolean,//false
  /** BBoolean that hints to the user agent to use a compatible graphics adapter for an immersive XR device. */
  xrCompatible?: boolean,//false
}

interface ApplicationProps extends PropsWithChildren<unknown> {
  /** The class name to attach to the canvas component */
  className?: string,
  /** A style object added to the canvas component */
  style?: Record<string, unknown>
  /** Controls how the canvas fills the window and resizes when the window changes. */
  fillMode?: typeof FILLMODE_NONE | typeof FILLMODE_FILL_WINDOW | typeof FILLMODE_KEEP_ASPECT
  /** Change the resolution of the canvas, and set the way it behaves when the window is resized. */
  resolutionMode?: typeof RESOLUTION_AUTO | typeof RESOLUTION_FIXED
  /** Clamps per-frame delta time to an upper bound. Useful since returning from a tab deactivation can generate huge values for dt, which can adversely affect game state. */
  maxDeltaTime?: number
  /** Scales the global time delta. */
  timeScale?: number,
  /** Whether to use the PlayCanvas Physics system. */
  usePhysics?: boolean,
  /** Graphics Settings */
  graphicsDeviceOptions?: GraphicsOptions
}


interface ApplicationWithoutCanvasProps extends ApplicationProps {
  /** A ref to a html canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

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

/**
 * An alternative Application component that does not create a canvas element. 
 * This allows you to create a canvas independently from Playcanvas and pass this in as a ref.
 */
export const ApplicationWithoutCanvas: FC<ApplicationWithoutCanvasProps> = ({
  children,
  canvasRef,
  fillMode = FILLMODE_NONE,
  resolutionMode = RESOLUTION_AUTO,
  maxDeltaTime = 0.1,
  timeScale = 1,
  usePhysics = false,
  ...otherProps
}) => {
  const graphicsDeviceOptions = {
    alpha: true,
    depth: true,
    stencil: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'default',
    failIfMajorPerformanceCaveat: false,
    desynchronized: false,
    xrCompatible: false,
    ...otherProps.graphicsDeviceOptions
  }

  const [app, setApp] = useState<PlayCanvasApplication | null>(null);
  const appRef = useRef<PlayCanvasApplication | null>(null);

  const pointerEvents = useMemo(() => new Set<string>(), []);
  usePicker(appRef.current, canvasRef.current, pointerEvents);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !appRef.current) {
      const localApp = new PlayCanvasApplication(canvas, {
        mouse: new Mouse(canvas),
        touch: new TouchDevice(canvas),
        graphicsDeviceOptions
      });

      localApp.start();
      localApp.setCanvasFillMode(fillMode);
      localApp.setCanvasResolution(resolutionMode);

      appRef.current = localApp;
      setApp(localApp);
    }

    return () => {
      if (!appRef.current) return;
      appRef.current.destroy();
      appRef.current = null;
      setApp(null);
    };
  }, [canvasRef, fillMode, resolutionMode, ...Object.values(graphicsDeviceOptions)]);

  // These app properties can be updated without re-rendering
  useLayoutEffect(() => {
    if (!app) return;
    app.maxDeltaTime = maxDeltaTime;
    app.timeScale = timeScale;
  }, [app])

  if (!app) return null;

  return (
    <PhysicsProvider enabled={usePhysics} app={app}>
      <AppContext.Provider value={appRef.current}>
        <PointerEventsContext.Provider value={pointerEvents}>
          <ParentContext.Provider value={appRef.current?.root as PcEntity}>
            {children}
          </ParentContext.Provider>
        </PointerEventsContext.Provider>
      </AppContext.Provider>
    </PhysicsProvider>
  );
};