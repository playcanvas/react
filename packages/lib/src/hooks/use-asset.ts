import { useState, useEffect, useRef, useCallback } from "react";
import { fetchAsset, AssetMeta } from "../utils/fetch-asset.ts";
import { useApp } from "./use-app.tsx";
import { Asset, dracoInitialize, TEXTURETYPE_RGBP } from "playcanvas";
import { warnOnce } from "../utils/validation.ts";

const base = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";
dracoInitialize({
  jsUrl: base + 'draco_wasm_wrapper.js',
  wasmUrl: base + 'draco_decoder.wasm',
  numWorkers: 2,
  lazyInit: true
});

/**
 * Supported asset types that can be loaded
 */
const supportedTypes = ['texture', 'gsplat', 'container', 'model'];

type AssetResultCallback = (meta: AssetMeta) => void;

/**
 * Result of an asset loading operation
 */
export interface AssetResult {
  /** 
   * The loaded asset, or null if not loaded or failed 
   * @defaultValue null
   */
  asset: Asset | null;
  /** 
   * Whether the asset is currently loading, or false if it has loaded or failed 
   * @defaultValue true
   */
  loading: boolean;
  /** 
   * Error message if loading failed, or null if successful 
   * @defaultValue null
   */
  error: string | null;
  /**
   * Use this to subscribe to loading progress events
   * @param {AssetMeta} meta - The progress of the asset loading.
   * @returns void
   */
  subscribe: (cb: AssetResultCallback) => () => void;
}

/**
 * Simple hook to fetch an asset from the asset registry.
 * 
 * @param src - The source URL of the asset.
 * @param type - The type of the asset (must be one of: texture, gsplat, container, model).
 * @param props - Additional properties to pass to the asset loader.
 * @returns An object containing the asset, loading state, and any error.
 * 
 * @example
 * ```tsx
 * const { asset, loading, error } = useAsset('model.glb', 'container');
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!asset) return null;
 * 
 * return <Render asset={asset} />;
 * ```
 */
export const useAsset = (
  src: string, 
  type: string,
  props: Record<string, unknown> = {},
): AssetResult => {

  const app = useApp();
  const subscribersRef = useRef<Set<(meta: AssetMeta) => void>>(new Set());

  const subscribe = useCallback((cb: AssetResultCallback) => {
    subscribersRef.current.add(cb);
    return () => subscribersRef.current.delete(cb);
  }, []);

  const [result, setResult] = useState<Omit<AssetResult, 'subscribe'>>({
    asset: null,
    loading: true,
    error: null
  });
  
  let stablePropsKey = null;

  try{
    stablePropsKey = JSON.stringify({ props }, Object.keys({ props }).sort())
  } catch {
    const error = `Invalid props for "useAsset('${src}')". \`props\` must be serializable to JSON.`;
    warnOnce(error);
    setResult({
      asset: null,
      loading: false,
      error
    });
  }

  const onProgress = useCallback((meta: AssetMeta) => {
    for (const cb of subscribersRef.current) cb(meta);
  }, []);

  useEffect(() => {

    if(stablePropsKey === null) return;

    // Reset state when inputs change
    setResult({
      asset: null,
      loading: true,
      error: null
    });

    // Validate inputs
    if (!src) {
      warnOnce("Asset source URL is required");
      setResult({
        asset: null,
        loading: false,
        error: "Asset source URL is required"
      });
      return;
    }

    if (!app) {
      warnOnce("PlayCanvas application not found");
      setResult({
        asset: null,
        loading: false,
        error: "PlayCanvas application not found"
      });
      return;
    }

    if (!supportedTypes.includes(type)) {
      warnOnce(`Unsupported asset type: "${type}". Supported types are "${supportedTypes.join('", "')}"`);
      setResult({
        asset: null,
        loading: false,
        error: `Unsupported asset type: ${type}`
      });
      return;
    }

    // Load the asset
    fetchAsset({ app, url: src, type, props, onProgress })
      .then((asset) => {
        setResult({
          asset: asset as Asset,
          loading: false,
          error: null
        });
      })
      .catch((error) => {
        warnOnce(`Failed to load asset: ${src}`);
        setResult({ 
          asset: null,
          loading: false,
          error: error?.message || `Failed to load asset: ${src}`,
        });
      });
  }, [app, src, type, stablePropsKey]);

  return { ...result, subscribe };
};

/**
 * Simple hook to fetch a splat asset from the asset registry.
 * 
 * @param src - The source URL of the splat asset.
 * @param props - Additional properties to pass to the asset loader.
 * @returns An object containing the asset, loading state, and any error.
 * 
 * @example
 * ```tsx
 * const { asset, loading, error } = useSplat('splat.ply');
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!asset) return null;
 * 
 * return <GSplat asset={asset} />;
 * ```
 */
export const useSplat = (
  src: string, 
  props: Record<string, unknown> = {},
): AssetResult => useAsset(src, 'gsplat', props);

/**
 * Simple hook to fetch a texture asset from the asset registry.
 * 
 * @param src - The source URL of the texture asset.
 * @param props - Additional properties to pass to the asset loader.
 * @returns An object containing the asset, loading state, and any error.
 * 
 * @example
 * ```tsx
 * const { asset, loading, error } = useTexture('texture.jpg');
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!asset) return null;
 * 
 * return <Material map={asset.resource} />;
 * ```
 */
export const useTexture = (
  src: string, 
  props: Record<string, unknown> = {}
): AssetResult => 
  useAsset(src, 'texture', props);

/**
 * Simple hook to load an environment atlas texture asset.
 * 
 * @param src - The source URL of the environment atlas texture.
 * @param props - Additional properties to pass to the asset loader.
 * @returns An object containing the asset, loading state, and any error.
 * 
 * @example
 * ```tsx
 * const { asset, loading, error } = useEnvAtlas('env.jpg');
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!asset) return null;
 * 
 * return <Environment envAtlas={asset} />;
 * ```
 */
export const useEnvAtlas = (
  src: string, 
  props: Record<string, unknown> = {},
): AssetResult => 
  useAsset(src, 'texture', { ...props, data: { type: TEXTURETYPE_RGBP, mipmaps: false, ...(props.data ?? {}) } });

/**
 * Simple hook to load a 3D model asset (GLB/GLTF).
 * 
 * @param src - The source URL of the 3D model.
 * @param props - Additional properties to pass to the asset loader.
 * @returns An object containing the asset, loading state, and any error.
 * 
 * @example
 * ```tsx
 * const { asset, loading, error } = useModel('model.glb');
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!asset) return null;
 * 
 * return <Container asset={asset} />;
 * ```
 */
export const useModel = (
  src: string, 
  props: Record<string, unknown> = {},
): AssetResult => 
  useAsset(src, 'container', props);

/**
 * Simple hook to load a font asset.
 * 
 * Fonts are described SDF textures, so you'll need to convert your .ttf files to SDF textures.
 * into the correct format.
 * 
 * Learn more about SDF textures {@link https://playcanvas-react.vercel.app/docs/api/hooks/use-asset#usefont}.
 * 
 * @param src - The source URL of the font asset.
 * @param props - Additional properties to pass to the asset loader.
 * @returns An object containing the asset, loading state, and any error.
 * 
 * @example
 * ```tsx
 * import roboto from '@assets/fonts/roboto.ttf?url';
 * export const App = () => {
 *  const { asset, loading, error } = useFont(roboto);
 * }
 * ```
 */
export const useFont = (
  src: string, 
  props: Record<string, unknown> = {},
): AssetResult => 
  useAsset(src, 'font', props);