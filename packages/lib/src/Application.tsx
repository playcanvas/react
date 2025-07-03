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
  DEVICETYPE_WEBGL2,
  DEVICETYPE_WEBGPU,
  DEVICETYPE_NULL,
} from 'playcanvas';
import { AppContext, ParentContext } from './hooks/index.ts';
import { PointerEventsContext } from './contexts/pointer-events-context.tsx';
import { usePicker } from './utils/picker.tsx';
import { PhysicsProvider } from './contexts/physics-context.tsx';
import { validatePropsWithDefaults, createComponentDefinition, Schema, getNullApplication, applyProps } from './utils/validation.ts';
import { PublicProps } from './utils/types-utils.ts';
import { GraphicsDeviceOptions, defaultGraphicsDeviceOptions } from './types/graphics-device-options.ts';
import { DeviceType, internalCreateGraphicsDevice } from './utils/create-graphics-device.ts';
import { env } from './utils/env.ts';

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
  React.forwardRef<HTMLCanvasElement, CanvasProps>(
    (props : CanvasProps, ref) => {
      const { className, style } = props;
      return <canvas ref={ref} className={className} style={style} aria-label="Interactive 3D Scene"/>;
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

  const validatedProps = validatePropsWithDefaults<ApplicationWithoutCanvasProps, PlayCanvasApplication>(
    propsToValidate, 
    componentDefinition
  );

  const {
    canvasRef,
    fillMode = FILLMODE_NONE,
    resolutionMode = RESOLUTION_AUTO,
    usePhysics = false,
    graphicsDeviceOptions,
    deviceTypes = [DEVICETYPE_WEBGL2],
    ...otherProps
  } = validatedProps;

  // Create a deviceTypes key to avoid re-rendering the application when the deviceTypes prop changes.
  const deviceTypeKey = deviceTypes.join('-');

  /**
   * Also create a key for the graphicsDeviceOptions object to avoid 
   * re-rendering the application when the graphicsDeviceOptions prop changes.
   * We need to sort the keys to create a stable key.
   */
  const graphicsOptsKey = useMemo(() => {
    if (!graphicsDeviceOptions) return 'none';
    return Object.entries(graphicsDeviceOptions)
      .sort(([a], [b]) => a.localeCompare(b))   // order-insensitive
      .map(([k, v]) => `${k}:${String(v)}`)
      .join('|');
  }, [graphicsDeviceOptions]);

  /**
   * Memoize the graphicsDeviceOptions object to avoid re-rendering the application when the graphicsDeviceOptions prop changes.
   */
  const graphicsOpts = useMemo(
    () => ({ ...defaultGraphicsDeviceOptions, ...graphicsDeviceOptions }),
    [graphicsDeviceOptions]                    // ← only changes when *values* change
  );

  const [app, setApp] = useState<PlayCanvasApplication | null>(null);
  const appRef = useRef<PlayCanvasApplication | null>(null);

  const pointerEvents = useMemo(() => new Set<string>(), []);
  usePicker(appRef.current, canvasRef.current, pointerEvents);

  useLayoutEffect(() => {

    // Tracks if the component is unmounted while awaiting for the graphics device to be created
    let cancelled = false; 
  
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas || appRef.current) return;
  
      // Create the graphics device
      const dev = await internalCreateGraphicsDevice(canvas, {
        deviceTypes,
        ...graphicsOpts
      });
  
      // Check if the component unmounted while we were awaiting, and destroy the device immediately and bail out
      if (cancelled) {
        dev.destroy?.();
        return;
      }
  
      // Proceed with normal PlayCanvas init
      const pcApp = new PlayCanvasApplication(canvas, {
        mouse: new Mouse(canvas),
        touch: new TouchDevice(canvas),
        graphicsDevice: dev
      });
      pcApp.start();
  
      appRef.current = pcApp;
      setApp(pcApp);
    })();
  
    // Cleanup create a cancellation flag to avoid re-rendering the application when the component is unmounted.
    return () => {
      cancelled = true;
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
        setApp(null);
      }
    };
  }, [graphicsOptsKey, deviceTypeKey]);        // ← stable deps

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
  });

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

