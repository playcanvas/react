"use client";

import React, { useEffect, useMemo, ReactNode, ReactElement } from 'react';
import { useGltfScene } from '../hooks/use-gltf-scene.tsx';
import { 
  Rule, 
  Action, 
  ActionType, 
  ModifyNodeProps, 
  ModifyComponentProps 
} from '../types.ts';
import { defaultPathMatcher } from '../utils/path-matcher.ts';

let ruleIdCounter = 0;

/**
 * ModifyNode component for defining entity modification rules
 * Must be a direct child of <GltfScene>
 * Renders null - only registers rules
 * 
 * @example
 * ```tsx
 * <Modify.Node path="head.*[light]" clearChildren>
 *   <Light color="red" />
 *   <Modify.Component type="render">
 *     {(props) => <Render {...props} castShadows={false} />}
 *   </Modify.Component>
 * </Modify.Node>
 * ```
 */
const ModifyNode: React.FC<ModifyNodeProps> = ({ path, clearChildren = false, children }) => {
  const { registerRule, unregisterRule } = useGltfScene();
  
  const ruleId = useMemo(() => `rule-${ruleIdCounter++}`, []);
  
  const rule = useMemo<Rule>(() => {
    const actions: Action[] = [];
    const addChildren: ReactNode[] = [];

    // Process children to separate Modify.Component from additions
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const type = child.type as { displayName?: string; name?: string };
        const displayName = type?.displayName || type?.name;
        
        if (displayName === 'ModifyComponent') {
          // This is a component modification
          const props = child.props as ModifyComponentProps;
          const componentAction = createComponentAction(props, ruleId);
          if (componentAction) {
            actions.push(componentAction);
          }
        } else {
          // This is a new child to add
          addChildren.push(child);
        }
      } else {
        // Non-element children (text, etc.)
        addChildren.push(child);
      }
    });

    // Add clearChildren action if specified
    if (clearChildren) {
      actions.push({
        type: ActionType.CLEAR_CHILDREN,
        ruleId,
        specificity: defaultPathMatcher.getSpecificity(path)
      });
    }

    // Add children action if there are any
    if (addChildren.length > 0) {
      actions.push({
        type: ActionType.ADD_CHILDREN,
        children: addChildren,
        ruleId,
        specificity: defaultPathMatcher.getSpecificity(path)
      });
    }

    return {
      id: ruleId,
      path,
      actions,
      specificity: defaultPathMatcher.getSpecificity(path)
    };
  }, [path, clearChildren, children, ruleId]);

  useEffect(() => {
    registerRule(rule);
    
    return () => {
      unregisterRule(ruleId);
    };
  }, [rule, registerRule, unregisterRule, ruleId]);

  return null;
};

ModifyNode.displayName = 'ModifyNode';

/**
 * ModifyComponent for modifying existing components on matched entities
 * Must be a child of <Modify.Node>
 * 
 * Generic type parameter allows TypeScript to infer component props from the type literal
 * 
 * @example
 * ```tsx
 * // Remove a component
 * <Modify.Component type="light" remove />
 * 
 * // Modify a component (render prop pattern)
 * <Modify.Component type="light">
 *   {(props) => <Light {...props} color="red" />}
 * </Modify.Component>
 * 
 * // Replace a component
 * <Modify.Component type="light">
 *   <Light type="directional" color="blue" intensity={2} />
 * </Modify.Component>
 * ```
 */
function ModifyComponent<T extends keyof import('../types.ts').ComponentTypeMap>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: ModifyComponentProps<T>
): null {
  // This component only exists to be processed by ModifyNode
  // It should never actually render
  return null;
}

ModifyComponent.displayName = 'ModifyComponent';

/**
 * Creates a component action from ModifyComponent props
 */
function createComponentAction(
  props: ModifyComponentProps,
  ruleId: string
): Action | null {
  const { type: componentType, remove, children } = props;
  
  const baseAction = {
    ruleId,
    componentType,
    specificity: 0 // Will be set by parent rule
  };

  // Remove action
  if (remove) {
    return {
      ...baseAction,
      type: ActionType.REMOVE_COMPONENT
    };
  }

  // No children means no action
  if (!children) {
    return null;
  }

  // Check if children is a render prop function
  if (typeof children === 'function') {
    return {
      ...baseAction,
      type: ActionType.MODIFY_COMPONENT,
      renderProp: children as (props: Record<string, unknown>) => ReactElement
    };
  }

  // Children is a replacement element
  if (React.isValidElement(children)) {
    return {
      ...baseAction,
      type: ActionType.REPLACE_COMPONENT,
      replacement: children
    };
  }

  return null;
}

/**
 * Modify compound component
 * Provides Modify.Node and Modify.Component
 */
export const Modify = {
  Node: ModifyNode,
  Component: ModifyComponent
};

