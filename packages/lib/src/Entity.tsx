import { Entity as PcEntity } from 'playcanvas';
import { PropsWithChildren, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useParent, ParentContext, useApp } from './hooks';

interface EntityProps extends PropsWithChildren {
  name?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  onPointerDown: Function
  onPointerUp: Function
}

export const Entity = forwardRef<PcEntity, PropsWithChildren<EntityProps>> (function Entity(
  { 
    name = 'Untitled', 
    children, 
    position = [0, 0, 0], 
    scale = [1, 1, 1], 
    rotation = [0, 0, 0],
    onPointerDown = () => null,
    onPointerUp = () => null
  },
  ref
) : React.ReactElement | null {
  const parent = useParent();
  const app = useApp();
  // Create the entity only when 'app' changes
  const entity = useMemo(() => new PcEntity(name, app), [app]) as PcEntity;

  useImperativeHandle(ref, () => entity);

  // Add entity to parent when 'entity' or 'parent' changes
  useLayoutEffect(() => {
    parent.addChild(entity);
    
    return () => {
        parent.removeChild(entity);
        entity.destroy(); // Clean up the entity
    };
  }, [app, parent, entity]);


  // PointerEvents
  useLayoutEffect(() => {

    entity.__pointerdown = (e : PointerEvent) => onPointerDown(e)
    entity.__pointerup = (e : PointerEvent) => onPointerUp(e)

    return () => {
      entity.__pointerdown = null;
      entity.__pointerup = null;
    }

  }, [app, parent, entity, onPointerDown, onPointerUp]);


  useLayoutEffect(() => {
    entity.name = name;
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    entity.setLocalEulerAngles(...rotation);
  }, [entity, name, position, scale, rotation]);

  return (<>
    <ParentContext.Provider value={entity}>
      {children || null}
    </ParentContext.Provider>
  </> );
});