import { useEffect, useRef } from "react";
import { Entity, useParent } from "../Entity";

export const GSplat = ({ asset, ...props } = {}) => {

    const entityRef = useRef();

    useEffect(() => {

        if(asset) {
            const assetEntity = asset.resource.instantiate();
            entityRef.current.addChild(assetEntity);
        }

        // return () => {

        //     const entity = entityRef.current;
        //     if (!entity) return;

        //     const assetEntity = entity.children[0];

        //     if (!assetEntity) return;

        //     entity.removeChild(assetEntity);
        //     assetEntity.destroy();
        // }
    }, [asset]);

    return <Entity ref={entityRef} {...props} />

}