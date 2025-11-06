"use client";

import { Entity } from 'playcanvas';
import { useMemo } from 'react';
import { useParent } from '../../hooks/use-parent.tsx';
import { useGltf } from './use-gltf.tsx';
import { PathPredicate, EntityMetadata } from '../utils/path-matcher.ts';

/**
 * Hook to find entities by path relative to the current parent context
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
 * ```
 */
export function useEntity(
  path: string | PathPredicate
): Entity | Entity[] | null {
  const parentEntity = useParent();
  const { hierarchyCache } = useGltf();

  return useMemo(() => {
    // If path is a predicate function
    if (typeof path === 'function') {
      return findEntitiesByPredicate(parentEntity, path, hierarchyCache);
    }

    // If path is a string, use relative tree traversal
    const segments = path.split('.');
    return findByPathSegments(parentEntity, segments);
  }, [path, parentEntity, hierarchyCache]);
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
 * Helper to find entities by path segments using relative tree traversal
 * Much more efficient than global cache search - only searches relevant subtree
 */
function findByPathSegments(
  entity: Entity,
  pathSegments: string[]
): Entity | Entity[] | null {
  if (!entity || pathSegments.length === 0) return null;

  const currentSegment = pathSegments[0];
  const remainingSegments = pathSegments.slice(1);

  // Handle single-level wildcard (*)
  if (currentSegment === '*') {
    const matches: Entity[] = [];
    for (const child of entity.children) {
      if (remainingSegments.length === 0) {
        // Matched the last '*' - add this child
        matches.push(child as Entity);
      } else {
        // Continue searching deeper
        const result = findByPathSegments(child as Entity, remainingSegments);
        if (result) {
          if (Array.isArray(result)) {
            matches.push(...result);
          } else {
            matches.push(result);
          }
        }
      }
    }
    return matches.length > 0 ? matches : null;
  }

  // Handle multi-level wildcard (**)
  if (currentSegment === '**') {
    const matches: Entity[] = [];
    
    // ** matches zero or more levels
    if (remainingSegments.length === 0) {
      // ** at end matches all descendants
      function collectAll(e: Entity) {
        matches.push(e);
        for (const child of e.children) {
          collectAll(child as Entity);
        }
      }
      for (const child of entity.children) {
        collectAll(child as Entity);
      }
    } else {
      // ** in middle - try matching at current level and all descendant levels
      function searchDeep(e: Entity) {
        const result = findByPathSegments(e, remainingSegments);
        if (result) {
          if (Array.isArray(result)) {
            matches.push(...result);
          } else {
            matches.push(result);
          }
        }
        for (const child of e.children) {
          searchDeep(child as Entity);
        }
      }
      
      // Try matching from current level
      const currentResult = findByPathSegments(entity, remainingSegments);
      if (currentResult) {
        if (Array.isArray(currentResult)) {
          matches.push(...currentResult);
        } else {
          matches.push(currentResult);
        }
      }
      
      // Search all descendants
      for (const child of entity.children) {
        searchDeep(child as Entity);
      }
    }
    
    return matches.length > 0 ? matches : null;
  }

  // Handle exact segment match
  const childEntity = entity.findByName(currentSegment) as Entity | null;
  if (!childEntity) return null;

  if (remainingSegments.length === 0) {
    return childEntity; // Found the entity
  }

  // Recurse deeper
  return findByPathSegments(childEntity, remainingSegments);
}

