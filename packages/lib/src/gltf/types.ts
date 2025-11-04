import { Entity } from 'playcanvas';
import { ReactNode, ComponentProps } from 'react';
import { PathPredicate, EntityMetadata, PathMatcher } from './utils/path-matcher.ts';
import type { Light } from '../components/Light.tsx';
import type { Render } from '../components/Render.tsx';
import type { Camera } from '../components/Camera.tsx';

/**
 * Action types for entity modifications
 */
export enum ActionType {
  ADD_CHILDREN = 'add_children',
  CLEAR_CHILDREN = 'clear_children',
  MODIFY_COMPONENT = 'modify_component'
}

/**
 * Base action interface
 */
export interface BaseAction {
  type: ActionType;
  ruleId: string;
  specificity: number;
}

/**
 * Action to add children to an entity
 */
export interface AddChildrenAction extends BaseAction {
  type: ActionType.ADD_CHILDREN;
  children: ReactNode[];
}

/**
 * Action to clear all children from an entity
 */
export interface ClearChildrenAction extends BaseAction {
  type: ActionType.CLEAR_CHILDREN;
}

/**
 * Action to modify an existing component with prop merging
 */
export interface ModifyComponentAction extends BaseAction {
  type: ActionType.MODIFY_COMPONENT;
  componentType: string;
  props: Record<string, unknown>;
}

/**
 * Union type for all actions
 */
export type Action =
  | AddChildrenAction
  | ClearChildrenAction
  | ModifyComponentAction;

/**
 * Rule definition from Modify.Node
 */
export interface Rule {
  id: string;
  path: string | PathPredicate;
  actions: Action[];
  specificity: number;
}

/**
 * Merged rule after conflict resolution
 */
export interface MergedRule {
  entityGuid: string;
  clearChildren: boolean;
  componentActions: Map<string, Action>; // componentType -> winning action
  addChildren: ReactNode[];
}

/**
 * Context provided by Gltf
 */
export interface GltfContextValue {
  hierarchyCache: Map<string, EntityMetadata>;
  rootEntity: Entity | null;
  pathMatcher: PathMatcher;
  registerRule: (rule: Rule) => void;
  unregisterRule: (ruleId: string) => void;
}

/**
 * Helper type to allow both values and functional updates
 */
type PropOrUpdater<T> = T | ((current: T | undefined) => T);

/**
 * Helper to make all props accept either values or updater functions
 */
type WithUpdaters<T> = {
  [K in keyof T]?: PropOrUpdater<T[K]>;
};

/**
 * Props for Modify.Light component
 */
export interface ModifyLightProps extends Partial<WithUpdaters<ComponentProps<typeof Light>>> {
  remove?: boolean;
}

/**
 * Props for Modify.Render component
 */
export interface ModifyRenderProps extends Partial<WithUpdaters<ComponentProps<typeof Render>>> {
  remove?: boolean;
}

/**
 * Props for Modify.Camera component
 */
export interface ModifyCameraProps extends Partial<WithUpdaters<ComponentProps<typeof Camera>>> {
  remove?: boolean;
}

/**
 * Props for node modification
 */
export interface ModifyNodeProps {
  path: string | PathPredicate;
  clearChildren?: boolean;
  children?: ReactNode;
}

