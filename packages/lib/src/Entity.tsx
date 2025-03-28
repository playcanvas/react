"use client"

import { Entity as PcEntity } from 'playcanvas';
import { ReactNode, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from 'react';
import { useParent, ParentContext, useApp } from './hooks';
import { SyntheticMouseEvent, SyntheticPointerEvent } from './utils/synthetic-event';
import { usePointerEventsContext } from './contexts/pointer-events-context';
import { PublicProps } from './utils/types-utils';
import { PropSchemaDefinition, validateAndSanitizeProps } from './utils/validation';

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
 * @param {Object} props - Component props
 * @param {string} [props.name="Untitled"] - The name of the entity
 * @param {number[] | Vec3} [props.position=[0,0,0]] - The local position
 * @param {number[] | Vec3} [props.scale=[1,1,1]] - The local scale
 * @param {number[] | Quat} [props.rotation=[0,0,0,1]] - The local rotation
 * @param {boolean} [props.enabled=true] - Whether the entity is enabled
 * @param {function} [props.onPointerDown] - Pointer down event handler
 * @param {function} [props.onPointerUp] - Pointer up event handler
 * @param {function} [props.onPointerOver] - Pointer over event handler
 * @param {function} [props.onPointerOut] - Pointer out event handler
 * @param {function} [props.onClick] - Click event handler
 * @param {React.ReactNode} [props.children] - Child components
 * @param {React.Ref} ref - Ref to access the underlying PlayCanvas Entity
 * @returns {React.ReactElement} The Entity component
 */
export const Entity = forwardRef<PcEntity, EntityProps> (function Entity(
  props,
  ref
) : React.ReactElement | null {

  const schema: {
    [K in keyof EntityProps]?: PropSchemaDefinition<EntityProps[K]>
  } = {
    name: {
      validate: (val: unknown) => typeof val === 'string',
      errorMsg: (val: unknown) => `Invalid "name" prop: expected a string, got ${typeof val}`,
      default: 'Untitled'
    },
    position: {
      validate: (val: unknown) => Array.isArray(val) && val.length === 3,
      errorMsg: (val: unknown) => `Invalid "position" prop: expected an array of 3 numbers, got ${typeof val}`,
      default: [0, 0, 0],
    },
    rotation: {
      validate: (val: unknown) => Array.isArray(val) && (val.length === 3 || val.length === 4),
      errorMsg: (val: unknown) => `Invalid "rotation" prop: expected an array of 3 or 4 numbers, got ${typeof val}`,
      default: [0, 0, 0, 1]
    },
    scale: {
      validate: (val: unknown) => Array.isArray(val) && val.length === 3,
      errorMsg: (val: unknown) => `Invalid "scale" prop: expected array of 3 numbers, got ${typeof val}`,
      default: [1, 1, 1]
    },
    onPointerDown: {
      validate: (val: unknown) => typeof val === 'function',
      errorMsg: (val: unknown) => `Invalid "onPointerDown" prop: expected a function, got ${typeof val}`,
      default: undefined
    }, 
    onPointerUp: {
      validate: (val: unknown) => typeof val === 'function',
      errorMsg: (val: unknown) => `Invalid "onPointerUp" prop: expected a function, got ${typeof val}`,
      default: undefined
    },
    onPointerOver: {
      validate: (val: unknown) => typeof val === 'function',
      errorMsg: (val: unknown) => `Invalid "onPointerOver" prop: expected a function, got ${typeof val}`,
      default: undefined
    },
    onPointerOut: {
      validate: (val: unknown) => typeof val === 'function',
      errorMsg: (val: unknown) => `Invalid "onPointerOut" prop: expected a function, got ${typeof val}`,
      default: undefined
    },
    onClick: {
      validate: (val: unknown) => typeof val === 'function',
      errorMsg: (val: unknown) => `Invalid "onClick" prop: expected a function, got ${typeof val}`,
      default: undefined
    },
  };

  const safeProps = validateAndSanitizeProps(props, schema);

  const { 
    /** The name of the entity */
    name = 'Untitled', 
    /** Child components */
    children, 
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
  } = safeProps;

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