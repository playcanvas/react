import { FC, useLayoutEffect, useRef } from "react";
import { useParent } from "../hooks";
import { Asset, Entity } from "playcanvas";

interface GSplatProps {
    asset: Asset;
}

export const GSplat: FC<GSplatProps> = ({ asset }) => {
    const parent: Entity = useParent();
    const assetRef = useRef<Entity | null>(null);

    useLayoutEffect(() => {
        if (asset) {
            assetRef.current = asset.resource.instantiate();
            if (assetRef.current) parent.addChild(assetRef.current);
        }

        return () => {

            if (!assetRef.current) return;
            parent.removeChild(assetRef.current);
        };
    }, [asset]);

    return null;
};