"use client";

import { useEffect, useRef, useState } from "react";
import { Entity } from "@playcanvas/react";
import { Camera, Script } from "@playcanvas/react/components";
import { useTimeline, useAssetViewer } from "./splat-viewer-context";
import { Vec3 } from "playcanvas";

import { AnimationTrack, AnimCamera, createRotationTrack } from "./utils/animation"; // assumed
import { computeStartingPose, Pose, PoseType } from "./utils/pose";
import { useApp, useParent } from "@playcanvas/react/hooks";
import { PostEffectsSettings, StaticPostEffects } from "./utils/effects";
import { paris, neutral, noir } from "./utils/style";

// @ts-expect-error There is no type definition for the camera-controls script
import { CameraControls } from "playcanvas/scripts/esm/camera-controls.mjs";
import { useRenderOnCameraChange } from "./hooks/use-render-on-camera-change";

const variants = new Map<string, PostEffectsSettings>([
    ['paris', paris],
    ['neutral', neutral],
    ['noir', noir]
]);

type CameraControlsProps = {
    /* The focus point of the camera */
    focus?: [number, number, number]
    enablePan: boolean,
    enableFly: boolean,
    enableOrbit: boolean,
    enabled?: boolean,
}

function CameraController({ focus = [0, 0, 0], ...props }: CameraControlsProps) {

    const entity = useParent();

    useEffect(() => {
        /**
         * FIXME:
         * `cameraControls` name will be mangled in many bundlers. This needs to be updated when
         * PlayCanvas engine > v2.7.5 is released. See https://github.com/playcanvas/engine/pull/7593
         */
        // @ts-expect-error CameraControls is not defined in the script
        const controls = (entity.script?.cameraControls || entity.script?._CameraControls) as CameraControls;
        if (controls) {
            controls.focus(new Vec3().fromArray(focus), null, false);
        }
    }, [focus]);

    return (<>
        <Script script={CameraControls} rotateSpeed={0.5} rotateDamping={0.985} {...props} />
    </>);
}

export function SmartCamera({
  fov = 30,
  animationTrack,
  variant = "neutral"
}: {
  fov?: number;
  animationTrack?: AnimationTrack;
  variant?: "paris" | "neutral" | "noir" | "none" | PostEffectsSettings;
}) {

  const entityRef = useRef<pc.Entity>(null);
  const { subscribe, isPlaying } = useTimeline();
  const { mode, subscribeCameraReset } = useAssetViewer();
  const timeoutRef = useRef(0);
  const [shouldUseRenderOnCameraChange, setShouldUseRenderOnCameraChange] = useState(false);
  const app = useApp();
  const initialPoseRef = useRef<PoseType | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setShouldUseRenderOnCameraChange(true);
    }, 200);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useRenderOnCameraChange(shouldUseRenderOnCameraChange ? entityRef.current : null);
  
  const [pose, setPose] = useState<PoseType>({
    position: [2, 1, 2],
    target: [0, 0, 0]
  });

  const [animation, setAnimation] = useState<AnimCamera | null>(animationTrack ? AnimCamera.fromTrack(animationTrack) : null);

  useEffect(() => {

    const initialPose = computeStartingPose(app, fov);
    initialPoseRef.current = initialPose;
    
    setPose(initialPose);
    if(!animation) {
        const actualPose = new Pose().fromLookAt(new Vec3().fromArray(initialPose.position), new Vec3().fromArray(initialPose.target));
        const track = createRotationTrack(actualPose)
        setAnimation(track);
    }

  }, [app]);

  // Expose reset functionality through callback
  useEffect(() => {

    if (!subscribeCameraReset) return;

    const unsubscribe = subscribeCameraReset(() => {
      if (!initialPoseRef.current || !entityRef.current) return;
      
      setPose(computeStartingPose(app, fov));

      // Force a render
      app.renderNextFrame = true;
    });

    return unsubscribe;
  }, [subscribeCameraReset]);

  // Listen to timeline changes
  useEffect(() => {

    if (!animation || !isPlaying) return;

    const pose = new Pose();
    // const rot = new Quat();
    const unsub = subscribe((t) => {
        animation.cursor.value = t * animation.frameRate;
        animation.update();
        animation.getPose(pose);
        
        //   if (mode === "animation") {
        entityRef.current?.setPosition(animation.position);
        entityRef.current?.setRotation(pose.rotation);

    //   } else if (mode === "transition") {
        // // blend from previous to this
        // const { pos: fromPos, rot: fromRot } = transitionStartRef.current!;
        // const currentPos = new Vec3().lerp(fromPos, pose, 0.1);
        // const currentRot = new Quat().slerp(fromRot, rot, 0.1);

        // entityRef.current?.setPosition(currentPos);
        // entityRef.current?.setRotation(currentRot);

        // if (
        //   currentPos.distance(pose) < 0.01 &&
        //   Quat.dot(currentRot, rot) > 0.999
        // ) {
        //   setMode("animation");
        // }
    //   }
    });

    return unsub;
  }, [mode, animation, isPlaying]);

  // When timeline starts playing, begin transition
//   useEffect(() => {
//     if (isPlaying && mode === "interactive" && animation) {
//       transitionStartRef.current = {
//         pos: entityRef.current?.getPosition().clone(),
//         rot: entityRef.current?.getRotation().clone(),
//       };
//       setMode("transition");
//     }
//   }, [isPlaying]);

//   if (!animationTrack || mode === "interactive") {
//     return (
//       <Entity name="camera" ref={entityRef} position={pose.position}>
//         <Camera fov={fov} clearColor="#f3e8ff" />
//         <CameraController
//           focus={pose.target}
//           enablePan={type === "fly"}
//           enableFly={type === "fly"}
//           enableOrbit={type === "orbit"}
//         />
//         <StaticPostEffects />
//       </Entity>
//     );
//   }

  // If the variant is a string, use the default variant, otherwise use the variant object passed in
  const style = typeof variant === 'string' ? variants.get(variant) ?? neutral : variant;

  return (
    <Entity name="camera" ref={entityRef} position={pose.position}>
      <Camera fov={fov} clearColor="#f3e8ff" />
      <CameraController
        focus={pose.target}
        enablePan={mode === "fly"}
        enableFly={true}
        enableOrbit={mode === "orbit"}
        enabled={!isPlaying}
      />
      {variant !== 'none' && <StaticPostEffects {...style}/>}
    </Entity>
  );
}
