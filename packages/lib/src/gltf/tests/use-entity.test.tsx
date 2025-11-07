import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Application as PcApplication, Entity as PcEntity, NullGraphicsDevice } from 'playcanvas';
import React from 'react';
import { useEntity } from '../hooks/use-entity.tsx';
import { GltfContext } from '../context.tsx';
import { Application } from '../../Application.tsx';
import { ParentContext } from '../../hooks/use-parent.tsx';
import {
  createSimpleRobot,
  createComplexScene,
  createLightingScene
} from '../../../test/fixtures/gltf-hierarchies.ts';
import { findEntityByName } from '../../../test/utils/gltf-entity-builder.ts';
import { EntityMetadata } from '../utils/path-matcher.ts';
import { PathMatcher } from '../utils/path-matcher.ts';

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

  const originalChildGUIDs = entity.children.map((child) => (child as PcEntity).getGuid());

  cache.set(guid, {
    entity,
    path,
    guid,
    name: entity.name,
    originalChildGUIDs
  });

  // Recursively process children
  for (const child of entity.children) {
    buildHierarchyCache(child as PcEntity, path, cache);
  }
}

/**
 * Test component that wraps useEntity with necessary context
 */
function TestComponent({ 
  path, 
  onResult 
}: { 
  path: string | ((entity: PcEntity, metadata: EntityMetadata) => boolean);
  onResult: (result: PcEntity | PcEntity[] | null) => void;
}) {
  const result = useEntity(path);
  React.useEffect(() => {
    onResult(result);
  }, [result]);
  return null;
}

/**
 * Wrapper component that provides Gltf context and Parent context
 */
function GltfWrapper({ 
  rootEntity, 
  children 
}: { 
  rootEntity: PcEntity; 
  children: React.ReactNode;
}) {
  const cache = React.useMemo(() => {
    const c = new Map<string, EntityMetadata>();
    buildHierarchyCache(rootEntity, '', c);
    return c;
  }, [rootEntity]);

  const contextValue = React.useMemo(() => ({
    hierarchyCache: cache,
    rootEntity: rootEntity,
    pathMatcher: new PathMatcher(),
    registerRule: () => {},
    unregisterRule: () => {}
  }), [cache, rootEntity]);

  return (
    <GltfContext.Provider value={contextValue}>
      <ParentContext.Provider value={rootEntity}>
        {children}
      </ParentContext.Provider>
    </GltfContext.Provider>
  );
}

