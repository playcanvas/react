"use client"

import { Entity as PcEntity } from 'playcanvas';
import { ReactNode, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useParent, ParentContext, useApp } from './hooks';
import { SyntheticMouseEvent, SyntheticPointerEvent } from './utils/synthetic-event';
import { usePointerEventsContext } from './contexts/pointer-events-context';
import { PublicProps } from './utils/types-utils';
import { validateAndSanitizeProps, createComponentDefinition, ComponentDefinition, Schema } from './utils/validation';

/**
 * The Entity component is the fundamental building block of a PlayCanvas scene.
 * It represents a node in the scene graph and can have components attached to it.
 *
 * @example
 * // Basic usage
 * <Entity name="myEntity" position={[0, 1, 0]}>
 *   <Render type="box" />
 * </Entity>
 * 
 * @example
 * // With pointer events
 * <Entity 
 *   position={[0, 1, 0]}
 *   onPointerDown={(e) => console.log('Clicked!')}
 *   onClick={(e) => console.log('Mouse clicked!')}
 * >
 *   <Render type="sphere" />
 * </Entity>
 * 
 * @param {EntityProps} props - Component props
 */
export const Entity = forwardRef<PcEntity, EntityProps> (function Entity(
  props,
  ref
) : React.ReactElement | null {

  const { children, ...propsToValidate } = props;
  const safeProps = validateAndSanitizeProps(
    propsToValidate, 
    componentDefinition as ComponentDefinition<EntityProps>
  );

  const { 
    /** The name of the entity */
    name = 'Untitled', 
    /** The local position of the entity */
    position = [0, 0, 0], 
    /** The local scale of the entity */
    scale = [1, 1, 1], 
    /** The local rotation of the entity */
    rotation = [0, 0, 0],
    /** The callback for the pointer down event */
    onPointerDown,
    /** The callback for the pointer up event */
    onPointerUp,
    /** The callback for the pointer over event */
    onPointerOver,
    /** The callback for the pointer out event */
    onPointerOut,
    /** The callback for the click event */
    onClick,
  } : EntityProps = safeProps;

  const parent = useParent();
  const app = useApp();
  const pointerEvents = usePointerEventsContext();

  // Check if the entity has pointer events attached
  const hasPointerEvents = !!(onPointerDown || onPointerUp || onPointerOver || onPointerOut || onClick);

  // Create the entity only when 'app' changes
  const entity = useMemo(() => new PcEntity(undefined, app), [app]) as PcEntity

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

type PointerEventCallback = (event: SyntheticPointerEvent) => void;
type MouseEventCallback = (event: SyntheticMouseEvent) => void;

export interface EntityProps extends Partial<PublicProps<PcEntity>> {
  name?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number, number?];
  onPointerUp?: PointerEventCallback;
  onPointerDown?: PointerEventCallback;
  onPointerOver?: PointerEventCallback;
  onPointerOut?: PointerEventCallback;
  onClick?: MouseEventCallback;
  children?: ReactNode;
}

const componentDefinition = createComponentDefinition(
  "Entity",
  () => new PcEntity(),
  (entity) => entity.destroy()
)

componentDefinition.schema = {
  ...componentDefinition.schema,
  onPointerDown: {
    validate: (val: unknown) => typeof val === 'function',
    errorMsg: (val: unknown) => `Invalid value for prop "onPointerDown": "${val}". Expected a function.`,
    default: undefined
  }, 
  onPointerUp: {
    validate: (val: unknown) => typeof val === 'function',
    errorMsg: (val: unknown) => `Invalid value for prop "onPointerUp": "${val}". Expected a function.`,
    default: undefined
  },
  onPointerOver: {
    validate: (val: unknown) => typeof val === 'function',
    errorMsg: (val: unknown) => `Invalid value for prop "onPointerOver": "${val}". Expected a function.`,
    default: undefined
  },
  onPointerOut: {
    validate: (val: unknown) => typeof val === 'function',
    errorMsg: (val: unknown) => `Invalid value for prop "onPointerOut": "${val}". Expected a function.`,
    default: undefined
  },
  onClick: {
    validate: (val: unknown) => typeof val === 'function',
    errorMsg: (val: unknown) => `Invalid value for prop "onClick": "${val}". Expected a function.`,
    default: undefined
  }
} as Schema<EntityProps>