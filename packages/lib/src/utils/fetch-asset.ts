import { Application, Asset } from "playcanvas";
import { warnOnce } from "./validation";

export const fetchAsset = (app : Application, url : string, type : string, props = {}) => {
    return new Promise((resolve, reject) => {

        let propsKey = url;
        try {
            propsKey += JSON.stringify(props, Object.keys(props).sort())
        } catch (error) {
            warnOnce(`Invalid props for "fetchAsset('${url}')". Props must be serializable to JSON.`);
            throw new Error("Invalid props");
        }

        let asset = app.assets.find(propsKey, type);

        if (!asset) {
            asset = new Asset(propsKey, type, { url }, props);
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