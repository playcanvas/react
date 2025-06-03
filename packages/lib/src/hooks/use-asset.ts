import { useState, useEffect } from "react";
import { fetchAsset, ProgressCallbackParams } from "../utils/fetch-asset";
import { useApp } from "./use-app";
import { Asset, TEXTURETYPE_RGBP } from "playcanvas";
import { warnOnce } from "../utils/validation";

/**
 * Supported asset types that can be loaded
 */
const supportedTypes = ['texture', 'gsplat', 'container', 'model'];

/**
 * Result of an asset loading operation
 */
export interface AssetResult {
  /** The loaded asset, or null if not loaded or failed */
  asset: Asset | null;
  /** Whether the asset is currently loading, or false if it has loaded or failed */
  loading: boolean;
  /** Error message if loading failed, or null if successful */
  error: string | null;
}

/**
 * Options for the useAsset hook
 */
export type UseAssetOptions = {
  /**
   * Additional properties to pass to the asset loader.
   * @defaultValue {}
   */
  props?: Record<string, unknown>;
  /**
   * A callback function that is called to provide loading progress.
   * @param {ProgressCallbackParams} meta - The progress of the asset loading.
   * @returns void
   */
  subscribe?: (meta: ProgressCallbackParams) => void;
};

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
  options?: UseAssetOptions,
): AssetResult => {

  const { props = {} , subscribe } = options ?? {};

  const [result, setResult] = useState<AssetResult>({
    asset: null,
    loading: true,
    error: null
  });

  const app = useApp();
  let stablePropsKey = null;

  try{
    stablePropsKey = JSON.stringify(props, Object.keys(props).sort())
  } catch {
    const error = `Invalid props for "useAsset('${src}')". Props must be serializable to JSON.`;
    warnOnce(error);
    setResult({
      asset: null,
      loading: false,
      error
    });
  }

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
    fetchAsset({ app, url: src, type, props, onProgress: subscribe })
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
          error: error?.message || `Failed to load asset: ${src}`
        });
      });
  }, [app, src, type, stablePropsKey]);

  return result;
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
  options?: UseAssetOptions
): AssetResult => 
  useAsset(src, 'gsplat', options);

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
  options?: UseAssetOptions
): AssetResult => 
  useAsset(src, 'texture', options);

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
 * return <EnvAtlas asset={asset} />;
 * ```
 */
export const useEnvAtlas = (
  src: string, 
  options?: UseAssetOptions
): AssetResult => 
  useAsset(src, 'texture', { 
    props: {
      type: TEXTURETYPE_RGBP, 
      mipmaps: false, 
      ...options?.props 
    },
    subscribe: options?.subscribe
});

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
  options?: UseAssetOptions
): AssetResult => 
  useAsset(src, 'container', options);
