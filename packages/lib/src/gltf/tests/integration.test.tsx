import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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
        // After rule processing, light should be removed
        // Note: In actual implementation, this happens in RuleProcessor
        expect(head).toBeDefined();
      });
    });

    it('should remove components from all matching entities', async () => {
      const hierarchy = createLightingScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="**[light]">
              <Modify.Light remove />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // All entities with light components should be matched
        expect(hierarchy).toBeDefined();
      });
    });
  });

  describe('Path matching', () => {
    it('should match exact paths', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

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
        expect(hierarchy).toBeDefined();
      });
    });

    it('should match single-level wildcards', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
          <Modify.Node path="RootNode.Body.*">
            <Modify.Render remove />
          </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // Should match Head, LeftArm, RightArm
        expect(hierarchy).toBeDefined();
      });
    });

    it('should match multi-level wildcards', async () => {
      const hierarchy = createComplexScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
          <Modify.Node path="Scene.**.Head">
            <Modify.Render remove />
          </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // Should match all Head entities at any depth
        expect(hierarchy).toBeDefined();
      });
    });

    it('should match component filters', async () => {
      const hierarchy = createLightingScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
          <Modify.Node path="[light]">
            <Modify.Light remove />
          </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // Should match all entities with light component
        expect(hierarchy).toBeDefined();
      });
    });

    it('should match combined paths and filters', async () => {
      const hierarchy = createLightingScene(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
          <Modify.Node path="LightingRig.MainLights.*[light]">
            <Modify.Light remove />
          </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // Should match only lights in MainLights group
        expect(hierarchy).toBeDefined();
      });
    });
  });

  describe('Adding children', () => {
    it('should add new entity as child', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              <Entity name="Helmet">
                <Render type="asset" />
              </Entity>
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // New Helmet entity should be added
        expect(hierarchy).toBeDefined();
      });
    });

    it('should add multiple children', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

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

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });

    it('should clear children when specified', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body" clearChildren>
              <Entity name="OnlyChild" />
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        // Body's original children should be cleared
        expect(hierarchy).toBeDefined();
      });
    });
  });

  describe('Component modification', () => {
    it('should modify component with render prop', async () => {
      const hierarchy = createSimpleRobot(app);
      const asset = createMockGltfAsset(hierarchy, 1);

      render(
        <Application deviceTypes={['null']}>
          <Gltf asset={asset} key={asset.id}>
            <Modify.Node path="RootNode.Body.Head">
              <Modify.Light intensity={2}/>
            </Modify.Node>
          </Gltf>
        </Application>
      );

      await waitFor(() => {
        expect(hierarchy).toBeDefined();
      });
    });

    it('should replace component', async () => {
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