type CanvasProps = {
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
}
interface ApplicationProps extends Partial<PublicProps<PlayCanvasApplication>>, CanvasProps {

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

  /**
   * The device types to use for the graphics device. This allows you to set an order of preference for the graphics device.
   * The first device type in the array that is supported by the browser will be used.
   * 
   * @example
   * <Application deviceTypes={[DEVICETYPE_WEBGPU, DEVICETYPE_WEBGL2]} />
   * 
   * This will use the WebGPU device if it is supported, otherwise it will use the WebGL2 device.
   * 
   * @default [DEVICETYPE_WEBGL2]
   */
  deviceTypes?: DeviceType[],

  /** Graphics Settings */
  graphicsDeviceOptions?: GraphicsDeviceOptions,
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
  deviceTypes: {
    validate: (value: unknown) => Array.isArray(value) && value.every((v: unknown) => typeof v === 'string' && [DEVICETYPE_WEBGPU, DEVICETYPE_WEBGL2, DEVICETYPE_NULL].includes(v as typeof DEVICETYPE_WEBGPU | typeof DEVICETYPE_WEBGL2 | typeof DEVICETYPE_NULL)),
    errorMsg: (value: unknown) => {
      return `deviceTypes must be an array containing one or more of: '${DEVICETYPE_WEBGPU}', '${DEVICETYPE_WEBGL2}', '${DEVICETYPE_NULL}'. Received: ['${value}']`
    },
    /**
     * In test environments, we default to a Null device, because we don't cant use WebGL2/WebGPU.
     * This is just for testing purposes so we can test the fallback logic, without initializing WebGL2/WebGPU.
     */
    default: env === 'test' ? [DEVICETYPE_NULL] : [DEVICETYPE_WEBGL2]
  },
  className: {
    validate: (value: unknown) => typeof value === 'string',
    errorMsg: (value: unknown) => `className must be a string. Received: ${value}`,
    default: 'pc-app'
  },
  style: {
    validate: (value: unknown) => typeof value === 'object' && value !== null,
    errorMsg: (value: unknown) => `style must be an object. Received: ${value}`,
    default: { width: '100%', height: '100%' }
  },
  canvasRef: {
    validate: (value: unknown) => value !== null && 
             typeof value === 'object' && 
             'current' in value,
    errorMsg: (value: unknown) => `canvasRef must be a React ref object. Received: ${value}`,
    default: null
  },
  usePhysics: {
    validate: (value: unknown) => typeof value === 'boolean',
    errorMsg: (value: unknown) => `usePhysics must be a boolean. Received: ${value}`,
    default: false
  },
  fillMode: {
    validate: (value: unknown) => typeof value === 'string' && [FILLMODE_NONE, FILLMODE_FILL_WINDOW, FILLMODE_KEEP_ASPECT].includes(value as typeof FILLMODE_NONE | typeof FILLMODE_FILL_WINDOW | typeof FILLMODE_KEEP_ASPECT),
    errorMsg: () => `"fillMode" must be one of: ${FILLMODE_NONE}, ${FILLMODE_FILL_WINDOW}, ${FILLMODE_KEEP_ASPECT}`,
    default: FILLMODE_NONE
  },
  resolutionMode: {
    validate: (value: unknown) => typeof value === 'string' && [RESOLUTION_AUTO, RESOLUTION_FIXED].includes(value as typeof RESOLUTION_AUTO | typeof RESOLUTION_FIXED),
    errorMsg: () => `"resolutionMode" must be one of: ${RESOLUTION_AUTO}, ${RESOLUTION_FIXED}`,
    default: RESOLUTION_AUTO
  },
  graphicsDeviceOptions: {
    validate: (value: unknown) => value === undefined || (typeof value === 'object' && value !== null),
    errorMsg: (value: unknown) => `graphicsDeviceOptions must be an object. Received: ${value}`,
    default: undefined
  }
} as Schema<ApplicationWithoutCanvasProps, PlayCanvasApplication>