"use client";

import { Entity } from 'playcanvas';
import { useMemo } from 'react';
import { useParent } from '../../hooks/use-parent.tsx';
import { useGltf } from './use-gltf.tsx';
import { PathPredicate, EntityMetadata, PathMatcher } from '../utils/path-matcher.ts';

/**
 * Hook to find entities by path relative to the current parent context
 * Uses PathMatcher for consistent path matching with Modify.Node
 * 
 * @param path - String path or predicate function to match entities
 * @returns The matched entity, array of entities (for wildcards), or null if not found
 * 
 * @example
 * ```tsx
 * // Find by path
 * const handEntity = useEntity('arm.hand');
 * 
 * // Find by predicate
 * const lightsEntity = useEntity((entity) => entity.c?.light !== undefined);
 * 
 * // Find with wildcard
 * const allChildren = useEntity('*');
 * 
 * // Find with component filter
 * const lights = useEntity('*[light]');
 * ```
 */
export function useEntity(
  path: string | PathPredicate
): Entity | Entity[] | null {
  const parentEntity = useParent();
  const { hierarchyCache, pathMatcher } = useGltf();

  return useMemo(() => {
    // If path is a predicate function
    if (typeof path === 'function') {
      return findEntitiesByPredicate(parentEntity, path, hierarchyCache);
    }

    // Use PathMatcher for string paths - ensures consistency with Modify.Node
    return findEntitiesByPattern(parentEntity, path, pathMatcher);
  }, [path, parentEntity, hierarchyCache, pathMatcher]);
}

/**
 * Helper to find entities by predicate function
 * Uses O(1) Map lookup instead of O(N) iteration
 */
function findEntitiesByPredicate(
  root: Entity,
  predicate: PathPredicate,
  hierarchyCache: Map<string, EntityMetadata>
): Entity[] | null {
  const matches: Entity[] = [];

  function traverse(entity: Entity) {
    // O(1) lookup using GUID as Map key
    const metadata = hierarchyCache.get(entity.getGuid());
    if (metadata && predicate(entity, metadata)) {
      matches.push(entity);
    }

    // Traverse children
    for (const child of entity.children) {
      traverse(child as Entity);
    }
  }

  traverse(root);
  return matches.length > 0 ? matches : null;
}

/**
 * Helper to find entities by pattern using PathMatcher
 * Traverses the subtree relative to parent and builds relative paths
 * Uses PathMatcher.match() to check if pattern matches relative path
 */
function findEntitiesByPattern(
  rootEntity: Entity,
  pattern: string,
  pathMatcher: PathMatcher
): Entity | Entity[] | null {
  if (!rootEntity) return null;

  const matches: Entity[] = [];
  
  // Build relative paths as we traverse the subtree
  // Relative path is empty for root, "Child" for direct children, "Child.Grandchild" for nested, etc.
  function traverse(entity: Entity, relativePath: string) {
    // Check if this entity matches the pattern using PathMatcher
    // PathMatcher.match() handles component filters, wildcards, etc.
    // For root entity, relativePath is empty string, so pattern "" would match it
    // For children, relativePath is like "Body" or "Body.Head"
    if (pathMatcher.match(pattern, relativePath, entity)) {
      matches.push(entity);
    }

    // Traverse children, building relative paths
    for (const child of entity.children) {
      const childEntity = child as Entity;
      const childName = childEntity.name;
      // Build relative path: empty for root's children, "Parent.Child" for nested
      const childRelativePath = relativePath ? `${relativePath}.${childName}` : childName;
      traverse(childEntity, childRelativePath);
    }
  }

  // Start traversal from root entity with empty relative path
  // This means patterns like "Body" will match direct children, "Body.Head" will match nested
  traverse(rootEntity, '');

  // Return single entity if one match, array if multiple, null if none
  // For wildcard patterns (* or **), always return array even if single match
  const hasWildcards = pattern.includes('*');
  
  if (matches.length === 0) {
    return null;
  } else if (matches.length === 1 && !hasWildcards) {
    // Exact path with single match - return single entity
    return matches[0];
  } else {
    // Multiple matches or wildcard pattern - return array
    return matches;
  }
}

