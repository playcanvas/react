import { Entity as pcEntity } from 'playcanvas';
import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { useApp } from './Application';

export const ParentContext = createContext(null);

export const useParent = () => {
    return useContext(ParentContext);
}

export const Entity = forwardRef(function Entity({ children, name, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] }, ref) {

    const entityRef = useRef();
    const parent = useParent();
    const app = useApp();

    useImperativeHandle(ref, () => entityRef.current);

    if(!entityRef.current) {
        entityRef.current = new pcEntity(name, app);
    }

    // set entity props
    entityRef.current.name = name;
    entityRef.current.setLocalPosition(...position);
    entityRef.current.setLocalScale(...scale);
    entityRef.current.setLocalEulerAngles(...rotation);

    useEffect(() => {
        if(parent){
            parent.addChild(entityRef.current);
        }
        return () => {
            parent.removeChild(entityRef.current);
        }
    }, [parent]);
  
    return <ParentContext.Provider value={entityRef.current}>
      {children}
    </ParentContext.Provider>
});
  