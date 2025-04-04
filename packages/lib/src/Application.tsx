import React, { FC, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  type GraphicsDevice,
  NullGraphicsDevice,
} from 'playcanvas';
import { AppContext, ParentContext } from './hooks';
import { PointerEventsContext } from './contexts/pointer-events-context';
import { usePicker } from './utils/picker';
import { PhysicsProvider } from './contexts/physics-context';
import { validateAndSanitizeProps, createComponentDefinition, Schema } from './utils/validation';
import { PublicProps } from './utils/types-utils';

/**
 * The **Application** component is the root node of the PlayCanvas React API. It creates a canvas element
 * and initializes a PlayCanvas application instance.
 * 
 * @param {ApplicationProps} props - The props to pass to the application component.
 * @returns {React.ReactNode} - The application component.
 * 
 * @example
 * <Application>
 *  <Entity />
 * </Application>
 */
export const Application: React.FC<ApplicationProps> = ({ 
  children, 
  className = 'pc-app', 
  style = { width: '100%', height: '100%' },
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
 * This allows you to create a canvas independently from PlayCanvas and pass it in as a ref.
 * 
 * @param {ApplicationWithoutCanvasProps} props - The props to pass to the application component.
 * @returns {React.ReactNode} The application component.
 * 
 * @example
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * 
 * return (
 *   <>
 *     <canvas ref={canvasRef} />
 *     <ApplicationWithoutCanvas canvasRef={canvasRef}>
 *       <Entity />
 *     </ApplicationWithoutCanvas>
 *   </>
 * );
 */
export const ApplicationWithoutCanvas: FC<ApplicationWithoutCanvasProps> = (props) => {
  
  const { children, ...propsToValidate } = props;

  const validatedProps = validateAndSanitizeProps<ApplicationWithoutCanvasProps>(
    propsToValidate, 
    componentDefinition
  );

  const {
    canvasRef,
    fillMode = FILLMODE_NONE,
    resolutionMode = RESOLUTION_AUTO,
    maxDeltaTime = 0.1,
    timeScale = 1,
    usePhysics = false,
    ...otherProps
  } = validatedProps;

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
  }, [app, maxDeltaTime, timeScale])

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

type GraphicsOptions = Partial<PublicProps<GraphicsDevice>>

interface ApplicationProps extends Partial<PublicProps<PlayCanvasApplication>> {
  /** The class name to attach to the canvas component */
  className?: string,
  /** A style object added to the canvas component */
  style?: Record<string, unknown>
  /** Controls how the canvas fills the window and resizes when the window changes. */
  fillMode?: typeof FILLMODE_NONE | typeof FILLMODE_FILL_WINDOW | typeof FILLMODE_KEEP_ASPECT
  /** Change the resolution of the canvas, and set the way it behaves when the window is resized. */
  resolutionMode?: typeof RESOLUTION_AUTO | typeof RESOLUTION_FIXED
  // /** Clamps per-frame delta time to an upper bound. Useful since returning from a tab deactivation can generate huge values for dt, which can adversely affect game state. */
  maxDeltaTime?: number
  // /** Scales the global time delta. */
  timeScale?: number,
  /** Whether to use the PlayCanvas Physics system. */
  usePhysics?: boolean,
  /** Graphics Settings */
  graphicsDeviceOptions?: GraphicsOptions,
  /** The children of the application */
  children?: React.ReactNode,
}


interface ApplicationWithoutCanvasProps extends ApplicationProps {
  /** A ref to a html canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const componentDefinition = createComponentDefinition(
  "Application",
  () => {
    const mockCanvas = { id: 'pc-react-mock-canvas' };
    // @ts-expect-error - Mock canvas is not a real canvas
    return new PlayCanvasApplication(mockCanvas, { graphicsDevice: new NullGraphicsDevice(mockCanvas) });
  },
  (app) => app.destroy()

)

componentDefinition.schema = {
  ...componentDefinition.schema,
  canvasRef: {
    validate: (value: unknown) => {
      return value !== null && 
             typeof value === 'object' && 
             'current' in value;
    },
    errorMsg: (value: unknown) => `canvasRef must be a React ref object. Received: ${value}`,
    default: null
  },
  usePhysics: {
    validate: (value: unknown) => typeof value === 'boolean',
    errorMsg: (value: unknown) => `usePhysics must be a boolean. Received: ${value}`,
    default: false
  },
  fillMode: {
    validate: (value: unknown) => typeof value === 'string' && [FILLMODE_NONE, FILLMODE_FILL_WINDOW, FILLMODE_KEEP_ASPECT].includes(value),
    errorMsg: () => `"fillMode" must be one of: ${FILLMODE_NONE}, ${FILLMODE_FILL_WINDOW}, ${FILLMODE_KEEP_ASPECT}`,
    default: FILLMODE_NONE
  },
  resolutionMode: {
    validate: (value: unknown) => typeof value === 'string' && [RESOLUTION_AUTO, RESOLUTION_FIXED].includes(value),
    errorMsg: () => `"resolutionMode" must be one of: ${RESOLUTION_AUTO}, ${RESOLUTION_FIXED}`,
    default: RESOLUTION_AUTO
  }
} as Schema<ApplicationProps>