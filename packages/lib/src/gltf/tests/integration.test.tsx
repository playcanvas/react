import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Application as PcApplication, Entity as PcEntity, NullGraphicsDevice, Asset, LightComponent, RenderComponent } from 'playcanvas';
import React from 'react';
import { Gltf } from '../components/Gltf.tsx';
import { Modify } from '../components/Modify.tsx';
import { Application } from '../../Application.tsx';
import { Light } from '../../components/Light.tsx';
import { Render } from '../../components/Render.tsx';

import {
  createSimpleRobot,
  createComplexScene,
  createLightingScene
} from '../../../test/fixtures/gltf-hierarchies.ts';
import { createMockGltfAsset } from '../../../test/utils/gltf-asset-mock.ts';
import { findEntityByName } from '../../../test/utils/gltf-entity-builder.ts';
import {
  BasicGltf,
  GltfWithModifications,
  EmptyGltf,
  RemoveComponentFromPath,
  RemoveAllComponentsByFilter,
  RemoveRenderWithWildcard,
  RemoveWithMultiLevelWildcard,
  RemoveWithCombinedPathAndFilter,
  AddChildEntity,
  AddMultipleChildren,
  ClearChildrenAndReplace,
  ModifyComponent,
  ModifyComponentMultiple,
  MultipleNonConflictingRules,
  SpecificityConflictResolution,
  SameEntityMultipleRules,
  PredicateFunctionMatching,
  ComplexModificationChain,
  NestedHierarchyModifications,
  ConditionalRendering,
  NonMatchingPaths,
  GltfWithAppSpy,
  AssetWithoutResourceWithSpy
} from './fixtures/test-components.tsx';

