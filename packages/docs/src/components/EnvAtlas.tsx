"use client";

import { FC, useLayoutEffect } from "react";
import { useEnvAtlas } from "./hooks/use-asset";
import type { Asset } from "playcanvas";
import { EnvAtlas } from "@playcanvas/react/components";
import { useApp } from "@playcanvas/react/hooks";

type EnvAtlasComponentsProps = {
    src: string;
    showSkybox: boolean;
    intensity?: number;
}

 const EnvAtlasComponent: FC<EnvAtlasComponentsProps> = ({ src, ...props }) => {

    const app = useApp();

    // useLayoutEffect(() => {
    //     const layer = app?.scene?.layers?.getLayerByName('Skybox');
    //     if(hideSkybox && layer
    //         layer.enabled = false;
    //     }
    //     app.scene.skyboxIntensity = intensity;
    // }, [app]);

    const { data } = useEnvAtlas(src);

    return <EnvAtlas asset={data as Asset} {...props}/>

}

export default EnvAtlasComponent;