import { Entity as pcEntity } from 'playcanvas';
import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useState } from 'react';
import { useParent, ParentContext, useApp } from './hooks';

export const Entity = forwardRef(function Entity(
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

  // Update entity properties when relevant props change
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