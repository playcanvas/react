"use client";

import React, { useEffect, useMemo, ReactNode } from 'react';
import { useGltf } from '../hooks/use-gltf.tsx';
import { 
  Rule, 
  Action, 
  ActionType, 
  ModifyNodeProps,
  ModifyLightProps,
  ModifyRenderProps,
  ModifyCameraProps
} from '../types.ts';
import { defaultPathMatcher } from '../utils/path-matcher.ts';
import { ModifyLight } from './ModifyLight.tsx';
import { ModifyRender } from './ModifyRender.tsx';
import { ModifyCamera } from './ModifyCamera.tsx';

let ruleIdCounter = 0;

/**
 * ModifyNode component for defining entity modification rules
 * Must be a direct child of <Gltf>
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
  const { registerRule, unregisterRule } = useGltf();
  
  const ruleId = useMemo(() => `rule-${ruleIdCounter++}`, []);
  
  const rule = useMemo<Rule>(() => {
    const actions: Action[] = [];
    const addChildren: ReactNode[] = [];

    // Process children to separate Modify.* components from additions
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const type = child.type as { displayName?: string; name?: string };
        const displayName = type?.displayName || type?.name;
        
        // Check for Modify.Light, Modify.Render, Modify.Camera
        if (displayName === 'ModifyLight') {
          const componentAction = createComponentAction('light', child.props as ModifyLightProps, ruleId);
          if (componentAction) actions.push(componentAction);
        } else if (displayName === 'ModifyRender') {
          const componentAction = createComponentAction('render', child.props as ModifyRenderProps, ruleId);
          if (componentAction) actions.push(componentAction);
        } else if (displayName === 'ModifyCamera') {
          const componentAction = createComponentAction('camera', child.props as ModifyCameraProps, ruleId);
          if (componentAction) actions.push(componentAction);
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
 * Creates a component modification action from component props
 */
function createComponentAction(
  componentType: string,
  props: ModifyLightProps | ModifyRenderProps | ModifyCameraProps,
  ruleId: string
): Action | null {
  const { remove, ...mergeProps } = props;
  
  const baseAction = {
    ruleId,
    componentType,
    specificity: 0 // Will be set by parent rule
  };

  // Create modify action with all props (remove will be handled in RuleProcessor)
  return {
    ...baseAction,
    type: ActionType.MODIFY_COMPONENT,
    props: { remove, ...mergeProps }
  };
}

/**
 * Modify compound component
 * Provides Modify.Node, Modify.Light, Modify.Render, and Modify.Camera
 */
export const Modify = {
  Node: ModifyNode,
  Light: ModifyLight,
  Render: ModifyRender,
  Camera: ModifyCamera
};

