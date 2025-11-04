"use client";

import React, { useEffect, ReactNode } from 'react';
import { Entity } from 'playcanvas';
import { ParentContext } from '../../hooks/use-parent.tsx';
import { MergedRule, ActionType, ModifyComponentAction } from '../types.ts';

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

    // 2. Apply component actions with prop merging
    for (const [componentType, action] of rule.componentActions.entries()) {
      if (action.type !== ActionType.MODIFY_COMPONENT) continue;
      
      const existingComponent = entity.c?.[componentType];
      if (!existingComponent) continue;

      const modifyAction = action as ModifyComponentAction;
      const { remove, ...mergeProps } = modifyAction.props;

      // 'remove' prop always wins
      if (remove) {
        entity.removeComponent(componentType);
        continue;
      }

      // Apply all other props (generic merge)
      for (const propName in mergeProps) {
        const propValue = mergeProps[propName];
        const comp = existingComponent as unknown as Record<string, unknown>;
        
        if (typeof propValue === 'function') {
          // Functional update (e.g., intensity={val => val * 2})
          const existingValue = comp[propName];
          
          // Clone complex types to prevent accidental mutation
          const currentValue = (existingValue && typeof existingValue === 'object' && 'clone' in existingValue && typeof existingValue.clone === 'function')
            ? existingValue.clone()
            : existingValue;
            
          comp[propName] = propValue(currentValue);
          
        } else {
          // Value overwrite (e.g., intensity={10})
          comp[propName] = propValue;
        }
      }
    }
  }, [entity, rule]);

  // 3. Render new children
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

  // Render children with parent context
  return (
    <ParentContext.Provider value={entity}>
      {children}
    </ParentContext.Provider>
  );
};

