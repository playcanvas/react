import { Application, Asset } from "playcanvas";
import { warnOnce } from "./validation";

type AssetType = ConstructorParameters<typeof Asset>[1];

export const fetchAsset = (app : Application, url : string, type : string, props = {}) => {
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

        if (asset.resource) {
            resolve(asset);
        } else {
            asset.once('load', () => resolve(asset));
            asset.once('error', (err : string) => reject(err));

            // Start loading if not already loading
            if (!asset.loading) {
                app.assets.load(asset);
            }
        }
    });
};