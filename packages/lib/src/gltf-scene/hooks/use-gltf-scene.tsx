"use client";

import { useContext } from 'react';
import { GltfSceneContext } from '../context.tsx';
import { GltfSceneContextValue } from '../types.ts';

/**
 * Hook to access the GltfScene context
 * Provides access to the hierarchy cache and utilities
 * 
 * @returns The GltfScene context value
 * @throws Error if used outside of a GltfScene component
 * 
 * @example
 * ```tsx
 * const { hierarchyCache, rootEntity } = useGltfScene();
 * ```
 */
export function useGltfScene(): GltfSceneContextValue {
  const context = useContext(GltfSceneContext);
  
  if (!context) {
    throw new Error('useGltfScene must be used within a <GltfScene> component');
  }
  
  return context;
}

