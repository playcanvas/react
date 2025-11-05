/**
 * Test Component Fixtures for GLTF Integration Tests
 * 
 * These components demonstrate various GLTF modification patterns and serve as
 * both test fixtures and documentation examples. They are extracted from
 * integration tests to make the tests cleaner and more maintainable.
 * 
 * Each component showcases a specific use case of the GLTF modification API,
 * making it easy to understand different patterns and test scenarios.
 */

import React from 'react';
import { Asset, Entity as PcEntity } from 'playcanvas';
import { Gltf } from '../../components/Gltf.tsx';
import { Modify } from '../../components/Modify.tsx';
import { Application } from '../../../Application.tsx';
import { Entity } from '../../../Entity.tsx';
import { Render } from '../../../components/Render.tsx';
import { AppContext } from '../../../hooks/index.ts';

/**
 * Basic Gltf component with rendering enabled.
 * 
 * This is the simplest use case - just render the GLTF asset with default visuals.
 * The asset will be instantiated and added to the scene when render is true.
 */
export const BasicGltf: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id} render={true} />
    </Application>
  );
};

/**
 * Gltf component with Modify.Node children (no rendering).
 * 
 * Demonstrates that the GLTF will instantiate even when render={false} if there
 * are Modify.Node children present. This allows you to modify the scene without
 * rendering visuals, useful for server-side processing or headless testing.
 */
export const GltfWithModifications: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id} render={false}>
        <Modify.Node path="**[light]">
          <Modify.Light remove />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Gltf component with no modifications (empty).
 * 
 * When both render={false} and no Modify.Node children are present, the GLTF
 * will not instantiate. This is useful for testing lazy instantiation behavior.
 */
export const EmptyGltf: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id} render={false} />
    </Application>
  );
};

/**
 * Remove component from exact path.
 * 
 * Removes a component from a specific entity matched by an exact path string.
 * The path must match the full hierarchy path (e.g., "RootNode.Body.Head").
 * This is useful for targeting specific entities in the scene graph.
 */
