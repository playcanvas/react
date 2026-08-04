import { describe, it, expect } from 'vitest';

/**
 * Regression tests for https://github.com/playcanvas/react/issues/335
 *
 * `getNullApplication()` runs at module scope, so importing the package must
 * succeed in a DOM-less Node process (SSR / static site generation). Engine
 * 2.20.0–2.20.4 crashed at import time because the GraphicsDevice constructor
 * called `getBoundingClientRect()` on the mock canvas.
 *
 * These tests run in a plain `node` environment (see vitest.config.ts) with no
 * jsdom and no playcanvas mocks — the same conditions as an SSG build.
 */
describe('DOM-less import (SSR)', () => {
  it('imports the package entry point without a DOM', async () => {
    await expect(import('../index.ts')).resolves.toBeDefined();
  });

  it('mock canvas answers the engine\'s layout probe', async () => {
    const { getNullApplication } = await import('./validation.ts');
    const app = getNullApplication();

    // The same call the GraphicsDevice constructor makes in engine 2.20.0+.
    expect(() => app.graphicsDevice.updateClientRect()).not.toThrow();
    expect(app.graphicsDevice.clientRect.width).toBe(0);
    expect(app.graphicsDevice.clientRect.height).toBe(0);
  });
});