describe('useEntity hook', () => {
  let app: PcApplication;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    app = new PcApplication(canvas, {
      graphicsDevice: new NullGraphicsDevice(canvas)
    });
  });

  describe('Exact path matching', () => {
    it('should find entity by exact path', async () => {
      const hierarchy = createSimpleRobot(app);
      const expectedHead = findEntityByName(hierarchy, 'Head')!;

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="Body.Head" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(result).toBe(expectedHead);
      });
    });

    it('should return null for non-matching path', async () => {
      const hierarchy = createSimpleRobot(app);

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="Body.NonExistent" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeNull();
      });
    });

    it('should find nested entities', async () => {
      const hierarchy = createComplexScene(app);
      const expectedEyes = findEntityByName(hierarchy, 'Eyes')!;

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="Characters.Player.Body.Head.Eyes" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(result).toBe(expectedEyes);
      });
    });
  });

  describe('Single-level wildcard (*)', () => {
    it('should match all direct children with *', async () => {
      const hierarchy = createSimpleRobot(app);
      const body = findEntityByName(hierarchy, 'Body')!;
      const expectedChildren = body.children as PcEntity[];

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="Body.*" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect((result as PcEntity[]).length).toBe(expectedChildren.length);
        expect((result as PcEntity[])).toContain(expectedChildren[0]);
        expect((result as PcEntity[])).toContain(expectedChildren[1]);
        expect((result as PcEntity[])).toContain(expectedChildren[2]);
      });
    });

    it('should return null when no children match', async () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      // Head has no children, so * should return null

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <ParentContext.Provider value={head}>
              <TestComponent path="*" onResult={onResult} />
            </ParentContext.Provider>
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeNull();
      });
    });

    it('should match nested paths with wildcard', async () => {
      const hierarchy = createComplexScene(app);
      const characters = findEntityByName(hierarchy, 'Characters')!;
      const expectedChildren = characters.children as PcEntity[];

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="Characters.*" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect((result as PcEntity[]).length).toBe(expectedChildren.length);
      });
    });
  });

  describe('Multi-level wildcard (**)', () => {
    it('should match all descendants with **', async () => {
      const hierarchy = createSimpleRobot(app);

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="Body.**" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        // Body has Head, LeftArm, RightArm as direct children
        // So ** should return all 3
        expect((result as PcEntity[]).length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should match zero or more levels with **', async () => {
      const hierarchy = createComplexScene(app);

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="Characters.Player.**.Head" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        // Should find Head at Characters.Player.Body.Head
        if (Array.isArray(result)) {
          expect(result.length).toBeGreaterThan(0);
        } else {
          expect(result).not.toBeNull();
        }
      });
    });

    it('should return null when ** matches nothing', async () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <ParentContext.Provider value={head}>
              <TestComponent path="**.NonExistent" onResult={onResult} />
            </ParentContext.Provider>
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeNull();
      });
    });
  });

  describe('Predicate functions', () => {
    it('should find entities matching predicate', async () => {
      const hierarchy = createLightingScene(app);

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent 
              path={(entity) => entity.c?.light !== undefined} 
              onResult={onResult} 
            />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        // Should find all entities with light components
        expect((result as PcEntity[]).length).toBeGreaterThan(0);
        // Verify all results have light components
        (result as PcEntity[]).forEach(entity => {
          expect(entity.c?.light).toBeDefined();
        });
      });
    });

    it('should find entities by name predicate', async () => {
      const hierarchy = createSimpleRobot(app);
      const expectedHead = findEntityByName(hierarchy, 'Head')!;

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent 
              path={(entity) => entity.name === 'Head'} 
              onResult={onResult} 
            />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        if (Array.isArray(result)) {
          expect(result).toContain(expectedHead);
        } else {
          expect(result).toBe(expectedHead);
        }
      });
    });

    it('should return null when predicate matches nothing', async () => {
      const hierarchy = createSimpleRobot(app);

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent 
              path={(entity) => entity.name === 'NonExistent'} 
              onResult={onResult} 
            />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeNull();
      });
    });

    it('should use metadata in predicate', async () => {
      const hierarchy = createSimpleRobot(app);

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent 
              path={(entity, metadata) => metadata.path.includes('Head')} 
              onResult={onResult} 
            />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        if (Array.isArray(result)) {
          expect(result.length).toBeGreaterThan(0);
        } else {
          expect(result).not.toBeNull();
        }
      });
    });
  });

  describe('Edge cases', () => {
    it('should return null for empty path', async () => {
      const hierarchy = createSimpleRobot(app);

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeNull();
      });
    });

    it('should support component filters', async () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      const body = findEntityByName(hierarchy, 'Body')!;
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="**[light]" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        // Component filter with ** should return array (wildcard pattern)
        expect(Array.isArray(result)).toBe(true);
        const resultArray = result as PcEntity[];
        // Should find Head which has a light component
        expect(resultArray.length).toBeGreaterThan(0);
        expect(resultArray.some(e => e === head)).toBe(true);
        // Should not find Body or LeftArm (they don't have lights)
        expect(resultArray.some(e => e === body)).toBe(false);
        expect(resultArray.some(e => e === leftArm)).toBe(false);
      });
    });

    it('should support component filters with wildcards', async () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      const body = findEntityByName(hierarchy, 'Body')!;
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      const rightArm = findEntityByName(hierarchy, 'RightArm')!;

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="*[render]" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        const resultArray = result as PcEntity[];
        // *[render] from RootNode should only match direct children with render
        // Body is the only direct child of RootNode with render
        expect(resultArray.length).toBe(1);
        expect(resultArray).toContain(body);
        // Should not find Head, LeftArm, RightArm (they're nested, not direct children)
        expect(resultArray).not.toContain(head);
        expect(resultArray).not.toContain(leftArm);
        expect(resultArray).not.toContain(rightArm);
      });
    });

    it('should support component filters with multi-level wildcards', async () => {
      const hierarchy = createSimpleRobot(app);
      const head = findEntityByName(hierarchy, 'Head')!;
      const body = findEntityByName(hierarchy, 'Body')!;
      const leftArm = findEntityByName(hierarchy, 'LeftArm')!;
      const rightArm = findEntityByName(hierarchy, 'RightArm')!;

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <TestComponent path="**[render]" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        const resultArray = result as PcEntity[];
        // **[render] should match all descendants with render components
        expect(resultArray.length).toBeGreaterThanOrEqual(3);
        expect(resultArray).toContain(body);
        expect(resultArray).toContain(head);
        expect(resultArray).toContain(leftArm);
        expect(resultArray).toContain(rightArm);
      });
    });

    it('should handle empty hierarchy', async () => {
      const rootEntity = new PcEntity('EmptyRoot', app);

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={rootEntity}>
            <TestComponent path="*" onResult={onResult} />
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeNull();
      });
    });

    it('should handle relative paths correctly', async () => {
      const hierarchy = createComplexScene(app);
      const player = findEntityByName(hierarchy, 'Player')!;
      const expectedHead = findEntityByName(hierarchy, 'Head')!;

      let result: PcEntity | PcEntity[] | null = null;
      const onResult = (r: PcEntity | PcEntity[] | null) => {
        result = r;
      };

      render(
        <Application deviceTypes={['null']}>
          <GltfWrapper rootEntity={hierarchy}>
            <ParentContext.Provider value={player}>
              <TestComponent path="Body.Head" onResult={onResult} />
            </ParentContext.Provider>
          </GltfWrapper>
        </Application>
      );

      await waitFor(() => {
        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        // Verify it found the Head entity (could be array or single entity)
        if (Array.isArray(result)) {
          expect(result).toContain(expectedHead);
        } else {
          expect(result).toBe(expectedHead);
        }
      });
    });
  });
});

