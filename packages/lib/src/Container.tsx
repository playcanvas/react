import { useLayoutEffect, useRef } from "react";
import { useApp, useParent } from "./hooks";
import { Asset, Entity } from "playcanvas";

interface ContainerProps {
    asset: Asset;
}

export const Container = ({ asset } : ContainerProps) => {
    const assetEntityRef = useRef<Entity | null>(null);
    const parent: Entity = useParent();
    const app = useApp();

    useLayoutEffect(() => {
        if (asset) {
            const assetEntity = asset.resource.instantiateRenderEntity();
            parent.addChild(assetEntity);
            assetEntityRef.current = assetEntity;
        }

        return () => {
            if (!assetEntityRef.current || !parent) return;

            const assetEntity = assetEntityRef.current;
            parent.removeChild(assetEntity);
            assetEntity.destroy();
            assetEntityRef.current = null;
        };
    }, [app, parent, asset]);
};