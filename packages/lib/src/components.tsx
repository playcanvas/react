import React, { PropsWithChildren } from 'react';

type Vector3 = { x: number; y: number; z: number };

/** Common props for an Entity */
export interface EntityProps {
  name?: string;
  position?: Vector3;
  rotation?: Vector3;
}

/** RigidBody component props (example) */
export interface RigidBodyProps {
  type?: 'static' | 'dynamic' | 'kinematic';
  mass?: number;
  friction?: number;
  restitution?: number;
  // ... etc
}

/** Model component props (example) */
export interface ModelProps {
  type?: string;  // 'box', 'sphere', etc.
  materialAsset?: number; // an ID for the material asset
  castShadows?: boolean;
  receiveShadows?: boolean;
  // ... etc
}

/** Camera component props (example) */
export interface CameraProps {
  clearColor?: { r: number; g: number; b: number; a: number };
  fov?: number;
  // ... etc
}

/** Light component props (example) */
export interface LightProps {
  type?: 'directional' | 'point' | 'spot';
  color?: { r: number; g: number; b: number };
  intensity?: number;
  // ... etc
}

/** For full coverage, define similarly for each PlayCanvas component:
 *  - Animation
 *  - AudioListener
 *  - Button
 *  - Collision
 *  - Element
 *  - LayoutChild
 *  - LayoutGroup
 *  - Model
 *  - ParticleSystem
 *  - RigidBody
 *  - Screen
 *  - Script
 *  - ScrollView
 *  - Sound
 *  - SoundSlot
 *  - Zone
 *  ... or at least the ones you need
 */

/****************************************************************
 *  React Elements
 *  We use TS generics so each component gets typed props
 ****************************************************************/

export const Entity: React.FC<PropsWithChildren<EntityProps>> = (props: EntityProps) => {
  return React.createElement('entity', props);
};

export const Model: React.FC<ModelProps> = (props: ModelProps) => {
  return React.createElement('model', props);
};

export const Camera: React.FC<CameraProps> = (props: CameraProps) => {
  return React.createElement('camera', props);
};

export const Light: React.FC<LightProps> = (props: LightProps) => {
  return React.createElement('light', props);
};

export const RigidBody: React.FC<RigidBodyProps> = (props: RigidBodyProps) => {
  return React.createElement('rigidbody', props);
};

/** You'd continue with all other possible components:
 *   - <Collision />
 *   - <Element />
 *   - <Animation />
 *   - <ParticleSystem />
 *   ... etc
 */