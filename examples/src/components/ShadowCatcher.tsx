
import { Entity } from "@playcanvas/react";
import { Light, Script } from "@playcanvas/react/components";
import { SHADOW_VSM_16F, SHADOWUPDATE_REALTIME, Vec3 } from "playcanvas";
// @ts-expect-error - ShadowCatcher types not available
import { ShadowCatcher as ShadowCatcherScript } from "playcanvas/scripts/esm/shadow-catcher.mjs";
import { FC, useMemo } from "react";

type ShadowCatcherProps = {
    width?: number;
    depth?: number;
    intensity?: number;
}

export const ShadowCatcher: FC<ShadowCatcherProps> = (props) => {
    const { width = 2, depth = 2, intensity = 0.75 } = props;
    const scale = useMemo(() => new Vec3(width, 1, depth), [width, depth]);
    return <Entity position={[0, .001, 0]}>
        <Light type='directional' 
            castShadows={true} 
            normalOffsetBias={0} 
            shadowBias={0} 
            shadowDistance={16} 
            shadowResolution={1024} 
            shadowType={SHADOW_VSM_16F} 
            shadowUpdateMode={SHADOWUPDATE_REALTIME} 
            vsmBlurSize={8} 
            shadowIntensity={intensity} 
            intensity={0} />
        <Script script={ShadowCatcherScript} intensity={intensity} scale={scale} />
    </Entity>
}
