import { useLayoutEffect, useRef } from "react";
import { Entity } from "../Entity";

export const GSplat = ({ asset, ...props } = {}) => {

    const entityRef = useRef();

    useLayoutEffect(() => {

        if(asset) {
            const assetEntity = asset.resource.instantiate();
            entityRef.current.addChild(assetEntity);
        }

        return () => {

            const entity = entityRef.current;
            if (!entity) return;

            const assetEntity = entity.children[0];
            if (!assetEntity) return;

            entity.removeChild(assetEntity);
        }
    }, [asset]);

    return <Entity ref={entityRef} {...props} />

}