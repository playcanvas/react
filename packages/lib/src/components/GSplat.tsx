"use client"

import { FC, useLayoutEffect, useRef } from "react";
import { useParent } from "../hooks";
import { Asset, Entity } from "playcanvas";

interface GSplatProps {
    vertex?: string;
    fragment?: string;
    asset: Asset;
}

export const GSplat: FC<GSplatProps> = ({ vertex, fragment, asset }) => {
    const parent: Entity = useParent();
    const assetRef = useRef<Entity | null>(null);

    useLayoutEffect(() => {
        if (asset) {
            assetRef.current = asset.resource.instantiate({ vertex, fragment });
            if (assetRef.current) parent.addChild(assetRef.current);
        }

        return () => {
            if (!assetRef.current) return;
            parent.removeChild(assetRef.current);
        };
    }, [asset]);

    return null;
};