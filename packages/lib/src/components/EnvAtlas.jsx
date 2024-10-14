import { useLayoutEffect } from "react";
import { useApp } from "../hooks";

export const EnvAtlas = ({ asset, ...props }) => {

    const app = useApp();
    if(asset?.resource) app.scene.envAtlas = asset.resource;
    
    // useLayoutEffect(() => {
    //     if (!asset?.resource) return;
        
    //     app.scene.envAtlas = asset.resource;

    //     return () => {
    //         app.scene.envAtlas = null
    //     }

    // }, [asset?.resource]);

}