describe('Gltf Integration Tests', () => {
  let app: PcApplication;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    app = new PcApplication(canvas, {
      graphicsDevice: new NullGraphicsDevice(canvas)
    });
  });

  describe('Basic instantiation', () => {
    it('should instantiate GLTF asset when render is true', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const { container } = render(<BasicGltf asset={asset} />);

      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });

    it('should instantiate GLTF asset when Modify.Node children present', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const { container } = render(<GltfWithModifications asset={asset} />);

      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });

    it('should not instantiate without render or Modify.Node children', () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const { container } = render(<EmptyGltf asset={asset} />);

      expect(container).toBeDefined();
    });
  });

  describe('Component removal', () => {
    it('should remove component from matched entity', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const head = findEntityByName(hierarchy, 'Head');
      expect(head).toBeDefined();
      expect(head?.c.light).toBeDefined();
      
      render(<RemoveComponentFromPath asset={asset} path="RootNode.Body.Head" />);
      
      await waitFor(() => {
        const head = findEntityByName(hierarchy, 'Head');
        expect(head).toBeDefined();
        expect(head?.c.light).toBeUndefined();
      });
    });

    it('should remove components from all matching entities', async () => {
      // --- ARRANGE ---
      const hierarchy = createLightingScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);
      
      const keyLight = findEntityByName(hierarchy, 'KeyLight')!;
      const fillLight = findEntityByName(hierarchy, 'FillLight')!;
      const rimLight = findEntityByName(hierarchy, 'RimLight')!;
      // Find the other lights
      const spot1 = findEntityByName(hierarchy, 'Spot1')!;
      const spot2 = findEntityByName(hierarchy, 'Spot2')!;

      // Check initial state
      expect(keyLight.c.light).toBeDefined();
      expect(fillLight.c.light).toBeDefined();
      expect(rimLight.c.light).toBeDefined();
      expect(spot1.c.light).toBeDefined();
      expect(spot2.c.light).toBeDefined();

      // --- ACT ---
      render(<RemoveAllComponentsByFilter asset={asset} path="**[light]" />);

      // --- ASSERT ---
      await waitFor(() => {
        // All entities with light components should be matched
        expect(keyLight.c.light).toBeUndefined();
        expect(fillLight.c.light).toBeUndefined();
        expect(rimLight.c.light).toBeUndefined();
        // Add assertions for the other lights
        expect(spot1.c.light).toBeUndefined();
        expect(spot2.c.light).toBeUndefined();
      });
    });
  });

  describe('Path matching', () => {
    it('should match exact paths and remove the component', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const head = findEntityByName(hierarchy, 'Head')!; // Use ! for non-null
      expect(head).toBeDefined();
      expect(head.c.light).toBeDefined(); // Correct "before" check

      render(<RemoveComponentFromPath asset={asset} path="RootNode.Body.Head" />);

      await waitFor(() => {
        expect(head.c.light).toBeUndefined(); 
      });
    });

    it('should match single-level wildcards and remove render components', async () => {
      // --- ARRANGE ---
      // Use the *updated* fixture that has render components
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      const head = findEntityByName(hierarchy, 'Head')!;
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      const rightArm = findEntityByName(hierarchy, 'RightArm')!;
    
      // Check BEFORE state
      expect(head.c.render).toBeDefined();
      expect(leftArm.c.render).toBeDefined();
      expect(rightArm.c.render).toBeDefined();
    
      // --- ACT ---
      render(<RemoveRenderWithWildcard asset={asset} path="RootNode.Body.*" />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        expect(head.c.render).toBeUndefined();
        expect(leftArm.c.render).toBeUndefined();
        expect(rightArm.c.render).toBeUndefined();
      });
    });

    it('should match multi-level wildcards and remove components', async () => {
      const hierarchy = createComplexScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      // Find both "Head" entities
      const playerHead = findEntityByName(findEntityByName(hierarchy, 'Player')!, 'Head')!;
      const enemyHead = findEntityByName(findEntityByName(hierarchy, 'Enemy')!, 'Head')!;
    
      // Check BEFORE state
      expect(playerHead.c.render).toBeDefined();
      expect(enemyHead.c.render).toBeDefined();
    
      render(<RemoveWithMultiLevelWildcard asset={asset} path="Scene.**.Head" />);
    
      // --- ASSERT ---
      await waitFor(() => {
        expect(playerHead.c.render).toBeUndefined();
        expect(enemyHead.c.render).toBeUndefined();
      });
    });

    it('should match component filters and remove all lights', async () => {
      // --- ARRANGE ---
      const hierarchy = createLightingScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      // Get references to all the light entities
      const keyLight = findEntityByName(hierarchy, 'KeyLight')!;
      const fillLight = findEntityByName(hierarchy, 'FillLight')!;
      const rimLight = findEntityByName(hierarchy, 'RimLight')!;
      const spot1 = findEntityByName(hierarchy, 'Spot1')!;
      const spot2 = findEntityByName(hierarchy, 'Spot2')!;
    
      // Check BEFORE state
      expect(keyLight.c.light).toBeDefined();
      expect(fillLight.c.light).toBeDefined();
      expect(rimLight.c.light).toBeDefined();
      expect(spot1.c.light).toBeDefined();
      expect(spot2.c.light).toBeDefined();
    
      // --- ACT ---
      render(<RemoveAllComponentsByFilter asset={asset} path="[light]" />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        expect(keyLight.c.light).toBeUndefined();
        expect(fillLight.c.light).toBeUndefined();
        expect(rimLight.c.light).toBeUndefined();
        expect(spot1.c.light).toBeUndefined();
        expect(spot2.c.light).toBeUndefined();
      });
    });

    it('should match combined paths and filters', async () => {
      // --- ARRANGE ---
      const hierarchy = createLightingScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      // Get references to all lights
      const keyLight = findEntityByName(hierarchy, 'KeyLight')!;
      const fillLight = findEntityByName(hierarchy, 'FillLight')!;
      const rimLight = findEntityByName(hierarchy, 'RimLight')!;
      const spot1 = findEntityByName(hierarchy, 'Spot1')!; // This one should NOT be removed
    
      // Check BEFORE state
      expect(keyLight.c.light).toBeDefined();
      expect(fillLight.c.light).toBeDefined();
      expect(rimLight.c.light).toBeDefined();
      expect(spot1.c.light).toBeDefined(); // Spot1 should exist
    
      // --- ACT ---
      render(<RemoveWithCombinedPathAndFilter asset={asset} path="LightingRig.MainLights.*[light]" />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        
        // These should be gone
        expect(keyLight.c.light).toBeUndefined();
        expect(fillLight.c.light).toBeUndefined();
        expect(rimLight.c.light).toBeUndefined();
        
        // This one should NOT be removed, proving the path worked
        expect(spot1.c.light).toBeDefined(); 
      });
    });
  });

  describe('Adding children', () => {
    it('should add new entity as child', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      const head = findEntityByName(hierarchy, 'Head')!;
      
      // Check BEFORE state
      expect(findEntityByName(head, 'Helmet')).toBeNull(); // No helmet exists yet
    
      // --- ACT ---
      render(<AddChildEntity asset={asset} path="RootNode.Body.Head" childName="Helmet" childType="box" />);
    
      await waitFor(() => {
        const helmet = findEntityByName(head, 'Helmet');
        expect(helmet).toBeDefined();
        expect(helmet!.parent).toBe(head);
        expect(helmet!.c.render).toBeDefined();
      });
    });

    it('should add multiple children', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      const body = findEntityByName(hierarchy, 'Body')!;
      
      // Check BEFORE state
      expect(body.children.length).toBe(3); // Head, LeftArm, RightArm
      expect(findEntityByName(body, 'Child1')).toBeNull();
      expect(findEntityByName(body, 'Child2')).toBeNull();
      expect(findEntityByName(body, 'Child3')).toBeNull();
    
      // --- ACT ---
      render(<AddMultipleChildren asset={asset} path="RootNode.Body" childNames={['Child1', 'Child2', 'Child3']} />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        // We check the *actual* hierarchy to see if the
        // new entities were added.
        const child1 = findEntityByName(body, 'Child1');
        const child2 = findEntityByName(body, 'Child2');
        const child3 = findEntityByName(body, 'Child3');
    
        expect(child1).toBeDefined();
        expect(child2).toBeDefined();
        expect(child3).toBeDefined();
        expect(child1!.parent).toBe(body);
        
        // Total children should be 3 original + 3 new
        expect(body.children.length).toBe(6);
      });
    });

    it('should clear children when specified', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
      const body = findEntityByName(hierarchy, 'Body')!;
      expect(body.children.length).toBe(3); // Initial check

      // --- ACT ---
      render(<ClearChildrenAndReplace asset={asset} path="RootNode.Body" newChildName="OnlyChild" />);

      // --- ASSERT ---
      await waitFor(() => {
        const onlyChild = findEntityByName(body, 'OnlyChild');
        expect(onlyChild).not.toBeNull(); 
        expect(onlyChild!.parent).toBe(body);
        expect(body.children.length).toBe(1);
        expect(findEntityByName(body, 'Head')).toBeNull(); // Check original is gone
      });
    });
  });

  describe('Component modification', () => {
    it('should modify component props (merge/overwrite)', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      const head = findEntityByName(hierarchy, 'Head')!;
      
      // Check BEFORE state
      expect(head.c.light).toBeDefined();
      expect(head.c.light['intensity']).toBe(1); // From the fixture
    
      // --- ACT ---
      render(<ModifyComponent asset={asset} path="RootNode.Body.Head" intensity={2} />);
    
      // --- ASSERT ---
      await waitFor(() => {
        expect(head.c.light).toBeDefined(); // It should still exist
        expect(head.c.light['intensity']).toBe(2); // It should be updated
      });
    });

    it('should modify existing component props', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
      const head = findEntityByName(hierarchy, 'Head')!;
    
      // Check BEFORE state
      const light = head.c.light as LightComponent;
      expect(head.c.light).toBeDefined();
      expect(light.type).toBe('omni');
      expect(light.color).not.deep.equal({r: 1, g: 0, b: 0});
    
      // --- ACT ---
      render(<ModifyComponentMultiple asset={asset} path="RootNode.Body.Head" type="directional" color="red" />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        const light = head.c.light as LightComponent;
        expect(light).toBeDefined();
        expect(light.type).toBe('directional');
        expect(light.color.r).toBe(1); // Assuming 'red' maps to [1,0,0]
      });
    });
  });

  describe('Multiple rules and conflict resolution', () => {
    it('should apply multiple non-conflicting rules', async () => {
      // --- ARRANGE ---
      // (Assuming createSimpleRobot adds 'render' to LeftArm)
      const hierarchy = createSimpleRobot(app); 
      const asset = createMockGltfAsset(hierarchy, 1);
      
      const head = findEntityByName(hierarchy, 'Head')!;
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      
      // Check BEFORE state
      expect(head.c.light).toBeDefined();
      expect(leftArm.c.render).toBeDefined();
    
      // --- ACT ---
      render(<MultipleNonConflictingRules asset={asset} path1="RootNode.Body.Head" path2="RootNode.Body.LeftArm" />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        expect(head.c.light).toBeUndefined();
        expect(leftArm.c.render).toBeUndefined();
      });
    });

    it('should resolve conflicts by specificity', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
      const head = findEntityByName(hierarchy, 'Head')!;
    
      // Check BEFORE state
      expect(head.c.light).toBeDefined();
      expect((head.c.light as LightComponent).intensity).toBe(1); // From fixture
    
      // --- ACT ---
      render(
        <SpecificityConflictResolution 
          asset={asset} 
          lowSpecificityPath="**[light]" 
          highSpecificityPath="RootNode.Body.Head"
          intensity={2}
        />
      );
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        // The high-spec rule won, so the light was NOT removed
        expect(head.c.light).toBeDefined(); 
        // And its intensity WAS modified
        expect((head.c.light as LightComponent).intensity).toBe(2); 
      });
    });

    it('should handle rules affecting same entity', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
      const head = findEntityByName(hierarchy, 'Head')!;
    
      // Check BEFORE state
      expect(head.c.light).toBeDefined();
      expect(findEntityByName(head, 'Helmet')).toBeNull();
    
      // --- ACT ---
      render(<SameEntityMultipleRules asset={asset} path="RootNode.Body.Head" childName="Helmet" />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        expect(head.c.light).toBeUndefined();
        
        // The new entity should be added
        const helmet = findEntityByName(head, 'Helmet');
        expect(helmet).not.toBeNull();
        expect(helmet!.parent).toBe(head);
      });
    });
  });

  describe('Predicate functions', () => {
    it('should match using predicate function', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      const predicate = (entity: PcEntity) => entity.name.includes('Arm');
    
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      const rightArm = findEntityByName(hierarchy, 'RightArm')!;
    
      // Check BEFORE state
      expect(leftArm.c.render).toBeDefined();
      expect(rightArm.c.render).toBeDefined();
    
      // --- ACT ---
      render(<PredicateFunctionMatching asset={asset} predicate={predicate} />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        // The predicate should have matched both entities
        expect(leftArm.c.render).toBeUndefined();
        expect(rightArm.c.render).toBeUndefined();
      });
    });
  });

  describe('Complex scenarios', () => {
    it('should handle complex modification chain', async () => {
      // --- ARRANGE ---
      const hierarchy = createComplexScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      const sun = findEntityByName(hierarchy, 'Sun')!;
      const playerHead = findEntityByName(findEntityByName(hierarchy, 'Player')!, 'Head')!;
      
      // This is the entity that has the render component
      const enemyHead = findEntityByName(findEntityByName(hierarchy, 'Enemy')!, 'Head')!;
    
      // Check BEFORE state
      expect(sun.c.light).toBeDefined(); // Rule 1 target
      expect(findEntityByName(playerHead, 'HeadLight')).toBeNull(); // Rule 2 target
      expect(enemyHead.c.render).toBeDefined(); // Rule 3 target
      expect((enemyHead.c.render as RenderComponent).castShadows).toBe(false);
    
      // --- ACT ---
      render(<ComplexModificationChain asset={asset} />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        
        // 1. Check Rule 1 (Remove)
        expect(sun.c.light).toBeUndefined();
        
        // 2. Check Rule 2 (Add)
        const headLight = findEntityByName(playerHead, 'HeadLight');
        expect(headLight).not.toBeNull();
        
        // 3. Check Rule 3 (Modify)
        expect((playerHead.c.render as RenderComponent).castShadows).toBe(true);
        expect((enemyHead.c.render as RenderComponent).castShadows).toBe(true);
      });
    });

    it('should handle nested hierarchy modifications', async () => {
      // --- ARRANGE ---
      const hierarchy = createComplexScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      // Get references for Rule 1
      const environment = findEntityByName(hierarchy, 'Environment')!;
      expect(findEntityByName(environment, 'Sun')).toBeDefined(); // Original child
      expect(findEntityByName(environment, 'NewSun')).toBeNull(); // New child
    
      // Get references for Rule 2
      const playerHead = findEntityByName(findEntityByName(hierarchy, 'Player')!, 'Head')!;
      const enemyHead = findEntityByName(findEntityByName(hierarchy, 'Enemy')!, 'Head')!;
      expect(findEntityByName(playerHead, 'Hat')).toBeNull();
      expect(findEntityByName(enemyHead, 'Hat')).toBeNull();
    
      // --- ACT ---
      render(<NestedHierarchyModifications asset={asset} />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state for Rule 1
        expect(findEntityByName(environment, 'Sun')).toBeNull(); // Original is gone
        const newSun = findEntityByName(environment, 'NewSun');
        expect(newSun).not.toBeNull();
        expect(newSun!.parent).toBe(environment);
    
        // Check AFTER state for Rule 2
        const playerHat = findEntityByName(playerHead, 'Hat');
        const enemyHat = findEntityByName(enemyHead, 'Hat');
        expect(playerHat).not.toBeNull();
        expect(playerHat!.parent).toBe(playerHead);
        expect(enemyHat).not.toBeNull();
        expect(enemyHat!.parent).toBe(enemyHead);
      });
    });
  });

  describe('React lifecycle', () => {
    it('should cleanup on unmount', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
      const head = findEntityByName(hierarchy, 'Head')!;
    
      // 1. Spy on the root entity's destroy method
      const destroySpy = vi.spyOn(hierarchy, 'destroy');
    
      // Check BEFORE state
      expect(head.c.light).toBeDefined();
      expect(destroySpy).not.toHaveBeenCalled();
    
      // --- ACT 1: Render and wait for mods ---
      const { unmount } = render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="**[light]">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );
    
      // 2. Wait for the component to be fully settled (light is removed)
      await waitFor(() => {
        expect(head.c.light).toBeUndefined();
      });
    
      // --- ACT 2: Unmount ---
      unmount();
    
      // --- ASSERT ---
      // 3. Wait for the unmount's useEffect cleanup to run
      await waitFor(() => {
        // 4. Check that destroy() was called
        expect(destroySpy).toHaveBeenCalled();
      });
    });

    it('should update rules when props change', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
      const head = findEntityByName(hierarchy, 'Head')!;
    
      // --- ACT 1 (Initial Render) ---
      const { rerender } = render(<ConditionalRendering asset={asset} removeLights={false} />);
    
      // --- ASSERT 1 (Check "Before" State) ---
      // Wait for the component to settle, then check the light
      await waitFor(() => {
        // The light should exist because removeLights is false
        expect(head.c.light).toBeDefined(); 
      });
    
      // --- ACT 2 (Rerender) ---
      rerender(<ConditionalRendering asset={asset} removeLights={true} />);
    
      // --- ASSERT 2 (Check "After" State) ---
      // Wait for the new rules to be applied
      await waitFor(() => {
        // The light should now be gone
        expect(head.c.light).toBeUndefined(); 
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty Gltf', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
    
      // Check BEFORE state
      expect(hierarchy.parent).toBeNull();

      // This object will hold the *actual* app.root from the component tree
      const contextSpy: { current: PcEntity | null } = { current: null };

      const handleRootCaptured = (root: PcEntity) => {
        contextSpy.current = root;
      };
    
      // --- ACT ---
      render(<GltfWithAppSpy asset={asset} onRootCaptured={handleRootCaptured} />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state - hierarchy should be added to the React Application's root
        expect(hierarchy.parent).not.toBeNull();
        expect(contextSpy.current).not.toBeNull();
        expect(hierarchy.parent).toBe(contextSpy.current);
      });
    });

    it('should handle asset without resource', async () => {
      // --- ARRANGE ---
      const assetWithoutResource = {
        id: 1,
        resource: null
      } as unknown as Asset;
    
      const contextSpy: { current: PcEntity | null } = { current: null };

      const handleRootCaptured = (root: PcEntity) => {
        contextSpy.current = root;
      };
    
      // --- ACT ---
      render(<AssetWithoutResourceWithSpy asset={assetWithoutResource} onRootCaptured={handleRootCaptured} />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check that the *actual* app.root from the context has no children
        expect(contextSpy.current).not.toBeNull();
        expect(contextSpy.current!.children.length).toBe(0);
      });
    });

    it('should do nothing when paths match no entities', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);
      const head = findEntityByName(hierarchy, 'Head')!;
    
      // Check BEFORE state
      expect(head.c.light).toBeDefined();
      expect((head.c.light as LightComponent).intensity).toBe(1);
    
      // --- ACT ---
      render(<NonMatchingPaths asset={asset} path="NonExistent.Path.Here" />);
    
      // --- ASSERT ---
      await waitFor(() => {
        // Check AFTER state
        // The light should still exist and its intensity should be the original value
        expect(head.c.light).toBeDefined();
        expect((head.c.light as LightComponent).intensity).toBe(1);
      });
    });
    
    describe('Warnings', () => {

      it('should warn when adding component to entity that already has that component', async () => {
        // --- ARRANGE ---
        const hierarchy = createSimpleRobot(app);
        const asset = createMockGltfAsset(hierarchy, 1);
        const head = findEntityByName(hierarchy, 'Head')!;
        const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      
        // Check BEFORE state - entities already have components
        expect(head.c.light).toBeDefined();
        expect(leftArm.c.render).toBeDefined();
      
        // Spy on console.warn
        const warnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});
      
        try {
          // --- ACT ---
          // Add both Light to Head and Render to LeftArm in separate Modify.Nodes
          render(
            <Application deviceTypes={['null']}>
              <Gltf asset={asset} key={asset.id}>
                <Modify.Node path="RootNode.Body.Head">
                  <Light type="directional" intensity={2} />
                </Modify.Node>
                <Modify.Node path="RootNode.Body.LeftArm">
                  <Render type="box" />
                </Modify.Node>
              </Gltf>
            </Application>
          );
      
          // --- ASSERT ---
          // warnOnce uses setTimeout, so we need to wait for both warnings
          await waitFor(() => {
            expect(warnSpy).toHaveBeenCalled();
          });
          
          // Verify both warnings were called
          const lightWarning = warnSpy.mock.calls.find(call => 
            call[0] === '%c[PlayCanvas React]:' &&
            typeof call[1] === 'string' &&
            typeof call[2] === 'string' &&
            call[2].includes('Cannot add <Light> component to entity "Head"')
          );
          expect(lightWarning).toBeDefined();
          expect(lightWarning![2]).toContain('Entity already has a light component');
          expect(lightWarning![2]).toContain('Use <Modify.Light> to modify the existing component');
          
          const renderWarning = warnSpy.mock.calls.find(call => 
            call[0] === '%c[PlayCanvas React]:' &&
            typeof call[1] === 'string' &&
            typeof call[2] === 'string' &&
            call[2].includes('Cannot add <Render> component to entity "LeftArm"')
          );
          expect(renderWarning).toBeDefined();
          expect(renderWarning![2]).toContain('Entity already has a render component');
          expect(renderWarning![2]).toContain('Use <Modify.Render> to modify the existing component');
        } finally {
          warnSpy.mockRestore();
        }
      });
    });
  });
});

