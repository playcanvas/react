/**
 * Type definition for graphics device options that can be passed to the PlayCanvas Application.
 * These options correspond to WebGL context attributes.
 */
export interface GraphicsDeviceOptions {
  /** Whether the canvas contains an alpha buffer. */
  alpha?: boolean;
  /** Whether the drawing buffer has a depth buffer of at least 16 bits. */
  depth?: boolean;
  /** Whether the drawing buffer has a stencil buffer of at least 8 bits. */
  stencil?: boolean;
  /** Whether to perform anti-aliasing. */
  antialias?: boolean;
  /** Whether the compositor will assume the drawing buffer contains colors with pre-multiplied alpha. */
  premultipliedAlpha?: boolean;
  /** Whether to preserve the buffers until manually cleared or overwritten. */
  preserveDrawingBuffer?: boolean;
  /** A hint to the user agent indicating what configuration of GPU is suitable for this WebGL context. */
  powerPreference?: 'default' | 'high-performance' | 'low-power';
  /** If true, the context creation will fail if the implementation determines that the performance of the created WebGL context would be dramatically lower than expected. */
  failIfMajorPerformanceCaveat?: boolean;
  /** Whether the page compositor will assume the drawing buffer is not synchronized with the display. */
  desynchronized?: boolean;
  /** Whether the context is compatible with XR devices. */
  xrCompatible?: boolean;
  /** The URL of the glslang.js file. */
  glslangUrl?: string;
  /** The URL of the twgsl.js file. */
  twgslUrl?: string;
}

/**
 * Default values for graphics device options.
 * These values are used when no options are provided.
 */
export const defaultGraphicsDeviceOptions: GraphicsDeviceOptions = {
  alpha: true,
  depth: true,
  stencil: true,
  antialias: true,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  powerPreference: 'default',
  failIfMajorPerformanceCaveat: false,
  desynchronized: false,
  xrCompatible: false
}; 