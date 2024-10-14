import { Entity as pcEntity } from 'playcanvas';
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { useParent, ParentContext, useApp } from './hooks';

export const Entity = forwardRef(function Entity({ children, name = 'Untitled', position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }, ref) {

    const parent = useParent();
    const app = useApp();
    const entityRef = useRef(new pcEntity(name, app));

    useImperativeHandle(ref, () => entityRef.current);

    useLayoutEffect(() => {
        parent.addChild(entityRef.current);

        return () => {
            parent.removeChild(entityRef.current);
        }
    }, [app, parent, children]);

    useLayoutEffect(() => {
        entityRef.current.name = name;
        entityRef.current.setLocalPosition(...position);
        entityRef.current.setLocalScale(...scale);
        entityRef.current.setLocalEulerAngles(...rotation);
    }, [name, position, scale, rotation]);
  
    return <ParentContext.Provider value={entityRef.current}>
      {children}
    </ParentContext.Provider>
});
  