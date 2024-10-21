import { Entity as pcEntity } from 'playcanvas';
import React, { forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useParent, ParentContext, useApp } from './hooks';

interface EntityProps {
  children: React.ReactNode;
  name?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}

export const Entity = forwardRef<pcEntity, EntityProps>(function Entity(
  { children, name = 'Untitled', position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0] },
  ref
) {
  const parent = useParent();
  const app = useApp();
  // Create the entity only when 'app' changes
  const entity = useMemo(() => new pcEntity(name, app), [app]);

  useImperativeHandle(ref, () => entity);

  // Add entity to parent when 'entity' or 'parent' changes
  useLayoutEffect(() => {
    parent.addChild(entity);
    
    return () => {
        parent.removeChild(entity);
        entity.destroy(); // Clean up the entity
    };
  }, [app, parent, entity]);


  useLayoutEffect(() => {
    entity.name = name;
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    entity.setLocalEulerAngles(...rotation);
  }, [entity, name, position, scale, rotation]);

  return (
    <ParentContext.Provider value={entity}>
      {children}
    </ParentContext.Provider>
  );
});