
// SmartCamera.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { Entity } from "@playcanvas/react";
import { Camera, Script } from "@playcanvas/react/components";
// import { StaticPostEffects } from "@/components/visual-effects";
// import { CameraController } from "./CameraControllerScript"; // wraps the <Script> with camera controls
import { useTimeline } from "./splat-viewer-context";
import { Vec3, Entity as PcEntity, GSplatComponent } from "playcanvas";

import { AnimationTrack, AnimCamera, createRotationTrack } from "./utils/animation"; // assumed
import { computeStartingPose, Pose, PoseType } from "./utils/pose";
import { StaticPostEffects } from "@/components/PostEffects";
import { useApp, useParent } from "@playcanvas/react/hooks";
import { CameraControls } from "playcanvas/scripts/esm/camera-controls.mjs";
import style from "./utils/style";

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
        // @ts-expect-error CameraControls is not defined in the script
        const controls = entity.script?.cameraControls as CameraControls;
        if (controls) {
            controls.focus(new Vec3().fromArray(focus), null, false);
        }
    }, [...focus]);

    return (<>
        <Script script={CameraControls} rotateSpeed={0.5} rotateDamping={0.985} {...props} />
    </>);
}

export function SmartCamera({
  type = "orbit",
  fov = 30,
  animationTrack,
}: {
  type?: "orbit" | "fly";
  fov?: number;
  animationTrack?: AnimationTrack;
}) {
  const entityRef = useRef<PcEntity>(null);
  const { subscribe, isPlaying } = useTimeline();
  const [mode] = useState<"interactive" | "transition" | "animation">(isPlaying ? "animation" : "interactive");
  const app = useApp();

  const [pose, setPose] = useState<PoseType>({
    position: [2, 1, 2],
    target: [0, 0, 0]
  });

  const [animation, setAnimation] = useState<AnimCamera | null>(animationTrack && AnimCamera.fromTrack(animationTrack));

  useEffect(() => {
    const gsplat = app.root.findComponent('gsplat') as GSplatComponent;

    if (!gsplat) {
        throw new Error("GSplat not found");
    }

    const initialPose = computeStartingPose(gsplat, fov);
    //   const transitionStartRef = useRef<{ pos: Vec3; rot: Quat } | null>(null);
    
    setPose(initialPose);
    if(!animation) {
        const actualPose = new Pose().fromLookAt(new Vec3().fromArray(initialPose.position), new Vec3().fromArray(initialPose.target));
        const track = createRotationTrack(actualPose)
        // console.log('track', track);
        // console.log('initialPose', initialPose, actualPose);
        setAnimation(track);
    }

  }, [app]);


  // Listen to timeline changes
  useEffect(() => {
    console.log('animation', animation, mode);
    if (!animation || !isPlaying) return;

    const pose = new Pose();
    // const rot = new Quat();
    const unsub = subscribe((t) => {
        animation.cursor.value = t * animation.frameRate;
        animation.update();
        animation.getPose(pose);
        
        //   if (mode === "animation") {
        // console.log('timeline', t, animation.position, pose.rotation);
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

  return (
    <Entity name="camera" ref={entityRef} position={pose.position}>
      <Camera fov={fov} clearColor="#f3e8ff" />
      <CameraController
        focus={pose.target}
        enablePan={type === "fly"}
        enableFly={type === "fly"}
        enableOrbit={type === "orbit"}
        enabled={!isPlaying}
      />
      <StaticPostEffects {...style.paris}/>
    </Entity>
  );
}
