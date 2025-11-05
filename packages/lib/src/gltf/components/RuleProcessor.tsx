"use client";

import React, { useEffect, ReactNode } from 'react';
import { Entity, Component } from 'playcanvas';
import { ParentContext } from '../../hooks/use-parent.tsx';
import { MergedRule, ActionType, ModifyComponentAction, SupportedComponentType } from '../types.ts';
import { componentSchemaRegistry } from '../utils/schema-registry.ts';
import { validatePropsPartial, applyProps, ComponentDefinition, Schema, warnOnce } from '../../utils/validation.ts';

/**
 * Internal component that applies final merged rules to entities
 * Handles component modifications and renders new children
 */
export interface RuleProcessorProps {
  entity: Entity;
  rule: MergedRule;
  originalChildGUIDs: string[];
}

export const RuleProcessor: React.FC<RuleProcessorProps> = ({ entity, rule, originalChildGUIDs }) => {
  // Apply modifications in a batched effect
  useEffect(() => {
    // 1. Clear children if requested
    if (rule.clearChildren) {
      const originalChildren = originalChildGUIDs.map(guid => {
        return entity.children.find(c => c.getGuid() === guid);
      }).filter(Boolean); // Filter out any that might already be gone
      
      // Now, we only destroy the original children
      originalChildren.forEach(child => {
        entity.removeChild(child as Entity);
        (child as Entity).destroy();
      });
    }

    // 2. Apply component actions with prop merging using component schemas
    for (const [componentType, action] of rule.componentActions.entries()) {
      if (action.type !== ActionType.MODIFY_COMPONENT) continue;
      
      // componentType is now type-safe: SupportedComponentType
      const existingComponent = entity.c?.[componentType];
      if (!existingComponent) continue;

      const modifyAction = action as ModifyComponentAction;
      const { remove, ...mergeProps } = modifyAction.props;

      // 'remove' prop always wins
      if (remove) {
        entity.removeComponent(componentType);
        continue;
      }

      // Get component definition from registry (type-safe now)
      const componentDef = componentSchemaRegistry[componentType] as ComponentDefinition<Record<string, unknown>, Component> | undefined;
      
      if (!componentDef || !componentDef.schema) {
        throw new Error(`No component schema found for component type "${componentType}". Component must be registered in schema registry.`);
      }

      // Execute functional props and prepare for validation
      const propsToValidate: Record<string, unknown> = {};
      const comp = existingComponent as unknown as Record<string, unknown>;
      const schema = componentDef.schema as Schema<Record<string, unknown>, Component>;
      
      for (const propName in mergeProps) {
        const propValue = mergeProps[propName];
        
        if (typeof propValue === 'function') {
          // Functional update (e.g., intensity={(val) => val * 2})
          // Get current value from component and execute function
          const currentValue = comp[propName];
          propsToValidate[propName] = propValue(currentValue);
        } else {
          // Direct value
          propsToValidate[propName] = propValue;
        }
      }

      // Validate props using component schema
      const validatedProps = validatePropsPartial(
        propsToValidate,
        componentDef,
        false // Don't warn about unknown props during modification
      );

      // Apply validated props using schema's apply functions
      applyProps(
        existingComponent as Component,
        schema,
        validatedProps as Record<string, unknown>
      );
    }
  }, [entity, rule]);

  // 3. Render new children
  const children: ReactNode[] = [];

  // Add new children from actions
  if (rule.addChildren.length > 0) {
    rule.addChildren.forEach((child, index) => {
      if (React.isValidElement(child)) {
        // Check if this is a component that already exists on the entity
        const childType = child.type as { displayName?: string; name?: string };
        const displayName = childType?.displayName || childType?.name;
        
        // Map component display names to component types
        const componentTypeMap: Record<string, SupportedComponentType> = {
          'Light': 'light',
          'Render': 'render',
          'Camera': 'camera'
        };
        
        const componentType = componentTypeMap[displayName || ''];
        if (componentType && entity.c?.[componentType]) {
          warnOnce(
            `Cannot add <${displayName}> component to entity "${entity.name}". ` +
            `Entity already has a ${componentType} component. ` +
            `Use <Modify.${displayName}> to modify the existing component, or <Modify.${displayName} remove> to remove it first.`
          );
        }
        
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

  // Render children with parent context
  return (
    <ParentContext.Provider value={entity}>
      {children}
    </ParentContext.Provider>
  );
};

