import { describe, it, expect, beforeEach } from 'vitest';
import { Application as PcApplication, Entity as PcEntity, NullGraphicsDevice } from 'playcanvas';
import {
  createSimpleRobot,
  createComplexScene,
  createEmptyHierarchy,
  createDeepHierarchy
} from '../../../test/fixtures/gltf-hierarchies.ts';
import {
  findEntityByName,
  countEntities,
  getAllPaths
} from '../../../test/utils/gltf-entity-builder.ts';
import { EntityMetadata } from '../utils/path-matcher.ts';

/**
 * Helper function to build hierarchy cache (extracted from Gltf component)
 */
function buildHierarchyCache(
  entity: PcEntity,
  parentPath: string,
  cache: Map<string, EntityMetadata>
): void {
  const path = parentPath ? `${parentPath}.${entity.name}` : entity.name;
  const guid = entity.getGuid();

  cache.set(guid, {
    entity,
    path,
    guid,
    name: entity.name
  });

  // Recursively process children
  for (const child of entity.children) {
    buildHierarchyCache(child as PcEntity, path, cache);
  }
}

describe('Hierarchy Cache Building', () => {
  let app: PcApplication;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    app = new PcApplication(canvas, {
      graphicsDevice: new NullGraphicsDevice(canvas)
    });
  });

  describe('Basic cache building', () => {
    it('should build cache for simple hierarchy', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      // Simple robot has: RootNode + Body + Head + LeftArm + RightArm = 5 entities
      expect(cache.size).toBe(5);
    });

    it('should store correct entity references', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const head = findEntityByName(root, 'Head')!;
      const headGuid = head.getGuid();
      const headMetadata = cache.get(headGuid);

      expect(headMetadata).toBeDefined();
      expect(headMetadata!.entity).toBe(head);
      expect(headMetadata!.name).toBe('Head');
    });

    it('should generate correct paths', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const head = findEntityByName(root, 'Head')!;
      const headGuid = head.getGuid();
      const headMetadata = cache.get(headGuid);

      expect(headMetadata!.path).toBe('RootNode.Body.Head');

      const body = findEntityByName(root, 'Body')!;
      const bodyGuid = body.getGuid();
      const bodyMetadata = cache.get(bodyGuid);

      expect(bodyMetadata!.path).toBe('RootNode.Body');
    });

    it('should handle root entity correctly', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const rootGuid = root.getGuid();
      const rootMetadata = cache.get(rootGuid);

      expect(rootMetadata).toBeDefined();
      expect(rootMetadata!.path).toBe('RootNode');
      expect(rootMetadata!.name).toBe('RootNode');
    });
  });

  describe('Complex hierarchies', () => {
    it('should build cache for complex scene', () => {
      const root = createComplexScene(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      // Verify cache size matches entity count
      const expectedCount = countEntities(root);
      expect(cache.size).toBe(expectedCount);
      expect(cache.size).toBeGreaterThan(10); // Complex scene has many entities
    });

    it('should handle deep nesting', () => {
      const root = createDeepHierarchy(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const deepNode = findEntityByName(root, 'DeepNode')!;
      const deepGuid = deepNode.getGuid();
      const deepMetadata = cache.get(deepGuid);

      expect(deepMetadata).toBeDefined();
      expect(deepMetadata!.path).toBe('Level0.Level1.Level2.Level3.Level4.DeepNode');
    });

    it('should generate unique GUIDs for all entities', () => {
      const root = createComplexScene(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const guids = Array.from(cache.keys());
      const uniqueGuids = new Set(guids);

      expect(guids.length).toBe(uniqueGuids.size);
    });
  });

  describe('Path generation', () => {
    it('should generate paths for all entities', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const paths = Array.from(cache.values()).map(m => m.path);
      const expectedPaths = getAllPaths(root);

      expect(paths.sort()).toEqual(expectedPaths.sort());
    });

    it('should use dot notation for path segments', () => {
      const root = createComplexScene(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const eyes = findEntityByName(root, 'Eyes')!;
      const eyesGuid = eyes.getGuid();
      const eyesMetadata = cache.get(eyesGuid);

      expect(eyesMetadata!.path).toContain('.');
      expect(eyesMetadata!.path.split('.').length).toBeGreaterThan(1);
    });

    it('should handle entities at different depths', () => {
      const root = createComplexScene(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      // Scene (depth 0)
      const scene = root;
      const sceneMetadata = cache.get(scene.getGuid());
      expect(sceneMetadata!.path).toBe('Scene');

      // Environment (depth 1)
      const environment = findEntityByName(root, 'Environment')!;
      const envMetadata = cache.get(environment.getGuid());
      expect(envMetadata!.path).toBe('Scene.Environment');

      // Sun (depth 2)
      const sun = findEntityByName(root, 'Sun')!;
      const sunMetadata = cache.get(sun.getGuid());
      expect(sunMetadata!.path).toBe('Scene.Environment.Sun');
    });
  });

  describe('Entity metadata', () => {
    it('should store all required metadata fields', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const head = findEntityByName(root, 'Head')!;
      const headMetadata = cache.get(head.getGuid());

      expect(headMetadata).toHaveProperty('entity');
      expect(headMetadata).toHaveProperty('path');
      expect(headMetadata).toHaveProperty('guid');
      expect(headMetadata).toHaveProperty('name');
    });

    it('should preserve entity component information', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const head = findEntityByName(root, 'Head')!;
      const headMetadata = cache.get(head.getGuid());

      // Head should have light component
      expect(headMetadata!.entity.c.light).toBeDefined();
    });

    it('should maintain parent-child relationships', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const body = findEntityByName(root, 'Body')!;
      const head = findEntityByName(root, 'Head')!;

      // Verify parent-child relationship is maintained through entity reference
      expect(head.parent).toBe(body);
      
      const headMetadata = cache.get(head.getGuid());
      expect(headMetadata!.entity.parent).toBe(body);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty hierarchy (single node)', () => {
      const root = createEmptyHierarchy(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      expect(cache.size).toBe(1);
      const rootMetadata = cache.get(root.getGuid());
      expect(rootMetadata!.path).toBe('Empty');
    });

    it('should handle entities with no components', () => {
      const root = createEmptyHierarchy(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const rootMetadata = cache.get(root.getGuid());
      expect(rootMetadata).toBeDefined();
      expect(rootMetadata!.entity).toBe(root);
    });

    it('should be lookupable by GUID', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const head = findEntityByName(root, 'Head')!;
      const guid = head.getGuid();

      expect(cache.has(guid)).toBe(true);
      expect(cache.get(guid)!.entity).toBe(head);
    });

    it('should handle multiple entities with same name', () => {
      const root = createComplexScene(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      // Find all "Head" entities
      const headsInCache = Array.from(cache.values()).filter(
        m => m.name === 'Head'
      );

      expect(headsInCache.length).toBeGreaterThan(1);
      
      // Each should have unique path
      const paths = headsInCache.map(m => m.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });
  });

  describe('Cache querying', () => {
    it('should allow finding entities by component type', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const entitiesWithLight = Array.from(cache.values()).filter(
        m => m.entity.c?.light
      );

      expect(entitiesWithLight.length).toBe(1);
      expect(entitiesWithLight[0].name).toBe('Head');
    });

    it('should allow finding entities by path pattern', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const bodyChildren = Array.from(cache.values()).filter(
        m => m.path.startsWith('RootNode.Body.') && m.path !== 'RootNode.Body'
      );

      expect(bodyChildren.length).toBe(3); // Head, LeftArm, RightArm
    });

    it('should allow finding entities by name', () => {
      const root = createSimpleRobot(app);
      const cache = new Map<string, EntityMetadata>();

      buildHierarchyCache(root, '', cache);

      const heads = Array.from(cache.values()).filter(m => m.name === 'Head');

      expect(heads.length).toBe(1);
      expect(heads[0].path).toBe('RootNode.Body.Head');
    });
  });

  describe('Performance characteristics', () => {
    it('should traverse hierarchy only once', () => {
      const root = createComplexScene(app);
      const cache = new Map<string, EntityMetadata>();

      // Count how many entities we visit
      let visitCount = 0;
      const originalSet = Map.prototype.set;
      Map.prototype.set = function(...args) {
        visitCount++;
        return originalSet.apply(this, args);
      };

      buildHierarchyCache(root, '', cache);

      Map.prototype.set = originalSet;

      // We should visit each entity exactly once
      expect(visitCount).toBe(cache.size);
    });

    it('should handle large hierarchies efficiently', () => {
      const root = createComplexScene(app);
      const cache = new Map<string, EntityMetadata>();

      const startTime = performance.now();
      buildHierarchyCache(root, '', cache);
      const endTime = performance.now();

      // Should complete quickly (< 100ms for complex scene)
      expect(endTime - startTime).toBeLessThan(100);
      expect(cache.size).toBeGreaterThan(0);
    });
  });
});

