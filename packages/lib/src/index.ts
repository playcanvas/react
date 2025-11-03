"use client";

export { Application, ApplicationWithoutCanvas } from './Application.tsx';
export { Container } from './Container.tsx';
export { Entity } from './Entity.tsx';

// GLTF Scene Modification API
export { 
  GltfScene, 
  Gltf, 
  Modify,
  useGltfScene,
  useEntity,
  PathMatcher,
  defaultPathMatcher
} from './gltf-scene/index.ts';
export type {
  GltfSceneProps,
  Rule,
  Action,
  MergedRule,
  ModifyNodeProps,
  ModifyComponentProps,
  GltfSceneContextValue,
  PathPredicate,
  EntityMetadata
} from './gltf-scene/index.ts';