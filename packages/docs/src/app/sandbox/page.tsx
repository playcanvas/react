"use client"

import { Application } from "@playcanvas/react";
import { useApp } from "@playcanvas/react/hooks";
import { fetchAsset } from "@playcanvas/react/utils";
import { FILLMODE_FILL_WINDOW, FILLMODE_KEEP_ASPECT, Script, TEXTURETYPE_RGBP } from "playcanvas";
import { useEffect, useRef, useState } from "react";

let cnt = 0


// import { TEXTURETYPE_RGBP } from "playcanvas"
// import { useApp } from "@playcanvas/react/hooks"
import { useQuery } from "@tanstack/react-query";
// import { fetchAsset } from "@playcanvas/react/utils"

/**
 * Loads an asset using react-query
 * 
 * @param {string} src - The URL of the texture asset. 
 * @param {Object} [props] - Additional properties to pass to the asset loader.
 * @returns {{ data: Asset, isPending: boolean }} - The texture asset and its loading state.
 */
export const useAsset = (src, type, props) => {
    const app = useApp();
    const queryKey = [app.root?.getGuid(), src, type, props];

    // Construct a query for the asset

    // return null
    return useQuery({ 
        queryKey,
        queryFn: () => app && fetchAsset(app, src, type, props)
    })
}

/**
 * Loads a texture asset as an environment atlas
 * 
 * @param {string} src - The URL of the texture asset. 
 * @param {Object} [props] - Additional properties to pass to the asset loader.
 * @returns {{ data: Asset, isPending: boolean, release: Function }} - The texture asset and its loading state.
 */
export const useEnvAtlas = (src : string, props = {}) => useAsset(src, 'texture', { 
    ...props, 
    type: TEXTURETYPE_RGBP, mipmaps: false
});
  
export const useSplat = (src : string, props = {}) => useAsset(src, 'gsplat', props);

/**
 * Loads a glb asset 
 * 
 * @param {string} src - The URL of the glb. 
 * @param {Object} [props] - Additional properties to pass to the asset loader.
 * @returns {{ data: Asset, isPending: boolean, release: Function }} - The GLB asset and its loading state.
 */
export const useModel = (src : string, props = {}) => useAsset(src, 'container', props);


/**
 * Loads a texture asset
 * 
 * @param {string} src - The URL of the texture asset. 
 * @param {Object} [props] - Additional properties to pass to the asset loader.
 */
export const useTexture = (src : string, props = {}) => useAsset(src, 'texture', props);


class Spinner extends Script {
    initialize() {
        // cnt++
        this.seed = Math.round(Math.random() * 1000000)
        // console.log('initialize', cnt)

        // this.on('destroy', () => {
        //     cnt--
        //     console.log('destroy', cnt)
        // })
    }
    update(dt) {
        this.entity.rotate(0, dt * 100 * this.speed, 0)
        console.log('update', this.seed, this.speed)
    }
}

const Content = ({ fov, z, speed }: { fov: number, z: number, speed: number }) => {

    // const { data } = useModel('/t-rex.glb');
    
    const entityRef = useRef<pc.Entity | null>(null)
    const cameraRef = useRef<pc.CameraComponent | null>(null)
    // const divRef = useRef<HTMLDivElement | null>(null)

    
    // useEffect(() => {
    //     console.log(fov, z, entityRef.current)
    
    // })

    return <>
        <entity key='sd' name="root" ref={entityRef} sdfsd='sd'>
            <entity name="camera" position={[0, 0, z]} enabled >
                {/* <anim bse='sdf' /> */}
                <camera fov={fov} bse='sdf' sdf='sdf'/>
                {/* <chips/>
                <add/> */}
            </entity>
            <entity name="light" rotation={[0, 0, 45]}>
                <light type="directional" />
            </entity>
            <entity name="child" position={[1, 0, 0]} >
                <render type="box" />
                <script script={Spinner} speed={speed} />
            </entity>
        </entity>
    </>
}


export default function Sandbox({ children }: { children: React.ReactNode }) {

    const [z, setZ] = useState(20)
    const [fov, setFov] = useState(20)
    const [speed, setSpeed] = useState(1)

    console.log('sandbox',fov, z, speed)

    return <div>
        <button onClick={() => setZ(Math.random() * 10 + 4)}>Change Z</button>
        <button onClick={() => setFov(Math.random() * 10 + 30)}>Change FOV</button>
        <button onClick={() => setSpeed(Math.random() * 10 + 30)}>Change Speed</button>
        <Application>
            <Content fov={fov} z={z} speed={speed}/>
        </Application>
    </div>
}