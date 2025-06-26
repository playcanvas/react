import { platform, DEVICETYPE_WEBGL2, DEVICETYPE_WEBGPU, DEVICETYPE_NULL, GraphicsDevice, NullGraphicsDevice, WebglGraphicsDevice, WebgpuGraphicsDevice } from "playcanvas";
import { GraphicsDeviceOptions } from "../types/graphics-device-options.ts";

/**
 * Creates a graphics device with fallbacks. 
 * 
 * This is functionally very similar to the createGraphicsDevice function in PlayCanvas, 
 * but **importantly** it does not inject additional graphics devices when none are specified!
 * 
 * This is necessary because often we want explicitly specify the device types we want to use,
 * eg a Null device without WebGL2 or WebGPU.
 * 
 * This function is used internally by the Application component, and is also exported for use in other contexts.
 */
export async function internalCreateGraphicsDevice(
    canvas: HTMLCanvasElement,
    options: GraphicsDeviceOptions & { deviceTypes?: DeviceType[] } = {}
  ): Promise<GraphicsDevice> {
    const deviceTypes = options.deviceTypes ?? [];
  
    // @ts-expect-error - navigator is not defined in the test environment
    if (platform.browser && !!globalThis.navigator?.xr) {
      options.xrCompatible ??= true;
    }
  
    const deviceCreateFuncs: (() => Promise<GraphicsDevice>)[] = deviceTypes.map((deviceType) => {
      // @ts-expect-error - navigator is not defined in the test environment
      if (deviceType === DEVICETYPE_WEBGPU && globalThis.navigator?.gpu) {
        return async () => {
          const device = new WebgpuGraphicsDevice(canvas, options);
          return device.initWebGpu(options.glslangUrl, options.twgslUrl);
        };
      }
  
      if (deviceType === DEVICETYPE_WEBGL2) {
        return async () => new WebglGraphicsDevice(canvas, options);
      }
  
      if (deviceType === DEVICETYPE_NULL) {
        return async () => new NullGraphicsDevice(canvas, options);
      }
  
      // fallback for unsupported types
      return async () => {
        throw new Error(`Unsupported device type: ${deviceType}`);
      };
    });
  
    for (const create of deviceCreateFuncs) {
      try {
        const device = await create();
        if (device) return device;
      } catch (err) {
        console.log(err);
      }
    }
  
    throw new Error('Failed to create a graphics device');
  }

  export type DeviceType = typeof DEVICETYPE_WEBGPU | typeof DEVICETYPE_WEBGL2 | typeof DEVICETYPE_NULL;