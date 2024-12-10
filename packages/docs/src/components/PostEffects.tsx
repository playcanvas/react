"use client";

import { Script } from "@playcanvas/react/components";
import { CameraFrame } from "@playcanvas/react/scripts";

import { FC } from "react";

import { usePostControls } from "./hooks/post-controls";

const deepMerge = (target: Record<string, any>, source: Record<string, any>) => {
    if (!source) return target;
    const result = { ...target };
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
};

const PostEffects: FC = ({ overrides = {} }: { overrides?: Partial<typeof defaultPostSettings> }) => {

    const postSettings = usePostControls();
    const settings = deepMerge(postSettings, overrides);

    return <Script script={CameraFrame} {...settings} />
}

export const StaticPostEffects: FC<Partial<typeof defaultPostSettings>> = (props) => {

    const settings = deepMerge(defaultPostSettings, props);
    return <Script script={CameraFrame} {...settings} />
}

const defaultPostSettings = {
    "lighting": {
        "exposure": 1.21,
        "skyBoxIntensity": 1.02
    },
    "rendering": {
        "renderFormat": 18,
        "renderTargetScale": 1,
        "sharpness": 0,
        "samples": 4,
        "toneMapping": 4,
        "fog": "none",
        "fogColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 1
        },
        "fogRange": [
            0,
            100
        ],
        "fogDensity": 0.01,
        "renderFormatFallback0": 12,
        "renderFormatFallback1": 14,
        "sceneColorMap": false,
        "sceneDepthMap": false,
        "fogStart": 0,
        "fogEnd": 100
    },
    "ssao": {
        "type": "none",
        "intensity": 0.5,
        "radius": 30,
        "samples": 12,
        "power": 6,
        "minAngle": 10,
        "scale": 1,
        "blurEnabled": true
    },
    "bloom": {
        "enabled": true,
        "intensity": 0.1,
        "lastMipLevel": 1
    },
    "grading": {
        "enabled": true,
        "brightness": 0.83,
        "contrast": 1.06,
        "saturation": 1.2,
        "tint": {
            "r": 1,
            "g": 0.9333333333333333,
            "b": 0.8666666666666667,
            "a": 1
        }
    },
    "vignette": {
        "enabled": true,
        "intensity": 1,
        "inner": 0.25,
        "outer": 1.52,
        "curvature": 0.78
    },
    "taa": {
        "enabled": false,
        "jitter": 0.4
    },
    "fringing": {
        "enabled": true,
        "intensity": 10
    }
}

export default PostEffects;