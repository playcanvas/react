"use client";

import React, { useState, useEffect, useMemo, useCallback, ReactNode, useRef } from 'react';
import { Asset, Entity } from 'playcanvas';
import { GltfContext } from '../context.tsx';
import { Rule, MergedRule, ActionType, ModifyComponentAction } from '../types.ts';
import { EntityMetadata, PathMatcher } from '../utils/path-matcher.ts';
import { RuleProcessor } from './RuleProcessor.tsx';
import { useParent } from '../../hooks/use-parent.tsx';

export interface GltfProps {
  /**
   * The GLTF asset loaded via useModel
   */
  asset: Asset;
  
  /**
   * Whether to render the GLTF scene visuals
   * @default true
   */
  render?: boolean;
  
  /**
   * Children should contain <Modify.Node> components
   */
  children?: ReactNode;
}

/**
 * Root component for GLTF scene modification system
 * 
 * Provides:
 * - Lazy instantiation of GLTF assets
 * - Hierarchy cache for entity lookups
 * - Rule collection and conflict resolution
 * - Batched modification application
 * - Optional rendering of GLTF visuals
 * 
 * @example
 * ```tsx
 * const { asset } = useModel('model.glb');
 * 
 * return (
 *   <Gltf asset={asset} key={asset.id}>
 *     <Modify.Node path="head.*[light]">
 *       <Modify.Component type="light" remove />
 *     </Modify.Node>
 *   </Gltf>
 * );
 * ```
 * 
 * @example
 * ```tsx
 * // Don't render visuals, only process modifications
 * <Gltf asset={asset} key={asset.id} render={false}>
 *   <Modify.Node path="**[light]">
 *     <Modify.Component type="light" remove />
 *   </Modify.Node>
 * </Gltf>
 * ```
 */
export const Gltf: React.FC<GltfProps> = ({ asset, render = true, children }) => {
  const parent = useParent();
  const [rootEntity, setRootEntity] = useState<Entity | null>(null);
  const [hierarchyCache, setHierarchyCache] = useState<Map<string, EntityMetadata>>(new Map());
  const rulesRef = useRef<Map<string, Rule>>(new Map());
  const [mergedRules, setMergedRules] = useState<Map<string, MergedRule>>(new Map());
  const pathMatcher = useMemo(() => new PathMatcher(), []);
  const [rulesVersion, setRulesVersion] = useState(0);
  
  // Check if we need to instantiate (render is true OR has Modify.Node children)
  const shouldInstantiate = useMemo(() => {
    // Always instantiate if render is true
    if (render) return true;
    
    // Otherwise, check for Modify.Node children
    if (!children) return false;
    
    const childArray = React.Children.toArray(children);
    return childArray.some((child) => {
      if (React.isValidElement(child)) {
        const type = child.type as { displayName?: string; name?: string };
        const displayName = type?.displayName || type?.name;
        return displayName === 'ModifyNode';
      }
      return false;
    });
  }, [render, children]);

  // Instantiate asset and build hierarchy cache
  useEffect(() => {
    if (!asset || !asset.resource || !shouldInstantiate || !parent) {
      return;
    }

    // Instantiate the render entity
    if (
      !asset.resource ||
      typeof (asset.resource as any).instantiateRenderEntity !== 'function'
    ) {
      console.error('Asset resource does not have instantiateRenderEntity method');
      return;
    }
    const entity = (asset.resource as { instantiateRenderEntity: () => Entity }).instantiateRenderEntity();
    
    if (!entity) {
      console.error('Failed to instantiate GLTF asset');
      return;
    }

    // Build hierarchy cache
    const cache = new Map<string, EntityMetadata>();
    buildHierarchyCache(entity, '', cache);
    
    setRootEntity(entity);
    setHierarchyCache(cache);

    // Cleanup
    return () => {
      entity.destroy();
      setRootEntity(null);
      setHierarchyCache(new Map());
    };
  }, [asset, shouldInstantiate, parent]);

  // Process rules and resolve conflicts
  const processRules = useCallback(() => {
    if (!rootEntity || hierarchyCache.size === 0) {
      setMergedRules(new Map());
      return;
    }

    const merged = new Map<string, MergedRule>();
    
    // For each entity in the hierarchy
    for (const [guid, metadata] of hierarchyCache.entries()) {
      const matchingRules: Rule[] = [];
      
      // Find all rules that match this entity
      for (const rule of rulesRef.current.values()) {
        if (pathMatcher.matches(rule.path, metadata)) {
          matchingRules.push(rule);
        }
      }

      // If no rules match, skip
      if (matchingRules.length === 0) {
        continue;
      }

      // Merge and resolve conflicts
      const mergedRule = mergeRules(guid, matchingRules);
      merged.set(guid, mergedRule);
    }

    setMergedRules(merged);
  }, [rootEntity, hierarchyCache, pathMatcher]);

  // Rule registration callbacks
  const registerRule = useCallback((rule: Rule) => {
    rulesRef.current.set(rule.id, rule);
    // "Poke" the component to re-process rules
    setRulesVersion(v => v + 1);
  }, []);

  const unregisterRule = useCallback((ruleId: string) => {
    rulesRef.current.delete(ruleId);
    // "Poke" the component to re-process rules
    setRulesVersion(v => v + 1);
  }, []);

  // Re-process rules when dependencies change
  useEffect(() => {
    // This effect now runs ONLY when the cache is ready
    // or when the rules have *actually* changed.
    processRules();
  }, [processRules, hierarchyCache, rulesVersion]);

  // Add root entity to parent scene (merged from Gltf component)
  useEffect(() => {
    if (!rootEntity || !parent || !render) {
      return;
    }

    parent.addChild(rootEntity);
    
    return () => {
      // Only remove if still a child (Gltf's cleanup will destroy it)
      if (rootEntity.parent === parent) {
        parent.removeChild(rootEntity);
      }
    };
  }, [rootEntity, parent, render]);

  // Context value
  const contextValue = useMemo(() => ({
    hierarchyCache,
    rootEntity,
    pathMatcher,
    registerRule,
    unregisterRule,
  }), [hierarchyCache, rootEntity, pathMatcher, registerRule, unregisterRule]);

  // Don't render anything if not instantiated
  if (!rootEntity) {
    return null;
  }

  return (
    <GltfContext.Provider value={contextValue}>
      {/* Render children (includes Gltf and Modify.Node components) */}
      {children}
      
      {/* Render rule processors */}
      {Array.from(mergedRules.entries()).map(([guid, rule]) => {
        const metadata = hierarchyCache.get(guid);
        if (!metadata) return null;
        
        return (
          <RuleProcessor
            key={guid}
            entity={metadata.entity}
            rule={rule}
            originalChildGUIDs={metadata.originalChildGUIDs ?? []}
          />
        );
      })}
    </GltfContext.Provider>
  );
};

