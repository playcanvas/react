import { Entity as PcEntity, Asset } from 'playcanvas';

/**
 * Creates a mock GLTF Asset that wraps a PlayCanvas entity hierarchy
 * This simulates what useModel returns, but with our test hierarchies
 * 
 * @param hierarchy - The root entity of the hierarchy
 * @param id - Optional asset ID (defaults to random number)
 * @returns A mock Asset object compatible with Gltf
 */
export function createMockGltfAsset(
  hierarchy: PcEntity,
  id: number = Math.floor(Math.random() * 1000000)
): Asset {
  // Create a mock asset that mimics the structure returned by PlayCanvas asset loader
  const mockAsset = {
    id,
    name: `MockAsset_${id}`,
    type: 'container',
    resource: {
      instantiateRenderEntity: () => {
        // Return the hierarchy directly to prevent test pollution
        return hierarchy;
      }
    },
    // Add other Asset properties as needed for testing
    loaded: true,
    loading: false,
    file: null,
    data: null
  } as unknown as Asset;

  return mockAsset;
}

/**
 * Creates a mock Asset that returns a fresh clone each time
 * Useful when you need multiple independent instances
 * 
 * @param hierarchyFactory - Function that creates a fresh hierarchy
 * @param id - Optional asset ID
 * @returns A mock Asset object
 */
export function createMockGltfAssetWithFactory(
  hierarchyFactory: () => PcEntity,
  id: number = Math.floor(Math.random() * 10000)
): Asset {
  const mockAsset = {
    id,
    name: `MockAsset_${id}`,
    type: 'container',
    resource: {
      instantiateRenderEntity: () => {
        return hierarchyFactory();
      }
    },
    loaded: true,
    loading: false,
    file: null,
    data: null
  } as unknown as Asset;

  return mockAsset;
}

/**
 * Creates a mock Asset that tracks instantiation calls
 * Useful for testing lazy instantiation behavior
 * 
 * @param hierarchy - The root entity
 * @param id - Optional asset ID
 * @returns Mock asset with call tracking
 */
export function createMockGltfAssetWithTracking(
  hierarchy: PcEntity,
  id: number = Math.floor(Math.random() * 10000)
): { asset: Asset; instantiateCalls: number } {
  const tracking = {
    instantiateCalls: 0
  };

  const mockAsset = {
    id,
    name: `MockAsset_${id}`,
    type: 'container',
    resource: {
      instantiateRenderEntity: () => {
        tracking.instantiateCalls++;
        return hierarchy;
      }
    },
    loaded: true,
    loading: false,
    file: null,
    data: null
  } as unknown as Asset;

  return {
    asset: mockAsset,
    instantiateCalls: tracking.instantiateCalls
  };
}

/**
 * Creates a mock Asset that simulates loading state
 * Useful for testing loading behavior
 * 
 * @param hierarchy - The root entity
 * @param id - Optional asset ID
 * @param initiallyLoaded - Whether the asset starts loaded
 * @returns Mock asset with load control
 */
export function createMockLoadingGltfAsset(
  hierarchy: PcEntity,
  id: number = Math.floor(Math.random() * 10000),
  initiallyLoaded: boolean = false
): { asset: Asset; setLoaded: (loaded: boolean) => void } {
  let loaded = initiallyLoaded;
  let resource = initiallyLoaded
    ? {
        instantiateRenderEntity: () => hierarchy
      }
    : null;

  const mockAsset = {
    id,
    name: `MockAsset_${id}`,
    type: 'container',
    get resource() {
      return resource;
    },
    get loaded() {
      return loaded;
    },
    loading: !loaded,
    file: null,
    data: null
  } as unknown as Asset;

  const setLoaded = (isLoaded: boolean) => {
    loaded = isLoaded;
    resource = isLoaded
      ? {
          instantiateRenderEntity: () => hierarchy
        }
      : null;
  };

  return {
    asset: mockAsset,
    setLoaded
  };
}

