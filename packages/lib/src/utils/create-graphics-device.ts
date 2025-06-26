import { platform, DEVICETYPE_WEBGL2, DEVICETYPE_WEBGPU, DEVICETYPE_NULL, GraphicsDevice, NullGraphicsDevice, WebglGraphicsDevice, WebgpuGraphicsDevice } from "playcanvas";
import { GraphicsDeviceOptions } from "../types/graphics-device-options.ts";

/**
 * Creates a graphics device. This is similar to the createGraphicsDevice function in PlayCanvas, but it does not inject  additional graphics devices
 *
 */
export async function createGraphicsDevice(
    canvas: HTMLCanvasElement,
    options: GraphicsDeviceOptions & { deviceTypes?: [] } = {}
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