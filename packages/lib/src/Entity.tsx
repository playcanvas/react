import { Entity as PcEntity } from 'playcanvas';
import { ReactNode, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useParent, ParentContext, useApp } from './hooks';
import { SyntheticMouseEvent, SyntheticPointerEvent } from './utils/synthetic-event';

type PointerEventCallback = (event: SyntheticPointerEvent) => void;
type MouseEventCallback = (event: SyntheticMouseEvent) => void;

interface EntityProps {
  name?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  onPointerUp?: PointerEventCallback;
  onPointerDown?: PointerEventCallback;
  onPointerOver?: PointerEventCallback;
  onPointerOut?: PointerEventCallback;
  onClick?: MouseEventCallback;
  children?: ReactNode
}


export const Entity = forwardRef<PcEntity, EntityProps> (function Entity(
  { 
    name = 'Untitled', 
    children, 
    position = [0, 0, 0], 
    scale = [1, 1, 1], 
    rotation = [0, 0, 0],
    onPointerDown = () => null,
    onPointerUp = () => null,
    onPointerOver = () => null,
    onPointerOut = () => null,
    onClick = () => null
  },
  ref
) : React.ReactElement | null {
  const parent = useParent();
  const app = useApp();

  // Create the entity only when 'app' changes
  const entity = useMemo(() => new PcEntity(name, app), [app]) as PcEntity

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

    const onLocalPointerDown = (e : SyntheticPointerEvent) => onPointerDown(e)
    const onLocalPointerUp = (e : SyntheticPointerEvent) => onPointerUp(e)
    const onLocalPointerOver = (e : SyntheticPointerEvent) => onPointerOver(e)
    const onLocalPointerOut = (e : SyntheticPointerEvent) => onPointerOut(e)
    const onLocalClick = (e : SyntheticMouseEvent) => onClick(e)

    entity.on('pointerdown', onLocalPointerDown);
    entity.on('pointerup', onLocalPointerUp);
    entity.on('pointerover', onLocalPointerOver);
    entity.on('pointerout', onLocalPointerOut);
    entity.on('click', onLocalClick);
    
    return () => {
      entity.off('pointerdown', onLocalPointerDown);
      entity.off('pointerup', onLocalPointerUp);
      entity.off('pointerover', onLocalPointerOver);
      entity.off('pointerout', onLocalPointerOut);
      entity.off('click', onLocalClick);
    }

  }, [app, parent, entity, onPointerDown, onPointerUp, onPointerOver, onPointerOut, onClick]);

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