import { Application, Asset } from "playcanvas";

export const fetchAsset = (app : Application, url : string, type : string, props = {}) => {
    return new Promise((resolve, reject) => {
        let asset = app.assets.find(url);

        if (!asset) {
            asset = new Asset(url, type, { url }, props);
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