import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import { Application, ApplicationWithoutCanvas } from './Application.tsx';

describe('Application', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('The Application component renders with default props', () => {
    render(<Application deviceTypes={["null"]} />);
  
    const canvas = screen.getByLabelText('Interactive 3D Scene');
    expect(canvas).toBeInTheDocument();
  });

  it('The Application component applies className prop correctly', () => {
    render(<Application className="test-class" deviceTypes={["null"]} />);

    const canvas = screen.getByLabelText('Interactive 3D Scene');
    expect(canvas).toHaveClass('test-class');
  });

  it('The Application component applies style prop correctly', () => {
    render(<Application style={{ width: '200px', height: '200px' }} deviceTypes={["null"]} />);

    const canvas = screen.getByLabelText('Interactive 3D Scene');
    expect(canvas).toHaveStyle({ width: '200px', height: '200px' });
  });
  
  
  it('warns when invalid deviceTypes prop is provided', async () => {
    // Spy on console.warn
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    try {
      // @ts-expect-error - we want to test the warning
      render(<Application deviceTypes={['invalid_device_type']} />);

      // Wait for the warning appears
      await vi.waitFor(() =>
        expect(warnSpy).toHaveBeenCalledWith(
          "%c[PlayCanvas React]:",
          expect.any(String),                          // the CSS string
          expect.stringContaining(
            'deviceTypes must be an array containing one or more of:'
          )
        )
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it.skip('The Application component applies canvasRef prop correctly', () => {
    const canvasRef = { current: document.createElement('canvas') };
    canvasRef.current.setAttribute('aria-label', 'test-canvas');
    render(<ApplicationWithoutCanvas canvasRef={canvasRef} deviceTypes={["null"]} />);

    const canvas = screen.getByLabelText('test-canvas');
    expect(canvas).toBe(canvasRef.current);
  });

  it.skip('validates prop types correctly', async () => {
    const messages: string[] = [];
    const originalWarn = console.warn;
    const originalLog = console.log;
    
    // Mute console output
    console.warn = vi.fn((...args: (string | number | boolean)[]) => {
      const message = args.join(' ');
      messages.push(message);
    });
    console.log = vi.fn();
    
    // Test invalid graphicsDeviceOptions
    render(
      <Application
        graphicsDeviceOptions={{
          // powerPreference: 'invalid' as string
        }}
      />
    );

    // Wait for the async warning
    await vi.waitFor(() => {
      const hasWarning = messages.some(msg => msg.includes('Invalid value for prop "graphicsDeviceOptions"'));
      expect(hasWarning).toBe(true);
    });

    // Restore console
    console.warn = originalWarn;
    console.log = originalLog;
  });

  it.skip('cleans up resources on unmount', () => {
    const { unmount } = render(<Application />);

    unmount();

    // Verify that cleanup functions were called
    expect(vi.mocked(window.ResizeObserver)).toHaveBeenCalled();
  });

}); 