export const RemoveComponentFromPath: React.FC<{ asset: Asset; path: string }> = ({ asset, path }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Light remove />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Remove components from all matching entities using component filter.
 * 
 * Uses component filters (e.g., "[light]", "**[light]") to match all entities
 * that have a specific component type, regardless of their position in the hierarchy.
 * This is useful for bulk operations like removing all lights from a scene.
 */
export const RemoveAllComponentsByFilter: React.FC<{ asset: Asset; path: string }> = ({ asset, path }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Light remove />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Remove render components using single-level wildcard.
 * 
 * Uses the single-level wildcard (*) to match direct children at one level.
 * For example, "RootNode.Body.*" matches all direct children of Body (Head, LeftArm, RightArm)
 * but not grandchildren. This is useful for operations on sibling entities.
 */
export const RemoveRenderWithWildcard: React.FC<{ asset: Asset; path: string }> = ({ asset, path }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Render remove />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Remove components using multi-level wildcard.
 * 
 * Uses the multi-level wildcard (**) to match entities at any depth in the hierarchy.
 * For example, "Scene.**.Head" matches all "Head" entities anywhere under Scene,
 * regardless of how deeply nested they are. This is useful for finding entities
 * across complex hierarchies.
 */
export const RemoveWithMultiLevelWildcard: React.FC<{ asset: Asset; path: string }> = ({ asset, path }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Render remove />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Remove components using combined path and filter.
 * 
 * Combines path patterns with component filters for precise targeting.
 * For example, "LightingRig.MainLights.*[light]" matches all direct children
 * of MainLights that have a light component. This allows you to be very specific
 * about which entities to modify.
 */
export const RemoveWithCombinedPathAndFilter: React.FC<{ asset: Asset; path: string }> = ({ asset, path }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Light remove />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Add new entity as child to matched path.
 * 
 * Adds a new React Entity component as a child to all entities matching the path.
 * The new entity will be instantiated and added to the PlayCanvas scene hierarchy.
 * This is useful for dynamically adding props, lights, or other components to existing entities.
 */
export const AddChildEntity: React.FC<{
  asset: Asset;
  path: string;
  childName: string;
  childType?: 'box' | 'sphere' | 'cylinder';
}> = ({ asset, path, childName, childType = 'box' }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Entity name={childName}>
            <Render type={childType} />
          </Entity>
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Add multiple children to matched path.
 * 
 * Adds multiple new entities as children to all entities matching the path.
 * Each entity will be instantiated and added to the scene. This demonstrates
 * how to add multiple siblings to an existing entity in the hierarchy.
 */
export const AddMultipleChildren: React.FC<{
  asset: Asset;
  path: string;
  childNames: string[];
}> = ({ asset, path, childNames }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          {childNames.map(name => (
            <Entity key={name} name={name} />
          ))}
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Clear children and replace with new entity.
 * 
 * Uses the clearChildren prop to remove all existing children from matched entities,
 * then adds the new children specified in the Modify.Node. This is useful for
 * completely replacing a subtree of the hierarchy, such as replacing all weapon
 * attachments with new ones.
 */
export const ClearChildrenAndReplace: React.FC<{
  asset: Asset;
  path: string;
  newChildName: string;
}> = ({ asset, path, newChildName }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path} clearChildren>
          <Entity name={newChildName} />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Modify component with prop merge/overwrite.
 * 
 * Modifies an existing component by merging or overwriting its properties.
 * The props specified in Modify.Light will be applied to the existing light component,
 * preserving other properties. This is useful for adjusting component settings
 * without removing and recreating the component.
 */
export const ModifyComponent: React.FC<{
  asset: Asset;
  path: string;
  intensity?: number;
}> = ({ asset, path, intensity = 2 }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Light intensity={intensity} />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Modify component with multiple props.
 * 
 * Demonstrates modifying multiple properties of an existing component at once.
 * All specified props will be merged onto the existing component. This shows
 * how to perform complex modifications like changing both the light type and color.
 */
export const ModifyComponentMultiple: React.FC<{
  asset: Asset;
  path: string;
  type?: 'directional' | 'omni' | 'spot';
  color?: string;
}> = ({ asset, path, type = 'directional', color = 'red' }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Light type={type} color={color} />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Apply multiple non-conflicting rules.
 * 
 * Demonstrates applying multiple Modify.Node rules that don't conflict with each other.
 * Each rule operates independently on different entities or different component types.
 * The system processes all rules and applies them to their respective targets.
 */
export const MultipleNonConflictingRules: React.FC<{
  asset: Asset;
  path1: string;
  path2: string;
}> = ({ asset, path1, path2 }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path1}>
          <Modify.Light remove />
        </Modify.Node>
        <Modify.Node path={path2}>
          <Modify.Render remove />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Demonstrate specificity-based conflict resolution.
 * 
 * Shows how the system resolves conflicts when multiple rules target the same component.
 * Rules with higher specificity (more specific paths) win over less specific ones.
 * For example, "RootNode.Body.Head" (specificity 300) beats "**[light]" (specificity 1).
 * This allows you to have general rules with specific overrides.
 */
export const SpecificityConflictResolution: React.FC<{
  asset: Asset;
  lowSpecificityPath: string;
  highSpecificityPath: string;
  intensity?: number;
}> = ({ asset, lowSpecificityPath, highSpecificityPath, intensity = 2 }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        {/* Low specificity - remove all lights */}
        <Modify.Node path={lowSpecificityPath}>
          <Modify.Light remove />
        </Modify.Node>
        
        {/* High specificity - modify specific light */}
        <Modify.Node path={highSpecificityPath}>
          <Modify.Light intensity={intensity} />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Handle rules affecting same entity (remove component + add child).
 * 
 * Demonstrates applying multiple actions to the same entity in a single Modify.Node.
 * You can remove components and add children in the same rule. All actions are
 * applied to entities matching the path. This shows the flexibility of the API.
 */
export const SameEntityMultipleRules: React.FC<{
  asset: Asset;
  path: string;
  childName: string;
}> = ({ asset, path, childName }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Light remove />
          <Entity name={childName} />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Use predicate function for matching.
 * 
 * Instead of a path string, you can provide a function that receives each entity
 * and returns true if it should be matched. This allows for complex custom matching
 * logic that can't be expressed with path patterns. For example, matching entities
 * based on custom properties, component values, or complex conditions.
 */
export const PredicateFunctionMatching: React.FC<{
  asset: Asset;
  predicate: (entity: PcEntity) => boolean;
}> = ({ asset, predicate }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={predicate}>
          <Modify.Render remove />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Complex modification chain with multiple rules.
 * 
 * Demonstrates a realistic use case combining multiple rules that work together:
 * 1. Remove all existing lights from the scene
 * 2. Add a new light to a specific location
 * 3. Modify all render components to cast shadows
 * 
 * This shows how different rules can be composed to achieve complex scene transformations.
 */
export const ComplexModificationChain: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        {/* Rule 1: Remove all lights */}
        <Modify.Node path="**[light]">
          <Modify.Light remove />
        </Modify.Node>
        
        {/* Rule 2: Add light to player head */}
        <Modify.Node path="Scene.Characters.Player.Body.Head">
          <Entity name="HeadLight" />
        </Modify.Node>
        
        {/* Rule 3: Modify all render components */}
        <Modify.Node path="**[render]">
          <Modify.Render castShadows={true} />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Nested hierarchy modifications.
 * 
 * Shows how to modify entities at different levels of the hierarchy using wildcards.
 * Combines single-level wildcards (*) with clearChildren to perform complex
 * restructuring operations. This is useful for reorganizing scene hierarchies.
 */
export const NestedHierarchyModifications: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        {/* Rule 1: Clear Environment children */}
        <Modify.Node path="Scene.Environment" clearChildren>
          <Entity name="NewSun" />
        </Modify.Node>
        
        {/* Rule 2: Modify all character heads */}
        <Modify.Node path="Scene.Characters.*.Body.Head">
          <Entity name="Hat" />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Conditional rendering based on props.
 * 
 * Demonstrates how to conditionally apply rules based on React props or state.
 * This allows for dynamic modification behavior that can change based on user input,
 * game state, or other conditions. The rules are reactively updated when props change.
 */
export const ConditionalRendering: React.FC<{
  asset: Asset;
  removeLights: boolean;
}> = ({ asset, removeLights }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        {removeLights && (
          <Modify.Node path="**[light]">
            <Modify.Light remove />
          </Modify.Node>
        )}
      </Gltf>
    </Application>
  );
};

/**
 * Handle asset without resource.
 * 
 * Tests the edge case where an asset has no resource (null). The Gltf component
 * should handle this gracefully without throwing errors. This is important for
 * handling loading states or failed asset loads.
 */
export const AssetWithoutResource: React.FC<{ asset: Asset }> = ({ asset }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id} />
    </Application>
  );
};

/**
 * Handle non-matching paths (should do nothing).
 * 
 * Demonstrates behavior when a path doesn't match any entities in the hierarchy.
 * The system should gracefully handle this case without errors. No modifications
 * are applied, and the scene remains unchanged. This is important for handling
 * dynamic content where paths might not always exist.
 */
export const NonMatchingPaths: React.FC<{ asset: Asset; path: string }> = ({ asset, path }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id}>
        <Modify.Node path={path}>
          <Modify.Light remove />
          <Modify.Light intensity={99} />
        </Modify.Node>
      </Gltf>
    </Application>
  );
};

/**
 * Helper component to capture Application root entity for testing.
 * 
 * Uses the useApp hook to access the PlayCanvas Application instance and
 * capture its root entity. This is useful in tests to verify that entities
 * are correctly parented to the application root.
 */
export const AppRootSpy: React.FC<{ onRootCaptured: (root: PcEntity) => void }> = ({ onRootCaptured }) => {
  const onRootCapturedRef = React.useRef(onRootCaptured);
  
  // Keep ref updated
  React.useEffect(() => {
    onRootCapturedRef.current = onRootCaptured;
  }, [onRootCaptured]);
  
  // Use AppContext directly to avoid throwing when app isn't ready
  const appContext = React.useContext(AppContext);
  
  React.useEffect(() => {
    if (appContext?.root) {
      onRootCapturedRef.current(appContext.root);
    }
  }, [appContext]);
  
  return null;
};

/**
 * Gltf with AppRootSpy for testing parent relationships.
 * 
 * Combines Gltf with AppRootSpy to enable testing of parent-child relationships
 * in the scene hierarchy. This is useful for verifying that instantiated entities
 * are correctly added to the application root.
 */
export const GltfWithAppSpy: React.FC<{
  asset: Asset;
  onRootCaptured: (root: PcEntity) => void;
}> = ({ asset, onRootCaptured }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id} />
      <AppRootSpy onRootCaptured={onRootCaptured} />
    </Application>
  );
};

/**
 * Asset without resource with spy (for testing edge cases).
 * 
 * Combines AssetWithoutResource with AppRootSpy to test edge cases while
 * still being able to verify the application root state. Useful for testing
 * that no entities are added when an asset has no resource.
 */
export const AssetWithoutResourceWithSpy: React.FC<{
  asset: Asset;
  onRootCaptured: (root: PcEntity) => void;
}> = ({ asset, onRootCaptured }) => {
  return (
    <Application deviceTypes={['null']}>
      <Gltf asset={asset} key={asset.id} />
      <AppRootSpy onRootCaptured={onRootCaptured} />
    </Application>
  );
};

