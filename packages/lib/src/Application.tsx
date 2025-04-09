import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
} from 'playcanvas';
import { AppContext, ParentContext } from './hooks';
import { PointerEventsContext } from './contexts/pointer-events-context';
import { usePicker } from './utils/picker';
import { PhysicsProvider } from './contexts/physics-context';
import { validatePropsWithDefaults, createComponentDefinition, Schema, getNullApplication, ComponentDefinition, applyProps } from './utils/validation';
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
      <Canvas
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

const Canvas = React.memo(
  React.forwardRef<HTMLCanvasElement, { className: string; style: React.CSSProperties }>(
    ({ className, style }, ref) => {
      return <canvas ref={ref} className={className} style={style} />;
    }
  )
);

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

  const validatedProps = validatePropsWithDefaults<ApplicationWithoutCanvasProps>(
    propsToValidate, 
    componentDefinition as ComponentDefinition<ApplicationWithoutCanvasProps>
  );

  const {
    canvasRef,
    fillMode = FILLMODE_NONE,
    resolutionMode = RESOLUTION_AUTO,
    usePhysics = false,
    graphicsDeviceOptions,
    ...otherProps
  } = validatedProps;

  const localGraphicsDeviceOptions = {
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
    ...graphicsDeviceOptions
  }

  const [app, setApp] = useState<PlayCanvasApplication | null>(null);
  const appRef = useRef<PlayCanvasApplication | null>(null);

  const pointerEvents = useMemo(() => new Set<string>(), []);
  usePicker(appRef.current, canvasRef.current, pointerEvents);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !appRef.current) {
      console.log("Creating new app");
      const localApp = new PlayCanvasApplication(canvas, {
        mouse: new Mouse(canvas),
        touch: new TouchDevice(canvas),
        graphicsDeviceOptions: localGraphicsDeviceOptions
      });

      localApp.start();

      appRef.current = localApp;
      setApp(localApp);
    }

    return () => {
      if (!appRef.current) return;
      appRef.current.destroy();
      appRef.current = null;
      setApp(null);
    };
  }, [canvasRef, ...Object.values(localGraphicsDeviceOptions)]);

  // Separate useEffect for these props to avoid re-rendering
  useEffect(() => {
    if (!app) return;
    app.setCanvasFillMode(fillMode);
    app.setCanvasResolution(resolutionMode);
  }, [app, fillMode, resolutionMode]);
  
  // These app properties can be updated without re-rendering
  useLayoutEffect(() => {
    if (!app) return;
    applyProps(app, componentDefinition.schema, otherProps as Record<keyof PlayCanvasApplication, unknown>);
  }/*, [app, ...Object.values(otherProps)]*/);

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
  /** 
   * The class name to attach to the canvas component
   * @default pc-app
   */
  className?: string,

  /** 
   * A style object added to the canvas component 
   * @default { width: '100%', height: '100%' }
   */
  style?: Record<string, unknown>

  /** 
   * Controls how the canvas fills the window and resizes when the window changes.
   * @default FILLMODE_NONE
   */
  fillMode?: typeof FILLMODE_NONE | typeof FILLMODE_FILL_WINDOW | typeof FILLMODE_KEEP_ASPECT

  /**
   * Change the resolution of the canvas, and set the way it behaves when the window is resized.
   * @default RESOLUTION_AUTO
   */
  resolutionMode?: typeof RESOLUTION_AUTO | typeof RESOLUTION_FIXED

  /** 
   * When `true`, the PlayCanvas Physics system will be enabled.
   * @default false
   */
  usePhysics?: boolean,
  /** Graphics Settings */
  graphicsDeviceOptions?: GraphicsOptions,
  /** The children of the application */
  children?: React.ReactNode,
}


interface ApplicationWithoutCanvasProps extends ApplicationProps {
  /** A ref to a html canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const componentDefinition = createComponentDefinition(
  "Application",
  () => getNullApplication(),
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
} as Schema<PlayCanvasApplication>