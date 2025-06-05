import { PostEffectsSettings } from "./effects"

export const paris: PostEffectsSettings = {
    lighting: {
        exposure: 1.0,
        skyBoxIntensity: 1.0
    },
    rendering: {
        renderFormat: 18,
        renderTargetScale: 1,
        sharpness: 0,
        samples: 4,
        toneMapping: 4,
        fog: "none",
        fogColor: {
            r: 0,
            g: 0,
            b: 0,
            a: 1
        },
        fogRange: [
            0,
            100
        ],
        fogDensity: 0.01,
        renderFormatFallback0: 12,
        renderFormatFallback1: 14,
        sceneColorMap: false,
        sceneDepthMap: false,
        fogStart: 0,
        fogEnd: 100
    },
    ssao: {
        type: "none",
        intensity: 0.5,
        radius: 30,
        samples: 12,
        power: 6,
        minAngle: 10,
        scale: 1,
        blurEnabled: true
    },
    bloom: {
        enabled: true,
        intensity: 0.03,
        lastMipLevel: 1
    },
    grading: {
        enabled: true,
        brightness: 0.93,
        contrast: 1.16,
        saturation: 1.4,
        tint: {
            r: 1,
            g: 0.9333333333333333,
            b: 0.8666666666666667,
            a: 1
        }
    },
    vignette: {
        enabled: true,
        intensity: 0.6,
        inner: 0.25,
        outer: 1.52,
        curvature: 0.78
    },
    taa: {
        enabled: false,
        jitter: 0.4
    },
    fringing: {
        enabled: true,
        intensity: 10
    }
}

export const neutral: PostEffectsSettings = {
    lighting: {
        exposure: 1.0,
        skyBoxIntensity: 1.0
    },
    rendering: {
        renderFormat: 18,
        renderTargetScale: 1,
        sharpness: 0,
        samples: 8,
        toneMapping: 4,
        fog: "none",
        fogColor: {
            r: 0,
            g: 0,
            b: 0,
            a: 1
        },
        fogRange: [
            0,
            100
        ],
        fogDensity: 0.01,
        renderFormatFallback0: 12,
        renderFormatFallback1: 14,
        sceneColorMap: false,
        sceneDepthMap: false,
        fogStart: 0,
        fogEnd: 100
    },
    ssao: {
        type: "none",
        intensity: 0.5,
        radius: 30,
        samples: 12,
        power: 6,
        minAngle: 10,
        scale: 1,
        blurEnabled: true
    },
    bloom: {
        enabled: false,
        intensity: 0.03,
        lastMipLevel: 1
    },
    grading: {
        enabled: false,
        brightness: 0.93,
        contrast: 1.16,
        saturation: 1.4,
        tint: {
            r: 1,
            g: 1,
            b: 1,
            a: 1
        }
    },
    vignette: {
        enabled: false,
        intensity: 0.6,
        inner: 0.25,
        outer: 1.52,
        curvature: 0.78
    },
    taa: {
        enabled: false,
        jitter: 0.4
    },
    fringing: {
        enabled: false,
        intensity: 10
    }
}

export const noir: PostEffectsSettings = {
    lighting: {
        exposure: 1.0,
        skyBoxIntensity: 1.0
    },
    rendering: {
        renderFormat: 18,
        renderTargetScale: 1,
        sharpness: 0,
        samples: 4,
        toneMapping: 4,
        fog: "none",
        fogColor: {
            r: 0,
            g: 0,
            b: 0,
            a: 1
        },
        fogRange: [
            0,
            100
        ],
        fogDensity: 0.01,
        renderFormatFallback0: 12,
        renderFormatFallback1: 14,
        sceneColorMap: false,
        sceneDepthMap: false,
        fogStart: 0,
        fogEnd: 100
    },
    ssao: {
        type: "none",
        intensity: 0.5,
        radius: 30,
        samples: 12,
        power: 6,
        minAngle: 10,
        scale: 1,
        blurEnabled: true
    },
    bloom: {
        enabled: true,
        intensity: 0.01,
        lastMipLevel: 1
    },
    grading: {
        enabled: true,
        brightness: 0.8,
        contrast: 1.01,
        saturation: 0.1,
        tint: {
            r: 1,
            g: 1,
            b: 1,
            a: 1
        }
    },
    vignette: {
        enabled: true,
        intensity: 1.0,
        inner: 0.25,
        outer: 1.42,
        curvature: 0.78
    },
    taa: {
        enabled: false,
        jitter: 0.4
    },
    fringing: {
        enabled: true,
        intensity: 10
    }
}