/**
 * Builds a hierarchy cache by traversing the entity tree
 */
function buildHierarchyCache(
  entity: Entity,
  parentPath: string,
  cache: Map<string, EntityMetadata>
): void {
  const path = parentPath ? `${parentPath}.${entity.name}` : entity.name;
  const guid = entity.getGuid();

  const originalChildGUIDs = entity.children.map((child) => (child as Entity).getGuid());
  
  cache.set(guid, {
    entity,
    path,
    guid,
    name: entity.name,
    originalChildGUIDs
  });

  // Recursively process children
  for (const child of entity.children) {
    buildHierarchyCache(child as Entity, path, cache);
  }
}

/**
 * Merges multiple rules for the same entity and resolves conflicts
 */
function mergeRules(entityGuid: string, rules: Rule[]): MergedRule {
  const merged: MergedRule = {
    entityGuid,
    clearChildren: false,
    componentActions: new Map(),
    addChildren: []
  };

  // Sort rules by specificity (highest first)
  const sortedRules = [...rules].sort((a, b) => b.specificity - a.specificity);

  // Process each rule
  for (const rule of sortedRules) {
    for (const action of rule.actions) {
      switch (action.type) {
        case ActionType.CLEAR_CHILDREN:
          // First rule with clearChildren wins
          if (!merged.clearChildren) {
            merged.clearChildren = true;
          }
          break;

        case ActionType.ADD_CHILDREN: {
          // Collect all additions
          const addAction = action as { children: ReactNode[] };
          merged.addChildren.push(...addAction.children);
          break;
        }

        case ActionType.MODIFY_COMPONENT: {
          // For component actions, highest specificity wins per component type
          const componentAction = action as ModifyComponentAction;
          if (!merged.componentActions.has(componentAction.componentType)) {
            merged.componentActions.set(componentAction.componentType, action);
          }
          break;
        }
      }
    }
  }

  return merged;
}

Gltf.displayName = 'Gltf';

