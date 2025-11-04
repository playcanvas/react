"use client";

export { Application, ApplicationWithoutCanvas } from './Application.tsx';
export { Container } from './Container.tsx';
export { Entity } from './Entity.tsx';

// GLTF Scene Modification API
export { 
  Gltf, 
  Modify,
  useGltf,
  useEntity,
  PathMatcher,
  defaultPathMatcher
} from './gltf/index.ts';
export type {
  GltfProps,
  Rule,
  Action,
  MergedRule,
  ModifyNodeProps,
  ModifyLightProps,
  ModifyRenderProps,
  ModifyCameraProps,
  GltfContextValue,
  PathPredicate,
  EntityMetadata
} from './gltf/index.ts';