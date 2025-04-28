export const TEST_ENTITY_PROPS = {
  name: 'TestEntity',
  position: [1, 2, 3] as [number, number, number],
  scale: [2, 2, 2] as [number, number, number],
  rotation: [45, 0, 0] as [number, number, number]
};

export const TEST_APPLICATION_PROPS = {
  canvas: document.createElement('canvas'),
  graphicsDeviceOptions: {
    alpha: true,
    depth: true,
    antialias: true,
    preferWebGl2: true,
    powerPreference: 'high-performance' as const
  }
};

export const TEST_CANVAS_DIMENSIONS = {
  style: {
    width: 800,
    height: 600
  }
}; 