"use client"

import React, { useEffect, useRef } from 'react';
import { useMotionValue, useMotionValueEvent, useTransform, animate, useSpring } from 'motion/react';
import { Entity } from '@playcanvas/react';
import { Light, Script } from '@playcanvas/react/components';
import { Entity as PcEntity, Script as PcScript } from 'playcanvas';

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
    const animateArray = (target?: number[]) => {
        if (!target) return;
        // For springs, we use set() instead of animate()
        x.set(target[0] ?? x.get());
        y.set(target[1] ?? y.get());
        z.set(target[2] ?? z.get());
    };
    
    return { values: [x, y, z], array, animateArray };
};

export const MotionEntity = ({ children, animate: animateProps, ...props }) => {
    // Create motion arrays for each transform property
    const position = useMotionVec3(props.position, 0);
    const rotation = useMotionVec3(props.rotation, 0);
    const scale = useMotionVec3(props.scale, 1);

    const entityRef = useRef<PcEntity>(null);

    // Handle animation updates
    useEffect(() => {
        if (animateProps) {
            position.animateArray(animateProps.position);
            rotation.animateArray(animateProps.rotation);
            scale.animateArray(animateProps.scale);
        }
    }, [animateProps]);


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

export const MotionLight = ({ intensity = 1, transition = { duration: 0.2 }, ...props }) => {
    /**
     * This is a motion value that animates the intensity of the light.
     * It uses a motion value to animate the intensity of the light, 
     * and then uses an imperative script to update the intensity of the light.
     */
    const intensityMV = useMotionValue(intensity);

    useEffect(() => {
        animate(intensityMV, intensity, transition);
    }, [intensity]);

    class LightScript extends PcScript {
        update() {
            this.entity.light.intensity = intensityMV.get();
        }
    }

    return <>
        <Script script={LightScript} />
        <Light {...props}/>
    </>
}