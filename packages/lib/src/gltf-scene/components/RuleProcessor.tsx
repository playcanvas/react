"use client";

import React, { useEffect, ReactNode } from 'react';
import { Entity } from 'playcanvas';
import { ParentContext } from '../../hooks/use-parent.tsx';
import { MergedRule, ActionType } from '../types.ts';
import { getSerializablePropertyNames } from '../utils/schema-registry.ts';

/**
 * Internal component that applies final merged rules to entities
 * Handles component modifications and renders new children
 */
export interface RuleProcessorProps {
  entity: Entity;
  rule: MergedRule;
}

export const RuleProcessor: React.FC<RuleProcessorProps> = ({ entity, rule }) => {
  // Apply modifications in a batched effect
  useEffect(() => {
    // 1. Clear children if requested
    if (rule.clearChildren) {
      const originalChildren = [...entity.children];
      originalChildren.forEach(child => {
        entity.removeChild(child);
        child.destroy();
      });
    }

    // 2. Apply component actions
    for (const [componentType, action] of rule.componentActions.entries()) {
      const existingComponent = entity.c?.[componentType];

      switch (action.type) {
        case ActionType.REMOVE_COMPONENT:
          if (existingComponent) {
            entity.removeComponent(componentType);
          }
          break;

        case ActionType.REPLACE_COMPONENT:
          // Note: Replacement is handled in the render phase
          // This is just for cleanup
          if (existingComponent) {
            entity.removeComponent(componentType);
          }
          break;

        case ActionType.MODIFY_COMPONENT:
          // Modification is handled in the render phase
          break;
      }
    }
  }, [entity, rule]);

  // 3. Render additions and component replacements/modifications
  const children: ReactNode[] = [];

  // Add new children from actions
  if (rule.addChildren.length > 0) {
    rule.addChildren.forEach((child, index) => {
      if (React.isValidElement(child)) {
        // Clone with unique key to ensure proper React reconciliation
        children.push(
          React.cloneElement(child, {
            key: `${rule.entityGuid}:add:${index}`
          })
        );
      } else {
        children.push(child);
      }
    });
  }

  // Add component replacements/modifications
  for (const [componentType, action] of rule.componentActions.entries()) {
    if (action.type === ActionType.REPLACE_COMPONENT) {
      const replacementAction = action as { replacement: unknown };
      if (React.isValidElement(replacementAction.replacement)) {
        children.push(
          React.cloneElement(replacementAction.replacement, {
            key: `${rule.entityGuid}:replace:${componentType}`
          })
        );
      }
    } else if (action.type === ActionType.MODIFY_COMPONENT) {
      // Get existing component props
      const existingComponent = entity.c?.[componentType];
      if (existingComponent && 'renderProp' in action && typeof action.renderProp === 'function') {
        // Serialize component props using component schema
        const props = serializeComponentProps(existingComponent, componentType);
        const modifiedElement = action.renderProp(props);
        if (React.isValidElement(modifiedElement)) {
          children.push(
            React.cloneElement(modifiedElement, {
              key: `${rule.entityGuid}:modify:${componentType}`
            })
          );
        }
      }
    }
  }

  // Render children with parent context
  return (
    <ParentContext.Provider value={entity}>
      {children}
    </ParentContext.Provider>
  );
};

/**
 * Helper to serialize component properties
 * Handles PlayCanvas complex types (Color, Vec2, Vec3, Vec4, Material, etc.)
 * 
 * Note: PlayCanvas component properties are on the component object itself,
 * NOT in component.data (which only contains 'enabled' flag).
 * See: https://github.com/playcanvas/engine/blob/main/src/framework/components/
 */
function serializeComponentProps(component: unknown, componentType: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  
  if (!component || typeof component !== 'object') {
    return props;
  }

  const comp = component as Record<string, unknown>;
  
  // Get schema-defined properties if available
  const propertiesToSerialize = getSerializablePropertyNames(componentType);

  if (!propertiesToSerialize) {
    return props;
  }

  // Iterate over properties to serialize
  for (const key of propertiesToSerialize) {
    if (!(key in comp)) continue;
    
    const value = comp[key];
    
    if (value === null || value === undefined) {
      props[key] = value;
      continue;
    }

    // Primitives
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      props[key] = value;
      continue;
    }

    // Handle objects with proper type checking
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;

      // PlayCanvas types with toArray() method (Color, Vec2, Vec3, Vec4, Quat)
      if ('toArray' in obj && typeof obj.toArray === 'function') {
        props[key] = obj.toArray();
        continue;
      }

      // PlayCanvas Asset (Material, Texture, etc.)
      if ('id' in obj && typeof obj.id === 'number') {
        props[key] = obj.id;
        continue;
      }
    }

    // Arrays (recurse for complex array elements)
    if (Array.isArray(value)) {
      props[key] = value.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Try to serialize complex array items
          return serializeValue(item);
        }
        return item;
      });
      continue;
    }

    // For other objects, try to extract useful data
    const serialized = serializeValue(value);
    if (serialized !== null) {
      props[key] = serialized;
    }
  }

  return props;
}

/**
 * Helper to serialize a single value
 * Uses PlayCanvas's official toArray() method for math types
 */
function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;

  const obj = value as Record<string, unknown>;

  // PlayCanvas types with toArray() method (Color, Vec2, Vec3, Vec4, Quat)
  if ('toArray' in obj && typeof obj.toArray === 'function') {
    return obj.toArray();
  }

  // PlayCanvas Asset (Material, Texture, etc.)
  if ('id' in obj && typeof obj.id === 'number') {
    return obj.id;
  }

  // Can't serialize - return null to skip
  return null;
}

