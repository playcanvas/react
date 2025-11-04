"use client";

// Components
export { Gltf } from './components/Gltf.tsx';
export type { GltfProps } from './components/Gltf.tsx';
export { Modify } from './components/Modify.tsx';

// Hooks
export { useGltf } from './hooks/use-gltf.tsx';
export { useEntity } from './hooks/use-entity.ts';

// Types
export type {
  Rule,
  Action,
  MergedRule,
  ModifyNodeProps,
  ModifyLightProps,
  ModifyRenderProps,
  ModifyCameraProps,
  GltfContextValue
} from './types';

// Utilities
export { PathMatcher, defaultPathMatcher } from './utils/path-matcher.ts';
export type { PathPredicate, EntityMetadata } from './utils/path-matcher.ts';

