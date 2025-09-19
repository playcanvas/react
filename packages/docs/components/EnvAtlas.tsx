"use client";

import React, { FC, ComponentProps } from "react";
import { useEnvAtlas } from "./hooks/use-asset";
import { Environment } from "@playcanvas/react/components";

type EnvAtlasComponentsProps = ComponentProps<typeof Environment> & {
    src: string;
    intensity?: number;
}

 const EnvAtlasComponent: FC<EnvAtlasComponentsProps> = ({ 
    src, 
    intensity = 1, 
    ...props 
}) => {

    const { data } = useEnvAtlas(src);

    return <Environment envAtlas={data} {...props} skyboxIntensity={intensity} showSkybox={false}/>

}

export default EnvAtlasComponent;