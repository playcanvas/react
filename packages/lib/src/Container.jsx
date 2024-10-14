import { useLayoutEffect, useRef } from "react";
import { Entity } from "./Entity";

export const Container = ({ asset, ...props }) => {
    
    const entityRef = useRef();
    
    useLayoutEffect(() => {
        
        const entity = entityRef.current;
        if(asset && entity) {
            const assetEntity = asset.resource.instantiateRenderEntity();
            entity.addChild(assetEntity);
        }
        
        return () => {
            if(!asset || !entity) return;

            const assetEntity = entity.children[0];
            entity.removeChild(assetEntity);
            // assetEntity.destroy();

        }
    }, [asset]);

    return <Entity ref={entityRef} {...props} />
}