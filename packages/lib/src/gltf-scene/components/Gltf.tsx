"use client";

import React from 'react';

/**
 * @deprecated This component is no longer needed. GltfScene now renders by default.
 * 
 * Simply remove `<Gltf />` from your code:
 * 
 * Before:
 * ```tsx
 * <GltfScene asset={asset}>
 *   <Gltf />
 *   <Modify.Node path="...">...</Modify.Node>
 * </GltfScene>
 * ```
 * 
 * After:
 * ```tsx
 * <GltfScene asset={asset}>
 *   <Modify.Node path="...">...</Modify.Node>
 * </GltfScene>
 * ```
 * 
 * If you want to disable rendering, use `render={false}`:
 * ```tsx
 * <GltfScene asset={asset} render={false}>
 *   <Modify.Node path="...">...</Modify.Node>
 * </GltfScene>
 * ```
 */
export const Gltf: React.FC = () => {
  // This component is now a no-op - GltfScene handles rendering
  return null;
};

Gltf.displayName = 'Gltf';

