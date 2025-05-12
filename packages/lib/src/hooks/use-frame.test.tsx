import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFrame } from './use-frame';
import { Application } from '../Application';

async function nextFrame(ms = 16) {
    vi.advanceTimersByTime(ms);
    // Let microtasks flush
    await Promise.resolve();
}

describe('useFrame', () => {

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should register callback on mount and unregister on unmount', async () => {

    const mockCallback = vi.fn();

    const { unmount } = renderHook(() => useFrame(mockCallback), {
      wrapper: ({ children }) => <Application>{children}</Application>
    });

    await nextFrame(); 

    // Verify the callback was called with the correct delta time
    expect(mockCallback).toHaveBeenCalledTimes(1);

    unmount();

    await nextFrame();

    // unmount and should not be called
    expect(mockCallback).toHaveBeenCalledTimes(1);

  });

  it('should throw error if app is not available', () => {
    const mockCallback = vi.fn();
    expect(() => {
      renderHook(() => useFrame(mockCallback));
    }).toThrow('`useApp` must be used within an Application component');
  });

}); 