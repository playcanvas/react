import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAppEvent } from './use-app-event.ts';
import { Application } from '../Application.tsx';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Note that we can't test the actual firing of the callbacks in tests,
 * because these events are not fire in the Null device type.
 * 
 * It's possible that we can run headless once we have a node-wgpu environment.
 */

describe('useAppEvent', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register and unregister callbacks without throwing', () => {
    const updateCallback = vi.fn();
    const prerenderCallback = vi.fn();
    const postrenderCallback = vi.fn();

    const { unmount } = renderHook(() => {
      useAppEvent('update', updateCallback);
      useAppEvent('prerender', prerenderCallback);
      useAppEvent('postrender', postrenderCallback);
    }, {
      wrapper: ({ children }) => <Application deviceTypes={["null"]}>{children}</Application>
    });

    // Should not throw during registration
    expect(updateCallback).toBeDefined();
    expect(prerenderCallback).toBeDefined();
    expect(postrenderCallback).toBeDefined();

    // Should not throw during cleanup
    unmount();
  });

  it('should throw error if app is not available', () => {
    const mockCallback = vi.fn();
    expect(() => {
      renderHook(() => useAppEvent('update', mockCallback));
    }).toThrow('`useApp` must be used within an Application component');
  });

}); 