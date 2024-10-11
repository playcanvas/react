import { useEffect, use } from "react";
import { useApp } from "../Application";

export const EnvAtlas = ({ asset, ...props }) => {

    const app = useApp();

    if (asset) app.scene.envAtlas = asset.resource;

    useEffect(() => {
        if (!asset) return;

        app.scene.envAtlas = asset.resource;

    }, [asset]);

}