import { useLayoutEffect } from "react";
import { useApp } from "../hooks";

export const EnvAtlas = ({ asset, ...props }) => {

    const app = useApp();
    
    useLayoutEffect(() => {
        if (!asset?.resource) return;
        
        app.scene.envAtlas = asset.resource;

        return () => {
            if(app && app.scene) app.scene.envAtlas = null
        }

    }, [app, asset?.resource]);

}