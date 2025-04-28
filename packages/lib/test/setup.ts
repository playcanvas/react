import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import * as playcanvas from 'playcanvas'
import { toHaveBeenCalledWithEvent } from './matchers';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Add custom matchers
expect.extend({
  toHaveBeenCalledWithProps(mock: ReturnType<typeof vi.fn>, props: Record<string, unknown>) {
    const pass = this.equals(mock.mock.calls[0][0], props);
    return {
      pass,
      message: () => 
        `expected ${mock.getMockName()} to have been called with ${JSON.stringify(props)}`
    };
  },
  toHaveBeenCalledWithEvent,
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Set NODE_ENV to test
vi.stubEnv('NODE_ENV', 'test');

// Create test application with spi `es
const createTestApp = (actual: typeof playcanvas) => {

  const canvas = document.createElement('canvas');

  const app = new actual.Application(canvas, {
    graphicsDevice: new actual.NullGraphicsDevice(canvas),
    touch: new actual.TouchDevice(canvas),
    mouse: new actual.Mouse(canvas)
  });

  // Spies
  vi.spyOn(app, 'start');
  vi.spyOn(app, 'destroy');
  vi.spyOn(app, 'setCanvasFillMode');
  vi.spyOn(app, 'setCanvasResolution');
  vi.spyOn(app as playcanvas.EventHandler, 'on');
  vi.spyOn(app as playcanvas.EventHandler, 'off');
  vi.spyOn(app.root, 'addChild');
  vi.spyOn(app.root, 'removeChild');
  vi.spyOn(app.graphicsDevice as playcanvas.EventHandler, 'on');
  vi.spyOn(app.graphicsDevice as playcanvas.EventHandler, 'off');
  vi.spyOn(app.mouse as playcanvas.EventHandler, 'on');
  vi.spyOn(app.mouse as playcanvas.EventHandler, 'off');
  vi.spyOn(app.touch as playcanvas.EventHandler, 'on');
  vi.spyOn(app.touch as playcanvas.EventHandler, 'off');

  return app;
};

vi.mock('playcanvas', async () => {
  const actual = await vi.importActual<typeof import('playcanvas')>('playcanvas');

  const MockApplication = vi.fn().mockImplementation(() => {
    return createTestApp(actual);
  });

  return {
    ...actual,
    Application: MockApplication,
  };
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})); 