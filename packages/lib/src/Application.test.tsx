import { render, screen, waitFor } from '@testing-library/react';
import type { Application as PlayCanvasApplication } from 'playcanvas';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
// eslint-disable-next-line import-x/order -- preserve the existing side-effect import order
import React, { useEffect } from 'react';

import { Application, ApplicationWithoutCanvas } from './Application.tsx';
import { useApp } from './hooks/use-app.tsx';

// Hands the PlayCanvas app to the test once the Application has created it
const AppProbe = ({ onApp }: { onApp: (app: PlayCanvasApplication) => void }) => {
    const app = useApp();
    useEffect(() => {
        onApp(app);
    }, [app, onApp]);
    return null;
};

describe('Application', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('The Application component renders with default props', () => {
        render(<Application deviceTypes={['null']} />);

        const canvas = screen.getByLabelText('Interactive 3D Scene');
        expect(canvas).toBeInTheDocument();
    });

    it('The Application component applies className prop correctly', () => {
        render(<Application className="test-class" deviceTypes={['null']} />);

        const canvas = screen.getByLabelText('Interactive 3D Scene');
        expect(canvas).toHaveClass('test-class');
    });

    it('The Application component applies style prop correctly', () => {
        render(<Application style={{ width: '200px', height: '200px' }} deviceTypes={['null']} />);

        const canvas = screen.getByLabelText('Interactive 3D Scene');
        expect(canvas).toHaveStyle({ width: '200px', height: '200px' });
    });

    it('warns when invalid deviceTypes prop is provided', async () => {
        // Spy on console.warn
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        try {
            // @ts-expect-error - we want to test the warning
            render(<Application deviceTypes={['invalid_device_type']} />);

            // Wait for the warning appears
            await vi.waitFor(() =>
                expect(warnSpy).toHaveBeenCalledWith(
                    '%c[PlayCanvas React]:',
                    expect.any(String), // the CSS string
                    expect.stringContaining('deviceTypes must be an array containing one or more of:')
                )
            );
        } finally {
            warnSpy.mockRestore();
        }
    });

    describe('maxPixelRatio', () => {
        // The Null graphics device used in tests defaults to a ratio of 1
        const DEFAULT_RATIO = 1;

        beforeEach(() => {
            // Render on a 3x display
            vi.stubGlobal('devicePixelRatio', 3);
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        // Stands in for matchMedia, and keeps each query's change listeners so a test can fire them
        const stubMatchMedia = () => {
            const queries: { media: string; listeners: Set<() => void> }[] = [];
            vi.stubGlobal('matchMedia', (media: string) => {
                const listeners = new Set<() => void>();
                queries.push({ media, listeners });
                return {
                    media,
                    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
                    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener)
                };
            });
            return queries;
        };

        // Renders an Application and waits for its app to exist. Resolves with the app's graphics
        // device and a function that re-renders the same Application with a new maxPixelRatio.
        const renderApplication = async (maxPixelRatio?: number) => {
            const onApp = vi.fn();
            const tree = (ratio?: number) => (
                <Application deviceTypes={['null']} maxPixelRatio={ratio}>
                    <AppProbe onApp={onApp} />
                </Application>
            );

            const { rerender } = render(tree(maxPixelRatio));
            await waitFor(() => expect(onApp).toHaveBeenCalled());

            const app: PlayCanvasApplication = onApp.mock.calls[0][0];
            return {
                device: app.graphicsDevice,
                setMaxPixelRatio: (ratio?: number) => rerender(tree(ratio))
            };
        };

        it('sets the graphics device maxPixelRatio', async () => {
            const { device } = await renderApplication(2);

            expect(device.maxPixelRatio).toBe(2);
        });

        it.each([4, Infinity])('caps maxPixelRatio %s at the display pixel ratio', async (ratio) => {
            const { device } = await renderApplication(ratio);

            expect(device.maxPixelRatio).toBe(3);
        });

        it.each([
            [2, 400, 200],
            [4, 600, 300]
        ])('sizes the canvas for maxPixelRatio %s', async (ratio, width, height) => {
            const clientWidth = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(200);
            const clientHeight = vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(100);

            try {
                const { device } = await renderApplication(ratio);

                expect([device.canvas.width, device.canvas.height]).toEqual([width, height]);
            } finally {
                clientWidth.mockRestore();
                clientHeight.mockRestore();
            }
        });

        it('updates the graphics device maxPixelRatio when the prop changes', async () => {
            const { device, setMaxPixelRatio } = await renderApplication(2);

            setMaxPixelRatio(1.5);

            expect(device.maxPixelRatio).toBe(1.5);
        });

        it('keeps the graphics device default when maxPixelRatio is omitted', async () => {
            const { device } = await renderApplication();

            expect(device.maxPixelRatio).toBe(DEFAULT_RATIO);
        });

        it('restores the graphics device default when maxPixelRatio is removed', async () => {
            const { device, setMaxPixelRatio } = await renderApplication(2);

            setMaxPixelRatio(undefined);

            expect(device.maxPixelRatio).toBe(DEFAULT_RATIO);
        });

        it('applies maxPixelRatio again after the graphics device is restored', async () => {
            const { device, setMaxPixelRatio } = await renderApplication(2);

            // WebGPU resets the ratio when it restores a lost device
            device.maxPixelRatio = 1;
            device.fire('devicerestored');

            expect(device.maxPixelRatio).toBe(2);

            // Once the prop is removed, a restore leaves the default alone
            setMaxPixelRatio(undefined);
            device.fire('devicerestored');

            expect(device.maxPixelRatio).toBe(DEFAULT_RATIO);
        });

        it('follows changes to the display pixel ratio', async () => {
            const queries = stubMatchMedia();
            const { device, setMaxPixelRatio } = await renderApplication(4);
            expect(device.maxPixelRatio).toBe(3);

            // The window moves to a 2x display
            vi.stubGlobal('devicePixelRatio', 2);
            queries.at(-1)?.listeners.forEach((listener) => listener());

            expect(device.maxPixelRatio).toBe(2);
            expect(queries.at(-1)?.media).toBe('(resolution: 2dppx)');

            // Removing the prop stops following the display
            setMaxPixelRatio(undefined);

            expect(queries.every(({ listeners }) => listeners.size === 0)).toBe(true);
        });

        it.each([0, -1, NaN])('warns and keeps the graphics device default when maxPixelRatio is %s', async (ratio) => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

            try {
                const { device } = await renderApplication(ratio);

                await vi.waitFor(() =>
                    expect(warnSpy).toHaveBeenCalledWith(
                        '%c[PlayCanvas React]:',
                        expect.any(String), // the CSS string
                        expect.stringContaining(`maxPixelRatio must be a number greater than 0. Received: ${ratio}`)
                    )
                );
                expect(device.maxPixelRatio).toBe(DEFAULT_RATIO);
            } finally {
                warnSpy.mockRestore();
            }
        });
    });

    it.skip('The Application component applies canvasRef prop correctly', () => {
        const canvasRef = { current: document.createElement('canvas') };
        canvasRef.current.setAttribute('aria-label', 'test-canvas');
        render(<ApplicationWithoutCanvas canvasRef={canvasRef} deviceTypes={['null']} />);

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
                graphicsDeviceOptions={
                    {
                        // powerPreference: 'invalid' as string
                    }
                }
            />
        );

        // Wait for the async warning
        await vi.waitFor(() => {
            const hasWarning = messages.some((msg) => msg.includes('Invalid value for prop "graphicsDeviceOptions"'));
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
