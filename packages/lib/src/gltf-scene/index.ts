"use client";

// Components
export { GltfScene } from './components/GltfScene.tsx';
export type { GltfSceneProps } from './components/GltfScene.tsx';
export { Gltf } from './components/Gltf.tsx';
export { Modify } from './components/Modify.tsx';

// Hooks
export { useGltfScene } from './hooks/use-gltf-scene.ts';
export { useEntity } from './hooks/use-entity.ts';

// Types
export type {
  Rule,
  Action,
  MergedRule,
  ModifyNodeProps,
  ModifyComponentProps,
  GltfSceneContextValue
} from './types';

// Utilities
export { PathMatcher, defaultPathMatcher } from './utils/path-matcher.ts';
export type { PathPredicate, EntityMetadata } from './utils/path-matcher.ts';

