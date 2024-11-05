import { FC, useLayoutEffect } from "react";
import { useApp } from "../hooks";
import { Application, Asset } from "playcanvas";

interface EnvAtlasProps {
    asset: Asset;
}

/**
 * An environment atlas is a texture for rendering a skybox and global reflections.
 */
export const EnvAtlas: FC<EnvAtlasProps>= ({ asset }) => {

    const app: Application = useApp();
    
    useLayoutEffect(() => {
        if (!asset?.resource) return;
        
        app.scene.envAtlas = asset.resource;

        return () => {
            if(app && app.scene) {
                // @ts-expect-error `envAtlas` has an incorrect type ot @type {Texture}
                app.scene.envAtlas = null;
            }
        }

    }, [app, asset?.resource]);

    return null

}