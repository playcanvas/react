import { describe, it, expect, beforeEach } from 'vitest';
import { PathMatcher, EntityMetadata } from '../utils/path-matcher.ts';
import { Application as PcApplication, Entity as PcEntity, NullGraphicsDevice } from 'playcanvas';
import {
  createSimpleRobot,
  createComplexScene,
  createLightingScene,
  createFlatHierarchy,
  createDeepHierarchy,
  createDuplicateNamesHierarchy
} from '../../../test/fixtures/gltf-hierarchies.ts';
import { findEntityByName } from '../../../test/utils/gltf-entity-builder.ts';

describe('PathMatcher', () => {
  let pathMatcher: PathMatcher;
  let app: PcApplication;

  beforeEach(() => {
    pathMatcher = new PathMatcher();
    // Create a minimal app for entity creation
    const canvas = document.createElement('canvas');
    app = new PcApplication(canvas, {
      graphicsDevice: new NullGraphicsDevice(canvas)
    });
  });

  describe('Exact path matching', () => {
    it('should match exact paths', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      const metadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('RootNode.Body.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('RootNode.Body.LeftArm', metadata)).toBe(false);
    });

    it('should be case sensitive by default', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      const metadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('RootNode.Body.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('rootnode.body.head', metadata)).toBe(false);
    });

    it('should support case insensitive matching when configured', () => {
      const caseInsensitiveMatcher = new PathMatcher({ caseSensitive: false });
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      const metadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      expect(caseInsensitiveMatcher.matches('rootnode.body.head', metadata)).toBe(true);
      expect(caseInsensitiveMatcher.matches('ROOTNODE.BODY.HEAD', metadata)).toBe(true);
    });
  });

  describe('Single-level wildcard (*)', () => {
    it('should match single wildcard at any position', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      const metadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('*.Body.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('RootNode.*.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('RootNode.Body.*', metadata)).toBe(true);
    });

    it('should match multiple single-level wildcards', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      const metadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('*.*.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('*.*.*', metadata)).toBe(true);
    });

    it('should match all children of a parent', () => {
      const hierarchy = createFlatHierarchy(app);
      
      const item1 = findEntityByName(hierarchy, 'Item1')!;
      const item2 = findEntityByName(hierarchy, 'Item2')!;
      const special = findEntityByName(hierarchy, 'Special')!;

      const metadata1: EntityMetadata = {
        entity: item1,
        path: 'Root.Item1',
        guid: item1.getGuid(),
        name: 'Item1',
        originalChildGUIDs: []
      };

      const metadata2: EntityMetadata = {
        entity: item2,
        path: 'Root.Item2',
        guid: item2.getGuid(),
        name: 'Item2',
        originalChildGUIDs: []
      };

      const metadataSpecial: EntityMetadata = {
        entity: special,
        path: 'Root.Special',
        guid: special.getGuid(),
        name: 'Special',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('Root.*', metadata1)).toBe(true);
      expect(pathMatcher.matches('Root.*', metadata2)).toBe(true);
      expect(pathMatcher.matches('Root.*', metadataSpecial)).toBe(true);
    });

    it('should not match across multiple levels', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      const metadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      // Single wildcard should only match one level
      expect(pathMatcher.matches('RootNode.*.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('RootNode.*', metadata)).toBe(false);
    });
  });

  describe('Multi-level wildcard (**)', () => {
    it('should match zero or more levels', () => {
      const hierarchy = createDeepHierarchy(app);
      const deepNode = findEntityByName(hierarchy, 'DeepNode')!;
      
      const metadata: EntityMetadata = {
        entity: deepNode,
        path: 'Level0.Level1.Level2.Level3.Level4.DeepNode',
        guid: deepNode.getGuid(),
        name: 'DeepNode',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('Level0.**.DeepNode', metadata)).toBe(true);
      expect(pathMatcher.matches('**.DeepNode', metadata)).toBe(true);
      expect(pathMatcher.matches('Level0.**', metadata)).toBe(true);
    });

    it('should match ** as any path', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      const body = findEntityByName(hierarchy, 'Body')!;
      
      const headMetadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      const bodyMetadata: EntityMetadata = {
        entity: body,
        path: 'RootNode.Body',
        guid: body.getGuid(),
        name: 'Body',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('**', headMetadata)).toBe(true);
      expect(pathMatcher.matches('**', bodyMetadata)).toBe(true);
    });

    it('should match intermediate paths', () => {
      const hierarchy = createComplexScene(app);
      const eyes = findEntityByName(hierarchy, 'Eyes')!;
      
      const metadata: EntityMetadata = {
        entity: eyes,
        path: 'Scene.Characters.Player.Body.Head.Eyes',
        guid: eyes.getGuid(),
        name: 'Eyes',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('Scene.**.Eyes', metadata)).toBe(true);
      expect(pathMatcher.matches('Scene.Characters.**.Eyes', metadata)).toBe(true);
      expect(pathMatcher.matches('**.Player.**.Eyes', metadata)).toBe(true);
    });

    it('should handle ** at different positions', () => {
      const hierarchy = createComplexScene(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      // Note: There are multiple "Head" entities, we'll find the first one
      const metadata: EntityMetadata = {
        entity: head,
        path: 'Scene.Characters.Player.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('**.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('Scene.**', metadata)).toBe(true);
      expect(pathMatcher.matches('Scene.**.Head', metadata)).toBe(true);
    });
  });

  describe('Component filters', () => {
    it('should match entities with specific component', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      
      const headMetadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      const armMetadata: EntityMetadata = {
        entity: leftArm,
        path: 'RootNode.Body.LeftArm',
        guid: leftArm.getGuid(),
        name: 'LeftArm',
        originalChildGUIDs: []
      };

      // Head has light component
      expect(pathMatcher.matches('[light]', headMetadata)).toBe(true);
      // LeftArm doesn't have light component
      expect(pathMatcher.matches('[light]', armMetadata)).toBe(false);
    });

    it('should combine path and component filter', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      
      const headMetadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      const armMetadata: EntityMetadata = {
        entity: leftArm,
        path: 'RootNode.Body.LeftArm',
        guid: leftArm.getGuid(),
        name: 'LeftArm',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('RootNode.Body.Head[light]', headMetadata)).toBe(true);
      expect(pathMatcher.matches('RootNode.Body.*[light]', headMetadata)).toBe(true);
      expect(pathMatcher.matches('RootNode.Body.*[light]', armMetadata)).toBe(false);
    });

    it('should work with wildcards and component filters', () => {
      const hierarchy = createLightingScene(app);
      const keyLight = findEntityByName(hierarchy, 'KeyLight')!;
      const geometry = findEntityByName(hierarchy, 'Geometry')!;
      
      const lightMetadata: EntityMetadata = {
        entity: keyLight,
        path: 'LightingRig.MainLights.KeyLight',
        guid: keyLight.getGuid(),
        name: 'KeyLight',
        originalChildGUIDs: []
      };

      const geoMetadata: EntityMetadata = {
        entity: geometry,
        path: 'LightingRig.Geometry',
        guid: geometry.getGuid(),
        name: 'Geometry',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('**[light]', lightMetadata)).toBe(true);
      expect(pathMatcher.matches('**[light]', geoMetadata)).toBe(false);
      expect(pathMatcher.matches('LightingRig.*.*[light]', lightMetadata)).toBe(true);
    });

    it('should handle component filter at any position in pattern', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      const metadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('[light]RootNode.Body.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('RootNode[light].Body.Head', metadata)).toBe(true);
      expect(pathMatcher.matches('RootNode.Body[light].Head', metadata)).toBe(true);
      expect(pathMatcher.matches('RootNode.Body.Head[light]', metadata)).toBe(true);
    });
  });

  describe('Predicate functions', () => {
    it('should match using predicate function', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      
      const headMetadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      const armMetadata: EntityMetadata = {
        entity: leftArm,
        path: 'RootNode.Body.LeftArm',
        guid: leftArm.getGuid(),
        name: 'LeftArm',
        originalChildGUIDs: []
      };

      const predicate = (entity: PcEntity) => entity.name.includes('Head');

      expect(pathMatcher.matches(predicate, headMetadata)).toBe(true);
      expect(pathMatcher.matches(predicate, armMetadata)).toBe(false);
    });

    it('should provide entity metadata to predicate', () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      
      const metadata: EntityMetadata = {
        entity: head,
        path: 'RootNode.Body.Head',
        guid: head.getGuid(),
        name: 'Head',
        originalChildGUIDs: []
      };

      const predicate = (_entity: PcEntity, meta: EntityMetadata) => {
        return meta.path.includes('Body');
      };

      expect(pathMatcher.matches(predicate, metadata)).toBe(true);
    });
  });

  describe('Specificity calculation', () => {
    it('should calculate higher specificity for exact paths', () => {
      const exact = pathMatcher.getSpecificity('RootNode.Body.Head');
      const singleWildcard = pathMatcher.getSpecificity('RootNode.*.Head');
      const multiWildcard = pathMatcher.getSpecificity('RootNode.**.Head');

      expect(exact).toBeGreaterThan(singleWildcard);
      expect(singleWildcard).toBeGreaterThan(multiWildcard);
    });

    it('should calculate higher specificity for longer paths', () => {
      const long = pathMatcher.getSpecificity('A.B.C.D');
      const medium = pathMatcher.getSpecificity('A.B.C');
      const short = pathMatcher.getSpecificity('A.B');

      expect(long).toBeGreaterThan(medium);
      expect(medium).toBeGreaterThan(short);
    });

    it('should add specificity for component filters', () => {
      const withFilter = pathMatcher.getSpecificity('RootNode.Body[light]');
      const withoutFilter = pathMatcher.getSpecificity('RootNode.Body');

      expect(withFilter).toBeGreaterThan(withoutFilter);
    });

    it('should give predicates lowest specificity', () => {
      const predicate = () => true;
      const predicateSpec = pathMatcher.getSpecificity(predicate);
      const pathSpec = pathMatcher.getSpecificity('**');

      expect(predicateSpec).toBe(0);
      expect(pathSpec).toBeGreaterThan(predicateSpec);
    });

    it('should calculate expected specificity scores', () => {
      expect(pathMatcher.getSpecificity('A.B.C')).toBe(300); // 3 exact parts
      expect(pathMatcher.getSpecificity('A.*.C')).toBe(210); // 2 exact + 1 single wildcard
      expect(pathMatcher.getSpecificity('A.**.C')).toBe(201); // 2 exact + 1 multi wildcard
      expect(pathMatcher.getSpecificity('A.B[light]')).toBe(250); // 2 exact + component filter
    });
  });

  describe('Edge cases', () => {
    it('should handle empty paths', () => {
      const hierarchy = createSimpleRobot(app);
      const root = hierarchy;
      
      const metadata: EntityMetadata = {
        entity: root,
        path: 'RootNode',
        guid: root.getGuid(),
        name: 'RootNode',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('RootNode', metadata)).toBe(true);
      expect(pathMatcher.matches('**', metadata)).toBe(true);
    });

    it('should handle entities with duplicate names', () => {
      const hierarchy = createDuplicateNamesHierarchy(app);
      
      // Find both "Node" entities
      let nodeInBranch1: PcEntity | null = null;
      let nodeInBranch2: PcEntity | null = null;
      
      const branch1 = findEntityByName(hierarchy, 'Branch1')!;
      nodeInBranch1 = findEntityByName(branch1, 'Node')!;
      
      const branch2 = findEntityByName(hierarchy, 'Branch2')!;
      nodeInBranch2 = findEntityByName(branch2, 'Node')!;
      
      const metadata1: EntityMetadata = {
        entity: nodeInBranch1,
        path: 'Root.Branch1.Node',
        guid: nodeInBranch1.getGuid(),
        name: 'Node',
        originalChildGUIDs: []
      };

      const metadata2: EntityMetadata = {
        entity: nodeInBranch2,
        path: 'Root.Branch2.Node',
        guid: nodeInBranch2.getGuid(),
        name: 'Node',
        originalChildGUIDs: []
      };

      // Path matching should distinguish between them
      expect(pathMatcher.matches('Root.Branch1.Node', metadata1)).toBe(true);
      expect(pathMatcher.matches('Root.Branch1.Node', metadata2)).toBe(false);
      
      expect(pathMatcher.matches('Root.Branch2.Node', metadata2)).toBe(true);
      expect(pathMatcher.matches('Root.Branch2.Node', metadata1)).toBe(false);

      // Wildcards should match both
      expect(pathMatcher.matches('Root.*.Node', metadata1)).toBe(true);
      expect(pathMatcher.matches('Root.*.Node', metadata2)).toBe(true);

      // Component filters should distinguish
      expect(pathMatcher.matches('Root.*.Node[camera]', metadata1)).toBe(true);
      expect(pathMatcher.matches('Root.*.Node[light]', metadata2)).toBe(true);
      expect(pathMatcher.matches('Root.*.Node[camera]', metadata2)).toBe(false);
    });

    it('should handle special characters in entity names', () => {
      const entity = new PcEntity('Node-With_Special.Chars', app);
      
      const metadata: EntityMetadata = {
        entity,
        path: 'Node-With_Special.Chars',
        guid: entity.getGuid(),
        name: 'Node-With_Special.Chars',
        originalChildGUIDs: []
      };

      expect(pathMatcher.matches('Node-With_Special.Chars', metadata)).toBe(true);
    });
  });
});

