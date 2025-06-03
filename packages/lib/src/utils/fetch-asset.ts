import { Application, Asset } from "playcanvas";
import { warnOnce } from "./validation";

type AssetType = ConstructorParameters<typeof Asset>[1];

type FetchAssetOptions = {
    app: Application;
    url: string;
    type: string;
    props?: Record<string, unknown>;
    onProgress?: (progress: number) => void;
};

export const fetchAsset = ({
    app, url, type, props = {}, onProgress
}: FetchAssetOptions ) => {
    return new Promise((resolve, reject) => {

        let propsKey = url;
        try {
            propsKey += JSON.stringify(props, Object.keys(props).sort())
        } catch {
            const error = `Invalid props for "fetchAsset('${url}')". Props must be serializable to JSON.`;
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
            resolve(asset);
        };

        const handleError = (err : string) => { 
            cleanup();
            reject(err);
        };

        const cleanup = () => {
            if (onProgress) asset.off('progress', onProgress);
            asset.off('load', handleLoad);
            asset.off('error', handleError);
        };

        if (asset.resource) {
            resolve(asset);
        } else {
            asset.once('load', handleLoad);
            asset.once('error', handleError);
            
            if (onProgress) {
                asset.on('progress', onProgress);
            }

            // Start loading if not already loading
            if (!asset.loading) {
                app.assets.load(asset);
            }
        }
    });
};