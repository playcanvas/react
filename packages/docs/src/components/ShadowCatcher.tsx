import { Entity } from "@playcanvas/react";
import { Light, Script } from "@playcanvas/react/components";
import { SHADOW_VSM_16F, SHADOWUPDATE_REALTIME, Vec3 } from "playcanvas";
import { ShadowCatcher } from "playcanvas/scripts/esm/shadow-catcher.mjs";
import { FC } from "react";

type ShadowCatcherProps = {
    width?: number;
    depth?: number;
    intensity?: number;
}

const ShadowCatcherComponent: FC<ShadowCatcherProps> = (props) => {
    const { width = 2, depth = 2, intensity = 0.75 } = props;
    return <Entity>
        <Light type='directional' 
            castShadows={true} 
            normalOffsetBias={0} 
            shadowBias={0} 
            shadowDistance={16} 
            shadowResolution={1024} 
            shadowType={SHADOW_VSM_16F} 
            shadowUpdateMode={SHADOWUPDATE_REALTIME} 
            vsmBlurSize={16} 
            shadowIntensity={intensity} 
            intensity={0} />

        { /* We should avoid the new Vec3(width, 1, depth) here to avoid memory thrashing */}
        <Script script={ShadowCatcher} intensity={intensity} scale={new Vec3(width, 1, depth)} />
    </Entity>
}

export default ShadowCatcherComponent;
