import { Application, Asset } from "playcanvas";
import { warnOnce } from "./validation";

type AssetType = ConstructorParameters<typeof Asset>[1];

export type ProgressCallbackParams = {
    /**
     * The normalized progress of the asset loading.
     */
    progress: number;

} & Record<string, unknown>;

export type FetchAssetOptions = {
    /**
     * The PlayCanvas application instance. When loading an asset it will be scoped to this application.
     * The asset can't be re-used across different applications.
     */
    app: Application;
    /**
     * The URL of the asset to fetch.
     */
    url: string;
    /**
     * The type of the asset to fetch.
     */
    type: string;
    /**
     * Additional properties to pass to the asset.
     * @defaultValue {{}}
     */
    props?: Record<string, unknown>;
    /**
     * A callback function that is called to provide loading progress.
     * @param {ProgressCallbackParams} meta - The progress of the asset loading.
     * @returns void
     */
    onProgress?: (meta: ProgressCallbackParams) => void;
};

export const fetchAsset = ({
    app, url, type, props = {}, onProgress
}: FetchAssetOptions ): Promise<Asset> => {
    return new Promise((resolve, reject) => {

        let propsKey = url;
        try {
            propsKey += JSON.stringify(props, Object.keys(props).sort())
        } catch {
            const error = `Invalid props for "fetchAsset({ url: '${url}', type: '${type}' })". Props must be serializable to JSON.`;
            warnOnce(error);
            throw new Error(error);
        }

        let asset = app.assets.find(propsKey, type);

        if (!asset) {
            asset = new Asset(propsKey, type as AssetType, { url }, props);
            app.assets.add(asset);
        }

        const handleLoad = () => {
            cleanup();
            onProgress?.({ progress: 1 });
            resolve(asset);
        };

        const handleError = (err : string) => { 
            cleanup();
            reject(err);
        };

        const handleProgress = (totalReceived: number, totalRequired: number) => {
            if(typeof totalReceived !== 'number' || typeof totalRequired !== 'number') {
                warnOnce('Invalid progress callback parameters');
                return;
            }

            onProgress?.({ 
                progress: totalReceived / totalRequired, 
                totalReceived, 
                totalRequired 
            });
        };

        const cleanup = () => {
            if (onProgress) asset.off('progress', handleProgress);
            asset.off('load', handleLoad);
            asset.off('error', handleError);
        };

        if (onProgress) {
            asset.on('progress', handleProgress);
        }

        if (asset.resource) {
            handleLoad()
        } else {
            asset.once('load', handleLoad);
            asset.once('error', handleError);
            
            // Start loading if not already loading
            if (!asset.loading) {
                app.assets.load(asset);
            }
        }
    });
};