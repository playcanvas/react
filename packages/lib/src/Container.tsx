import { FC, useLayoutEffect, useRef } from "react";
import { useApp } from "./hooks";
import { Asset, Entity as PcEntity } from "playcanvas";
import { Entity } from ".";

interface ContainerProps {
    asset: Asset;
    [key: string]: unknown;
}

export const Container: FC<ContainerProps> = ({ asset, ...props }) => {

    const entityRef = useRef<PcEntity | null>(null);
    const assetEntityRef = useRef<PcEntity | null>(null);
    const app = useApp();

    useLayoutEffect(() => {
        if (app && asset?.resource && entityRef.current) {
            const assetEntity = asset.resource.instantiateRenderEntity();
            entityRef.current.addChild(assetEntity);
            assetEntityRef.current = assetEntity;
        }

        return () => {
            if (!entityRef.current || !assetEntityRef.current) return;
        
            // Don't destroy the underlying resource as it may be used by other components
            assetEntityRef.current.destroy();
            entityRef.current.removeChild(assetEntityRef.current);

            entityRef.current = null;
            assetEntityRef.current = null;

        };
    }, [app, parent, asset, asset.resource]);


    return <Entity ref={entityRef} {...props}/>;
};