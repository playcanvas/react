import { Entity } from 'playcanvas';
import { ReactElement, ReactNode } from 'react';
import { PathPredicate, EntityMetadata, PathMatcher } from './utils/path-matcher.ts';
import type { Light } from '../components/Light.tsx';
import type { Render } from '../components/Render.tsx';
import type { Camera } from '../components/Camera.tsx';
import type { Collision } from '../components/Collision.tsx';
import type { RigidBody } from '../components/RigidBody.tsx';
import type { Anim } from '../components/Anim.tsx';
import type { Script } from '../components/Script.tsx';
import type { GSplat } from '../components/GSplat.tsx';
import type { Sprite } from '../components/Sprite.tsx';
import type { Screen } from '../components/Screen.tsx';
import type { Element } from '../components/Element.tsx';

/**
 * Map of component type names to their React components
 */
export type ComponentTypeMap = {
  light: typeof Light;
  render: typeof Render;
  camera: typeof Camera;
  collision: typeof Collision;
  rigidbody: typeof RigidBody;
  anim: typeof Anim;
  script: typeof Script;
  gsplat: typeof GSplat;
  sprite: typeof Sprite;
  screen: typeof Screen;
  element: typeof Element;
};

/**
 * Action types for entity modifications
 */
export enum ActionType {
  ADD_CHILDREN = 'add_children',
  CLEAR_CHILDREN = 'clear_children',
  MODIFY_COMPONENT = 'modify_component',
  REMOVE_COMPONENT = 'remove_component',
  REPLACE_COMPONENT = 'replace_component'
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
 * Action to modify an existing component
 */
export interface ModifyComponentAction extends BaseAction {
  type: ActionType.MODIFY_COMPONENT;
  componentType: string;
  renderProp: (props: Record<string, unknown>) => ReactElement;
}

/**
 * Action to remove a component
 */
export interface RemoveComponentAction extends BaseAction {
  type: ActionType.REMOVE_COMPONENT;
  componentType: string;
}

/**
 * Action to replace a component
 */
export interface ReplaceComponentAction extends BaseAction {
  type: ActionType.REPLACE_COMPONENT;
  componentType: string;
  replacement: ReactElement;
}

/**
 * Union type for all actions
 */
export type Action =
  | AddChildrenAction
  | ClearChildrenAction
  | ModifyComponentAction
  | RemoveComponentAction
  | ReplaceComponentAction;

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
 * Context provided by GltfScene
 */
export interface GltfSceneContextValue {
  hierarchyCache: Map<string, EntityMetadata>;
  rootEntity: Entity | null;
  pathMatcher: PathMatcher;
  registerRule: (rule: Rule) => void;
  unregisterRule: (ruleId: string) => void;
}

/**
 * Props for component modification (Generic version)
 * 
 * The render prop function receives serialized component properties where:
 * - PlayCanvas objects (Color, Vec3, etc.) are converted to arrays via toArray()
 * - Asset references are converted to asset IDs
 * - Primitives (string, number, boolean) are passed as-is
 * 
 * @example
 * ```tsx
 * <Modify.Component type="light">
 *   {(props) => <Light {...props} color="red" />}
 * </Modify.Component>
 * 
 * <Modify.Component type="render">
 *   {(props) => <Render {...props} castShadows />}
 * </Modify.Component>
 * ```
 */
export interface ModifyComponentProps<T extends keyof ComponentTypeMap = keyof ComponentTypeMap> {
  type: T;
  remove?: boolean;
  // Use ComponentProps to get actual component prop types
  // Note: type is widened due to serialization, but spread provides safety
  children?: ReactNode | ((props: Record<string, unknown>) => ReactElement);
}

/**
 * Props for node modification
 */
export interface ModifyNodeProps {
  path: string | PathPredicate;
  clearChildren?: boolean;
  children?: ReactNode;
}

