import { FC, useLayoutEffect, useRef } from "react";
import { useApp } from "./hooks/index.ts";
import { Asset, Entity as PcEntity } from "playcanvas";
import { Entity } from "./Entity.tsx";
import { GlbContainerResource } from "playcanvas/build/playcanvas/src/framework/parsers/glb-container-resource.js";
interface ContainerProps {
    asset: Asset;
    children?: React.ReactNode;
    [key: string]: unknown;
}

/**
 * Renders a PlayCanvas asset as a React component.
 * @param {Asset} asset - The PlayCanvas asset to render.
 * @param {React.ReactNode} children - The children to render inside the container.
 * @param {Object} [props] - Additional properties to pass to the container.
 * @returns {React.ReactNode} - The rendered container.
 */
export const Container: FC<ContainerProps> = ({ asset, children, ...props }) => {

    const entityRef = useRef<PcEntity | null>(null);
    const assetEntityRef = useRef<PcEntity | null>(null);
    const app = useApp();

    useLayoutEffect(() => {
        if (app && asset?.resource && entityRef.current) {
            const resource = asset.resource as GlbContainerResource;
            const assetEntity = resource.instantiateRenderEntity(null);
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
    }, [app, parent, asset, asset?.resource]);

    if(!asset?.resource) return null;

    return <Entity ref={entityRef} {...props}>
        { children }
    </Entity>;
};
