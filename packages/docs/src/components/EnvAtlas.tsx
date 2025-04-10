"use client";

import { FC/*, useLayoutEffect */ } from "react";
import { useEnvAtlas } from "./hooks/use-asset";
import type { Asset } from "playcanvas";
import { EnvAtlas } from "@playcanvas/react/components";
// import { useApp } from "@playcanvas/react/hooks";

type EnvAtlasComponentsProps = {
    src: string;
    showSkybox?: boolean;
    intensity?: number;
}

 const EnvAtlasComponent: FC<EnvAtlasComponentsProps> = ({ 
    src, 
    intensity = 1, 
    ...props 
}) => {

    const { data } = useEnvAtlas(src);

    return <EnvAtlas asset={data as Asset} {...props} skyboxIntensity={intensity} showSkybox={false}/>

}

export default EnvAtlasComponent;