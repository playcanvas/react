import { useApp } from "@playcanvas/react/hooks";
import { useControls } from "leva";
import { Color } from "playcanvas";
import { useMemo } from "react";

export const usePostControls = () => {

  const app = useApp();

  const tint = useMemo(_ =>new Color(), [app]);
  const fogColor = useMemo(_ =>new Color(), [app]);
  
  const lighting = useControls("Lighting", {
    exposure: { min: 0.1, max: 2, step: 0.01, value: 1.21 },
    skyBoxIntensity: { min: 0.1, max: 2, step: 0.01, value: 1.02 },
  });

  const rendering = useControls("rendering", {
    renderFormat: {
      options: {
        RGBA8: 7, // PIXELFORMAT_RGBA8
        RG11B10: 18, // PIXELFORMAT_111110F
        RGBA16: 12, // PIXELFORMAT_RGBA16F
        RGBA32: 14, // PIXELFORMAT_RGBA32F
      },
      value: 18,
    },
    renderTargetScale: { min: 0.1, max: 1, step: 0.01, value: 1.0 },
    sharpness: { min: 0, max: 1, step: 0.001, value: 0.0 },
    samples: { value: 8, min: 1, max: 4, step: 1 },
    toneMapping: {
      options: {
        LINEAR: 0, // TONEMAP_LINEAR
        FILMIC: 1, // TONEMAP_FILMIC
        HEJL: 2, // TONEMAP_HEJL
        ACES: 3, // TONEMAP_ACES
        ACES2: 4, // TONEMAP_ACES2
        NEUTRAL: 5, // TONEMAP_NEUTRAL
      },
      value: 4,
    },
    fog: {
      options: {
        NONE: "none", // FOG_NONE
        LINEAR: "linear", // FOG_LINEAR
        EXP: "exp", // FOG_EXP
        EXP2: "exp2", // FOG_EXP2
      },
    },
    fogColor: "#000",
    fogRange: {
      min: 0,
      max: 100,
      value: [0, 100],
    },
    fogDensity: 0.01,
  });

  const ssao = useControls(
    "SSAO",
    {
      type: {
        options: {
          NONE: "none", // SSAOTYPE_NONE
          LIGHTING: "lighting", // SSAOTYPE_LIGHTING
          COMBINE: "combine", // SSAOTYPE_COMBINE
        },
      },
      intensity: { min: 0.0, max: 1, step: 0.001, value: 0.5 },
      radius: { min: 0, max: 100, step: 0.001, value: 30 },
      samples: { min: 1, max: 64, step: 1, value: 12 },
      power: { min: 0.1, max: 10, step: 0.001, value: 6 },
      minAngle: { min: 1, max: 90, step: 1, value: 10 },
      scale: { min: 0.5, max: 1, step: 0.001, value: 1 },
    },
    { collapsed: true }
  );

  const bloom = useControls(
    "Bloom",
    {
      enabled: true,
      intensity: { min: 0, max: 0.1, step: 0.001, value: 0.1 },
      lastMipLevel: { min: 0, max: 12, step: 1, value: 1 },
    },
    { collapsed: true }
  );

  const grading = useControls(
    "Grading",
    {
      enabled: true,
      brightness: { min: 0, max: 3, step: 0.001, value: .83 },
      contrast: { min: 0.5, max: 1.5, step: 0.001, value: 1.06 },
      saturation: { min: 0, max: 2, step: 0.001, value: 1.2 },
      tint: "#fed",
    },
    { collapsed: true }
  );

  const vignette = useControls(
    "Vignette",
    {
      enabled: true,
      intensity: { min: 0, max: 1, step: 0.001, value: 1 },
      inner: { min: 0, max: 3, step: 0.001, value: 0.25 },
      outer: { min: 0, max: 3, step: 0.001, value: 1.52 },
      curvature: { min: 0.01, max: 3, step: 0.001, value: 0.78 },
    },
    { collapsed: true }
  );

  const taa = useControls(
    "TAA",
    {
      enabled: false,
      jitter: { min: 0, max: 1, step: 0.1, value: 0.4 },
    },
    { collapsed: true }
  );

  const fringing = useControls(
    "Fringing",
    {
      enabled: true,
      intensity: { min: 0, max: 100, step: 0.01, value: 10 },
    },
    { collapsed: true }
  );

  app.scene.exposure = lighting.exposure;
  app.scene.skyboxIntensity = lighting.skyBoxIntensity;
  app.scene.toneMapping = rendering.toneMapping;

  tint.fromString(grading.tint);
  fogColor.fromString(rendering.fogColor);

  return { 
    lighting, 
    rendering : {
      ...rendering,
      renderFormatFallback0: 12,
      renderFormatFallback1: 14,
      sceneColorMap: false,
      sceneDepthMap: false,
      fogColor,
      fogStart: rendering.fogRange[0],
      fogEnd: rendering.fogRange[1],
    }, 
    ssao : {
      ...ssao,
      blurEnabled:true
    }, 
    bloom, 
    grading : { 
      ...grading, 
      tint
    }, 
    vignette, 
    taa, 
    fringing 
  };
};
