"use client";

import { useContext } from 'react';
import { GltfContext } from '../context.tsx';
import { GltfContextValue } from '../types.ts';

/**
 * Hook to access the Gltf context
 * Provides access to the hierarchy cache and utilities
 * 
 * @returns The Gltf context value
 * @throws Error if used outside of a Gltf component
 * 
 * @example
 * ```tsx
 * const { hierarchyCache, rootEntity } = useGltf();
 * ```
 */
export function useGltf(): GltfContextValue {
  const context = useContext(GltfContext);
  
  if (!context) {
    throw new Error('useGltf must be used within a <Gltf> component');
  }
  
  return context;
}

