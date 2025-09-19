"use client";

import React, { FC, ComponentProps } from "react";
import { useEnvAtlas } from "./hooks/use-asset";
import { Environment } from "@playcanvas/react/components";

type EnvironmentLightingProps = ComponentProps<typeof Environment> & {
    src?: string;
    intensity?: number;
}

 const EnvironmentLighting: FC<EnvironmentLightingProps> = ({ 
    src = '/environment-map.png', 
    intensity = 1, 
    ...props 
}) => {

    const { data } = useEnvAtlas(src);

    return <Environment envAtlas={data} {...props} skyboxIntensity={intensity} showSkybox={false}/>

}

export default EnvironmentLighting;