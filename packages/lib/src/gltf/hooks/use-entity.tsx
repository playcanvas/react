"use client";

import { Entity } from 'playcanvas';
import { useMemo } from 'react';
import { useParent } from '../../hooks/use-parent.tsx';
import { useGltf } from './use-gltf.tsx';
import { PathPredicate, EntityMetadata, PathMatcher } from '../utils/path-matcher.ts';

/**
 * Hook to find entities by path relative to the current parent context
 * Uses the unified PathMatcher for consistent syntax with Modify.Node
 * * @param path - String path or predicate function to match entities
 * @returns The matched entity, array of entities (for wildcards), or null if not found
 * * @example
 * ```tsx
 * // Find by path
 * const handEntity = useEntity('arm.hand');
 * * // Find by predicate
 * const lightsEntity = useEntity((entity) => entity.c?.light !== undefined);
 * * // Find with wildcard
 * const allChildren = useEntity('*');
 * * // Find with component filter
 * const lights = useEntity('**[light]');
 * ```
 */
export function useEntity(
  path: string | PathPredicate
): Entity | Entity[] | null {
  const parentEntity = useParent();
  const { hierarchyCache, pathMatcher } = useGltf();

  return useMemo(() => {
    if (!parentEntity) {
      return null;
    }
    
    let matches: Entity[] = [];

    // If path is a predicate function, use the (fast) predicate helper
    if (typeof path === 'function') {
      matches = findEntitiesByPredicate(parentEntity, path, hierarchyCache);
    
    // If path is a string, use the (powerful) pattern helper
    } else {
      // Guard against empty string path
      if (path === '') return null;
      matches = findEntitiesByPattern(parentEntity, path, pathMatcher);
    }
    
    // --- Return logic ---
    // For wildcard/predicate, always return array or null
    const hasWildcards = typeof path === 'function' || (typeof path === 'string' && (path.includes('*') || path.includes('[')));
    
    if (matches.length === 0) {
      return null;
    }
    if (matches.length === 1 && !hasWildcards) {
      // Exact path with single match
      return matches[0];
    }
    // Multiple matches or wildcard/predicate
    return matches;
    
  }, [path, parentEntity, hierarchyCache, pathMatcher]);
}

/**
 * Helper to find entities by predicate function (relative)
 * Traverses descendants of root and checks predicate
 */
function findEntitiesByPredicate(
  root: Entity,
  predicate: PathPredicate,
  hierarchyCache: Map<string, EntityMetadata>
): Entity[] {
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

  // Start traversal from the children, not the root itself
  for (const child of root.children) {
    traverse(child as Entity);
  }
  return matches;
}

/**
 * Helper to find entities by string pattern (relative)
 * Uses the powerful PathMatcher for consistent syntax
 */
function findEntitiesByPattern(
  rootEntity: Entity,
  pattern: string,
  pathMatcher: PathMatcher
): Entity[] {
  const matches: Entity[] = [];
  
  /**
   * Recursive traversal that builds relative paths
   * @param entity The entity to check
   * @param relativePath The path relative to rootEntity
   */
  function traverse(entity: Entity, relativePath: string) {
    // Check if *this* entity matches the pattern
    if (pathMatcher.match(pattern, relativePath, entity)) {
      matches.push(entity);
    }

    // Traverse children, building the next relative path
    for (const child of entity.children) {
      const childEntity = child as Entity;
      const childName = childEntity.name;
      const childRelativePath = relativePath ? `${relativePath}.${childName}` : childName;
      traverse(childEntity, childRelativePath);
    }
  }

  // This is the key: start the traversal from the *children*
  // of the rootEntity. This makes all paths relative.
  // 'useEntity("Head")' (from 'Body') will build a relativePath of 'Head'
  // and match it against the pattern 'Head'.
  for (const child of rootEntity.children) {
    traverse(child as Entity, child.name);
  }

  return matches;
}