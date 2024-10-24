import { Entity as PcEntity } from 'playcanvas';
import { PropsWithChildren, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useParent, ParentContext, useApp } from './hooks';
import { SyntheticPointerEvent } from './utils/synthetic-event';

interface EntityProps extends PropsWithChildren {
  name?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  onPointerUp?: Function;
  onPointerDown?: Function;
  onMouseUp?: Function;
  onMouseDown?: Function;
  onPointerOver?: Function;
  onPointerOut?: Function;
  onClick?: Function;
}

export const Entity = forwardRef<PcEntity, PropsWithChildren<EntityProps>> (function Entity(
  { 
    name = 'Untitled', 
    children, 
    position = [0, 0, 0], 
    scale = [1, 1, 1], 
    rotation = [0, 0, 0],
    onPointerDown = () => null,
    onPointerUp = () => null,
    onMouseDown = () => null,
    onMouseUp = () => null,
    onPointerOver = () => null,
    onPointerOut = () => null,
    onClick = () => null
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

    // @ts-ignore
    entity.__pointerdown = (e : SyntheticPointerEvent) => onPointerDown(e)
    // @ts-ignore
    entity.__pointerup = (e : SyntheticPointerEvent) => onPointerUp(e)
    // @ts-ignore
    entity.__mousedown = (e : SyntheticPointerEvent) => onMouseDown(e)
    // @ts-ignore
    entity.__mouseup = (e : SyntheticPointerEvent) => onMouseUp(e)
    // @ts-ignore
    entity.__pointerover = (e : SyntheticPointerEvent) => onPointerOver(e)
    // @ts-ignore
    entity.__pointerout = (e : SyntheticPointerEvent) => onPointerOut(e)
    // @ts-ignore
    entity.__click = (e : SyntheticMouseEvent) => onClick(e)
    
    return () => {
      // @ts-ignore
      entity.__pointerdown = null;
      // @ts-ignore
      entity.__pointerup = null;
      // @ts-ignore
      entity.__pointerover = null;
      // @ts-ignore
      entity.__pointerout = null;
      // @ts-ignore
      entity.__click = null;
    }

  }, [app, parent, entity, onPointerDown, onPointerUp, onPointerOver, onPointerOut]);

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