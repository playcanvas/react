import { vi } from 'vitest';
import type { Application as PlayCanvasApplication } from 'playcanvas';
import { NullGraphicsDevice } from 'playcanvas';

export type MockApplication = {
  start: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  setCanvasFillMode: ReturnType<typeof vi.fn>;
  setCanvasResolution: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  root: {
    addChild: ReturnType<typeof vi.fn>;
    removeChild: ReturnType<typeof vi.fn>;
  };
  device: {
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };
  graphicsDevice: NullGraphicsDevice;
  mouse: {
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };
  touch: {
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
  };
  picker: {
    prepare: ReturnType<typeof vi.fn>;
    getSelectionAsync: ReturnType<typeof vi.fn>;
    resize: ReturnType<typeof vi.fn>;
  };
};

export const mockApplication = (): PlayCanvasApplication => {
  const mockCanvas = document.createElement('canvas');
  mockCanvas.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => ({})
  });

  const mockPicker = {
    prepare: vi.fn(),
    getSelectionAsync: vi.fn().mockResolvedValue([null]),
    resize: vi.fn()
  };

  const mockApp = {
    start: vi.fn(),
    destroy: vi.fn(),
    setCanvasFillMode: vi.fn(),
    setCanvasResolution: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    root: {
      addChild: vi.fn(),
      removeChild: vi.fn()
    },
    device: {
      on: vi.fn(),
      off: vi.fn()
    },
    graphicsDevice: new NullGraphicsDevice(mockCanvas),
    mouse: {
      on: vi.fn(),
      off: vi.fn()
    },
    touch: {
      on: vi.fn(),
      off: vi.fn()
    },
    picker: mockPicker
  };

  return mockApp as unknown as PlayCanvasApplication;
};

export const mockPlayCanvas = () => {
  const mockCanvas = document.createElement('canvas');
  mockCanvas.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    x: 0,
    y: 0,
    toJSON: () => ({})
  });

  const mockPicker = {
    prepare: vi.fn(),
    getSelectionAsync: vi.fn().mockResolvedValue([null]),
    resize: vi.fn()
  };

  const mockApp = {
    start: vi.fn(),
    destroy: vi.fn(),
    setCanvasFillMode: vi.fn(),
    setCanvasResolution: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    root: {
      addChild: vi.fn(),
      removeChild: vi.fn()
    },
    device: {
      on: vi.fn(),
      off: vi.fn()
    },
    graphicsDevice: new NullGraphicsDevice(mockCanvas),
    mouse: {
      on: vi.fn(),
      off: vi.fn()
    },
    touch: {
      on: vi.fn(),
      off: vi.fn()
    },
    picker: mockPicker
  };

  return {
    FILLMODE_NONE: 'NONE',
    FILLMODE_FILL_WINDOW: 'FILL_WINDOW',
    FILLMODE_KEEP_ASPECT: 'KEEP_ASPECT',
    RESOLUTION_AUTO: 'AUTO',
    RESOLUTION_FIXED: 'FIXED',
    Application: vi.fn().mockImplementation(() => mockApp),
    Mouse: vi.fn(),
    TouchDevice: vi.fn(),
    Entity: vi.fn(),
    NullGraphicsDevice: vi.fn().mockImplementation((canvas) => new NullGraphicsDevice(canvas))
  };
};

vi.mock('playcanvas', () => mockPlayCanvas()); 