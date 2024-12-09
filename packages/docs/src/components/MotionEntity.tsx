"use client"

import React, { useEffect, useRef } from 'react';
import { useMotionValue, useMotionValueEvent, useTransform, animate, useSpring } from 'motion/react';
import { Entity } from '@playcanvas/react';
import { Light } from '@playcanvas/react/components';
import { Entity as PcEntity } from 'playcanvas';
import { useParent } from '@playcanvas/react/hooks';

const useMotionVec3 = (initial: number[], defaultValue = 0) => {
    // Create three spring values directly (since we know we need xyz)
    const x = useSpring(initial?.[0] ?? defaultValue);
    const y = useSpring(initial?.[1] ?? defaultValue);
    const z = useSpring(initial?.[2] ?? defaultValue);
    
    // Transform individual values into an array
    const array = useTransform(
        [x, y, z],
        ([xVal, yVal, zVal]) => [xVal, yVal, zVal]
    );
    
    // Helper to animate all values
    const animateArray = (target?: number[], options = {}) => {
        if (!target) return;
        // For springs, we use set() instead of animate()
        x.set(target[0] ?? x.get(), options);
        y.set(target[1] ?? y.get(), options);
        z.set(target[2] ?? z.get(), options);
    };
    
    return { values: [x, y, z], array, animateArray };
};

export const MotionEntity = ({ children, animate: animateProps, transition, ...props }) => {
    // Create motion arrays for each transform property
    const position = useMotionVec3(props.position, 0);
    const rotation = useMotionVec3(props.rotation, 0);
    const scale = useMotionVec3(props.scale, 1);

    const entityRef = useRef<PcEntity>(null);

    // Handle animation updates
    useEffect(() => {
        if (animateProps) {
            position.animateArray(animateProps.position, transition);
            rotation.animateArray(animateProps.rotation, transition);
            scale.animateArray(animateProps.scale, transition);
        }
    }, [animateProps, transition]);


    useMotionValueEvent(position.array, "change", (position: number[]) => {
        entityRef.current?.setLocalPosition(position[0], position[1], position[2]);
    })

    useMotionValueEvent(rotation.array, "change", (rotation: number[]) => {
        entityRef.current?.setLocalEulerAngles(rotation[0], rotation[1], rotation[2], rotation[3]);
    })

    useMotionValueEvent(scale.array, "change", (scale: number[]) => {
        entityRef.current?.setLocalScale(scale[0], scale[1], scale[2]);
    })

    return (
        <Entity ref={entityRef}
            {...props}
            position={position.array.get() as number[]}
            rotation={rotation.array.get() as number[]}
            scale={scale.array.get() as number[]}
        >
            {children}
        </Entity>
    );
}

export const MotionLight = ({ type='directional', animate : animateProps, transition, ...props }) => {

    // Create a motion value for the light intensity
    const intensity = useMotionValue(props.intensity ?? 1);

    // Animate the intensity
    useEffect(() => {
        animate(intensity, animateProps.intensity, transition);
    }, [animateProps, transition]);

    useMotionValueEvent(intensity, "change", (intensity: number) => {
        console.log(intensity)
    })

    return <Light {...props} type={type} intensity={intensity.get()} />
}