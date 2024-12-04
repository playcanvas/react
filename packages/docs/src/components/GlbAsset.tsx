"use client";

import { useModel } from "./hooks/use-asset";
import { Asset } from "playcanvas";
import { FC } from "react";
import { Render } from "@playcanvas/react/components";
import ShadowCatcher from "@components/ShadowCatcher";
type GlbAssetProps = {
    src: string;
}

const GlbAsset: FC<GlbAssetProps> = ({ src, ...props }) => {

    const { data } = useModel(src);

    return <Render asset={data as Asset} type='asset'  >
        { data instanceof Asset && <ShadowCatcher {...props}/> }
    </Render>
}

export default GlbAsset;