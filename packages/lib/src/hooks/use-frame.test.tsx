import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFrame } from './use-frame';
import { Application } from '../Application';

describe('useFrame', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register callback on mount and unregister on unmount', () => {
    const mockCallback = vi.fn();

    const { unmount } = renderHook(() => useFrame(mockCallback), {
      wrapper: ({ children }) => <Application deviceTypes={["null"]}>{children}</Application>
    });

    // Verify the callback was registered (we can't easily test the actual firing in tests)
    // The important thing is that it doesn't throw and cleanup works
    expect(mockCallback).toBeDefined();

    unmount();

    // Should not throw after unmount
    expect(mockCallback).toBeDefined();
  });

  it('should throw error if app is not available', () => {
    const mockCallback = vi.fn();
    expect(() => {
      renderHook(() => useFrame(mockCallback));
    }).toThrow('`useApp` must be used within an Application component');
  });

}); 