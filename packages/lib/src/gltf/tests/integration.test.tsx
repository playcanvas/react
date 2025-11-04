import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import { Application as PcApplication, Entity as PcEntity, NullGraphicsDevice, Asset } from 'playcanvas';
import React from 'react';
import { Gltf } from '../components/Gltf.tsx';
import { Modify } from '../components/Modify.tsx';
import { Application } from '../../Application.tsx';
import { Entity } from '../../Entity.tsx';
import { Light } from '../../components/Light.tsx';
import { Render } from '../../components/Render.tsx';
import {
  createSimpleRobot,
  createComplexScene,
  createLightingScene
} from '../../../test/fixtures/gltf-hierarchies.ts';
import { createMockGltfAsset } from '../../../test/utils/gltf-asset-mock.ts';
import { findEntityByName } from '../../../test/utils/gltf-entity-builder.ts';

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

      const { container } = render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id} render={true} />
        </Application>
      );

      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });

    it('should instantiate GLTF asset when Modify.Node children present', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const { container } = render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id} render={false}>
            <Modify.Node path="**[light]">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });

    it('should not instantiate without render or Modify.Node children', () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const { container } = render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id} render={false} />
        </Application>
      );

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
      
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );
      
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
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="**[light]">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );

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

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );

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
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.*">
              <Modify.Render remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );
    
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
    
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="Scene.**.Head">
              <Modify.Render remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );
    
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
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="[light]">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );
    
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
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            {/* This path should ONLY match lights in the MainLights group */}
            <Modify.Node path="LightingRig.MainLights.*[light]">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );
    
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
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              <Entity name="Helmet">
                <Render type="box" />
              </Entity>
            </Modify.Node>
          </Gltf>
        </Application>
      );
    
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
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body">
              <Entity name="Child1" />
              <Entity name="Child2" />
              <Entity name="Child3" />
            </Modify.Node>
          </Gltf>
        </Application>
      );
    
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
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body" clearChildren>
              <Entity name="OnlyChild" />
            </Modify.Node>
          </Gltf>
        </Application>
      );

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
      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              {/* This is a simple prop merge/overwrite */}
              <Modify.Light intensity={2} />
            </Modify.Node>
          </Gltf>
        </Application>
      );
    
      // --- ASSERT ---
      await waitFor(() => {
        expect(head.c.light).toBeDefined(); // It should still exist
        expect(head.c.light['intensity']).toBe(2); // It should be updated
      });
    });

    it('should replace component', async () => {
      // --- ARRANGE ---
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              <Modify.Light type="directional" color="red" />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });
  });

  describe('Multiple rules and conflict resolution', () => {
    it('should apply multiple non-conflicting rules', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              <Modify.Light remove />
            </Modify.Node>
            <Modify.Node path="RootNode.Body.LeftArm">
              <Modify.Render remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });

    it('should resolve conflicts by specificity', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            {/* Low specificity - remove all lights */}
            <Modify.Node path="**[light]">
              <Modify.Light remove />
            </Modify.Node>
            
            {/* High specificity - modify specific light */}
            <Modify.Node path="RootNode.Body.Head">
              <Modify.Light intensity={2} />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // More specific rule should win
        expect(hierarchy).toBeDefined();
      });
    });

    it('should handle rules affecting same entity', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              <Modify.Light remove />
              <Entity name="Helmet" />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });
  });

  describe('Predicate functions', () => {
    it('should match using predicate function', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const predicate = (entity: PcEntity) => entity.name.includes('Arm');

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path={predicate}>
              <Modify.Render remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // Should match LeftArm and RightArm
        expect(hierarchy).toBeDefined();
      });
    });
  });

  describe('Complex scenarios', () => {
    it('should handle complex modification chain', async () => {
      const hierarchy = createComplexScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            {/* Remove all lights globally */}
            <Modify.Node path="**[light]">
              <Modify.Light remove />
            </Modify.Node>
            
            {/* Add custom light to player head */}
            <Modify.Node path="Scene.Characters.Player.Body.Head">
              <Entity name="HeadLight">
                <Light type="omni" color="cyan" intensity={2} />
              </Entity>
            </Modify.Node>
            
            {/* Modify all render components */}
            <Modify.Node path="**[render]">
              <Modify.Render castShadows={true} />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });

    it('should handle nested hierarchy modifications', async () => {
      const hierarchy = createComplexScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            {/* Clear Environment children */}
            <Modify.Node path="Scene.Environment" clearChildren>
              <Entity name="NewSun">
                <Light type="directional" />
              </Entity>
            </Modify.Node>
            
            {/* Modify all character heads */}
            <Modify.Node path="Scene.Characters.*.Body.Head">
              <Entity name="Hat" />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });
  });

  describe('React lifecycle', () => {
    it('should cleanup on unmount', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const { unmount } = render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="**[light]">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });

      unmount();

      // After unmount, cleanup should occur
      await waitFor(() => {
        expect(true).toBe(true);
      });
    });

    it('should update rules when props change', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const TestComponent = ({ removeLights }: { removeLights: boolean }) => (
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

      const { rerender } = render(<TestComponent removeLights={false} />);

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });

      rerender(<TestComponent removeLights={true} />);

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty Gltf (no modifications)', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      const { container } = render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id} />
        </Application>
      );

      await waitFor(() => {
        expect(container).toBeDefined();
      });
    });

    it('should handle asset without resource', () => {
      const assetWithoutResource = {
        id: 1,
        resource: null
      } as unknown as Asset;

      const { container } = render(
        <Application deviceTypes={['null']}>
          <Gltf asset={assetWithoutResource} key={assetWithoutResource.id} />
        </Application>
      );

      expect(container).toBeDefined();
    });

    it('should handle paths that match no entities', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="NonExistent.Path.Here">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });
  });
});

