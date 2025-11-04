/**
 * Examples demonstrating the GLTF Declarative Modification API
 * 
 * This file contains various usage examples showing how to use the
 * Gltf, Gltf, and Modify components to declaratively modify
 * loaded GLTF assets.
 */

import { Gltf, Modify, useEntity } from './index.ts';
import { useModel } from '../hooks/use-asset.ts';
import { Light } from '../components/Light.tsx';
import { Render } from '../components/Render.tsx';
import { Entity } from '../Entity.tsx';

/**
 * Example 1: Basic Usage - Render GLTF with default visuals
 */
export function Example1_BasicUsage() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id} />
  );
}

/**
 * Example 2: Remove Components - Remove all lights from the scene
 */
export function Example2_RemoveComponents() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      <Modify.Node path="[light]">
        <Modify.Light remove />
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 3: Modify Components - Change light properties with prop merging
 */
export function Example3_ModifyComponents() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      <Modify.Node path="[light]">
        <Modify.Light color="red" intensity={2} />
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 4: Functional Updates - Use functions to update based on existing values
 */
export function Example4_FunctionalUpdates() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      <Modify.Node path="[light]">
        <Modify.Light 
          intensity={(val: number | undefined) => (val || 1) * 2} 
          castShadows 
        />
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 5: Add Children - Add new entities to matched nodes
 */
export function Example5_AddChildren() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      <Modify.Node path="Head">
        <Entity name="HelmetLight" position={[0, 1, 0]}>
          <Light type="omni" color="yellow" intensity={3} />
        </Entity>
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 6: Clear Children - Remove all children and replace
 */
export function Example6_ClearChildren() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      <Modify.Node path="Head" clearChildren>
        <Entity name="NewHelmet">
          <Render type="box" />
        </Entity>
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 7: Wildcard Patterns - Modify all children with wildcards
 */
export function Example7_WildcardPatterns() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      {/* Single-level wildcard: matches direct children */}
      <Modify.Node path="Body.*">
        <Modify.Render castShadows={false} />
      </Modify.Node>
      
      {/* Multi-level wildcard: matches all descendants */}
      <Modify.Node path="Arm.**">
        <Entity name="Glow">
          <Light type="omni" color="green" />
        </Entity>
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 8: Combined Queries - Mix path and component filters
 */
export function Example8_CombinedQueries() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      {/* Match all lights under Head node */}
      <Modify.Node path="Head.*[light]">
        <Modify.Light color="orange" />
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 9: Predicate Functions - Use custom logic for matching
 */
export function Example9_PredicateFunctions() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      <Modify.Node 
        path={(entity) => {
          // Match entities with "weapon" in the name
          return entity.name.toLowerCase().includes('weapon');
        }}
      >
        <Modify.Render castShadows />
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 10: Multiple Rules - Apply multiple modifications
 */
export function Example10_MultipleRules() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      
      {/* Rule 1: Remove all existing lights */}
      <Modify.Node path="[light]">
        <Modify.Light remove />
      </Modify.Node>
      
      {/* Rule 2: Add new light to Head */}
      <Modify.Node path="Head">
        <Entity name="MainLight">
          <Light type="directional" color="white" intensity={1} />
        </Entity>
      </Modify.Node>
      
      {/* Rule 3: Modify all render components */}
      <Modify.Node path="**[render]">
        <Modify.Render receiveShadows />
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 11: Using useEntity Hook - Find entities within children
 */
function HandGlow() {
  // Find the hand entity relative to current parent
  const handEntity = useEntity('Hand');
  
  if (!handEntity) return null;
  
  return (
    <Entity name="HandGlow" position={[0, 0.1, 0]}>
      <Light type="omni" color="cyan" intensity={2} />
    </Entity>
  );
}

export function Example11_UseEntityHook() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      <Modify.Node path="Arm">
        <HandGlow />
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 12: Specificity and Conflict Resolution
 * More specific rules win over less specific ones
 */
export function Example12_Specificity() {
  const { asset } = useModel('model.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      
      {/* Less specific: matches all lights */}
      <Modify.Node path="[light]">
        <Modify.Light color="red" />
      </Modify.Node>
      
      {/* More specific: matches lights under Head - this wins! */}
      <Modify.Node path="Head.Helmet[light]">
        <Modify.Light color="blue" />
      </Modify.Node>
    </Gltf>
  );
}

/**
 * Example 13: Complex Scene Modification
 * Combines multiple techniques for a complete scene transformation
 */
export function Example13_ComplexModification() {
  const { asset } = useModel('robot.glb');
  
  if (!asset) return null;
  
  return (
    <Gltf asset={asset} key={asset.id}>
      
      {/* Remove all original lights */}
      <Modify.Node path="**[light]">
        <Modify.Light remove />
      </Modify.Node>
      
      {/* Make all renders cast shadows */}
      <Modify.Node path="**[render]">
        <Modify.Render castShadows receiveShadows />
      </Modify.Node>
      
      {/* Add lights to specific parts */}
      <Modify.Node path="Head">
        <Entity name="HeadLight" position={[0, 0.5, 0]}>
          <Light type="omni" color="#00ff00" intensity={3} range={5} />
        </Entity>
      </Modify.Node>
      
      <Modify.Node path="Body.Chest">
        <Entity name="ChestGlow" position={[0, 0, 0.2]}>
          <Light type="spot" color="#0088ff" intensity={2} />
        </Entity>
      </Modify.Node>
      
      {/* Clear and replace weapon attachments */}
      <Modify.Node path="Arm.Right.WeaponMount" clearChildren>
        <Entity name="NewWeapon" rotation={[0, 90, 0]}>
          <Render type="cylinder" />
          <Entity name="WeaponLight" position={[0, 0, 1]}>
            <Light type="spot" color="red" intensity={5} />
          </Entity>
        </Entity>
      </Modify.Node>
    </Gltf>
  );
}

