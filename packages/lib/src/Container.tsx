import { FC, useLayoutEffect, useRef } from "react";
import { useApp } from "./hooks";
import { Asset, Entity as PcEntity } from "playcanvas";
import { Entity } from ".";

interface ContainerProps {
    asset: Asset;
    [key: string]: any;
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
        
            entityRef.current.removeChild(assetEntityRef.current);
            assetEntityRef.current.destroy();
            asset.resource?.destroy();

            entityRef.current = null;
            assetEntityRef.current = null;

        };
    }, [app, parent, asset, asset.resource]);


    return <Entity ref={entityRef} {...props}/>;
};