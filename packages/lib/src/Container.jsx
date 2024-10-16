import { useLayoutEffect, useRef } from "react";
import { Entity } from "./Entity";
import { useApp, useParent } from "./hooks";

export const Container = ({ asset, ...props }) => {
    
    const assetEntityRef = useRef();
    const parent = useParent();
    const app = useApp();
    
    useLayoutEffect(() => {

        if(asset) {
            const assetEntity = asset.resource.instantiateRenderEntity();
            parent.addChild(assetEntity);
            assetEntityRef.current = assetEntity
        }
        
        return () => {
            if(!assetEntityRef.current || !parent) return;

            const assetEntity = assetEntityRef.current
            parent.removeChild(assetEntity)
            assetEntity.destroy();
            assetEntityRef.current = null

        }
    }, [app, parent, asset]);
}