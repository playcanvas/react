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
    onPointerDown,
    onPointerUp,
    onPointerOver,
    onPointerOut,
    onClick,
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

    if (onPointerDown) entity.on('pointerdown', onPointerDown);
    if (onPointerUp) entity.on('pointerup', onPointerUp);
    if (onPointerOver) entity.on('pointerover', onPointerOver);
    if (onPointerOut) entity.on('pointerout', onPointerOut);
    if (onClick) entity.on('click', onClick);
    
    return () => {
      if (hasPointerEvents) {
        pointerEvents.delete(entity.getGuid());
      }
      if (onPointerDown) entity.off('pointerdown', onPointerDown);
      if (onPointerUp) entity.off('pointerup', onPointerUp);
      if (onPointerOver) entity.off('pointerover', onPointerOver);
      if (onPointerOut) entity.off('pointerout', onPointerOut);
      if (onClick) entity.off('click', onClick);
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