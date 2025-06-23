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
  createGraphicsDevice
} from 'playcanvas';
import { AppContext, ParentContext } from './hooks';
import { PointerEventsContext } from './contexts/pointer-events-context';
import { usePicker } from './utils/picker';
import { PhysicsProvider } from './contexts/physics-context';
import { validatePropsWithDefaults, createComponentDefinition, Schema, getNullApplication, applyProps } from './utils/validation';
import { PublicProps } from './utils/types-utils';
import { GraphicsDeviceOptions, defaultGraphicsDeviceOptions } from './types/graphics-device-options';

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
    deviceTypes,
    ...otherProps
  } = validatedProps;

  const localGraphicsDeviceOptions = {
    ...defaultGraphicsDeviceOptions,
    ...graphicsDeviceOptions
  };

  const [app, setApp] = useState<PlayCanvasApplication | null>(null);
  const appRef = useRef<PlayCanvasApplication | null>(null);

  const pointerEvents = useMemo(() => new Set<string>(), []);
  usePicker(appRef.current, canvasRef.current, pointerEvents);

  useLayoutEffect(() => {
    let isDestroyed = false;
    
    const init = async () => {
      const canvas = canvasRef.current;
      if (canvas && !appRef.current && !isDestroyed) {

        const graphicsDevice = await createGraphicsDevice(canvas, { deviceTypes, ...localGraphicsDeviceOptions });

        if (isDestroyed) return;

        const localApp = new PlayCanvasApplication(canvas, {
          mouse: new Mouse(canvas),
          touch: new TouchDevice(canvas),
          graphicsDevice
        });

        if (isDestroyed) {
          localApp.destroy();
          return;
        }

        localApp.start();

        appRef.current = localApp;
        setApp(localApp);
      }
    };

    init();

    return () => {
      isDestroyed = true;
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
        setApp(null);
      }
    };
  }, [...Object.values(localGraphicsDeviceOptions), deviceTypes]);

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

type DeviceType = typeof DEVICETYPE_WEBGPU | typeof DEVICETYPE_WEBGL2 | typeof DEVICETYPE_NULL;
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
   * The device types to use for the graphics device.
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
    errorMsg: (value: unknown) => `deviceTypes must be an array containing one or more of: ${DEVICETYPE_WEBGPU}, ${DEVICETYPE_WEBGL2}, ${DEVICETYPE_NULL}. Received: ${value}`,
    default: [DEVICETYPE_WEBGL2]
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

// /*
//   This is a workaround to allow the null graphics device to be used in the test environment.
// */
// const createGraphicsDevice = (canvas: HTMLCanvasElement, options: GraphicsDeviceOptions & { deviceTypes?: DeviceType[] }) => {
//   if(process.env.NODE_ENV === 'test') {
//     // In test environment, always use the null graphics device
//     const nullGraphicsDevice = new NullGraphicsDevice(canvas, options);
//     return nullGraphicsDevice;
//   }
//   return internalCreateGraphicsDevice(canvas, options);
// }