"use client"

import { Entity as PcEntity } from 'playcanvas';
import { ReactNode, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useParent, ParentContext, useApp } from './hooks';
import { SyntheticMouseEvent, SyntheticPointerEvent } from './utils/synthetic-event';
import { usePointerEventsContext } from './contexts/pointer-events-context';

type PointerEventCallback = (event: SyntheticPointerEvent) => void;
type MouseEventCallback = (event: SyntheticMouseEvent) => void;

interface EntityProps {
  name?: string;
  position?: number[];
  scale?: number[];
  rotation?: number[];
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
  const pointerEvents = usePointerEventsContext();

  // Check if the entity has pointer events attached
  const hasPointerEvents = !!(onPointerDown || onPointerUp || onPointerOver || onPointerOut || onClick);

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

    if (hasPointerEvents) {
      pointerEvents.add(entity.getGuid());
    }

    entity.on('pointerdown', onPointerDown);
    entity.on('pointerup', onPointerUp);
    entity.on('pointerover', onPointerOver);
    entity.on('pointerout', onPointerOut);
    entity.on('click', onClick);
    
    return () => {
      if (hasPointerEvents) {
        pointerEvents.delete(entity.getGuid());
      }
      entity.off('pointerdown', onPointerDown);
      entity.off('pointerup', onPointerUp);
      entity.off('pointerover', onPointerOver);
      entity.off('pointerout', onPointerOut);
      entity.off('click', onClick);
    }

  }, [app, parent, entity, onPointerDown, onPointerUp, onPointerOver, onPointerOut, onClick]);

  useLayoutEffect(() => {
    entity.name = name;
    entity.setLocalPosition(...position as [number, number, number]);
    entity.setLocalScale(...scale as [number, number, number]);
    entity.setLocalEulerAngles(...rotation as [number, number, number]);
  }, [entity, name, position, scale, rotation]);

  return (<>
    <ParentContext.Provider value={entity}>
      {children || null}
    </ParentContext.Provider>
  </> );
});