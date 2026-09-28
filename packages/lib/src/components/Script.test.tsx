import { render, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import '@testing-library/jest-dom';
import { Application } from '../Application.tsx';
import { Entity } from '../Entity.tsx';

import { Script } from './Script.tsx';

// eslint-disable-next-line import-x/order -- preserve the existing side-effect import order
import { Script as PcScript } from 'playcanvas';

const renderWithProviders = (ui: ReactNode) => {
    return render(
        <Application deviceTypes={['null']}>
            <Entity>{ui}</Entity>
        </Application>
    );
};

describe('Script Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should pass props to the script instance', () => {
        const speed = 2;
        const str = 'test';
        const direction = [1, 0, 0];

        class TestingScript extends PcScript {
            speed: number;
            direction: number[];
            str: string;

            initialize() {
                expect(this.speed).toBe(speed);
                expect(this.direction).toEqual(direction);
                expect(this.str).toBe(str);
            }
        }

        act(() => {
            renderWithProviders(<Script script={TestingScript} speed={speed} direction={direction} str={str} />);
        });
    });

    it('should forward ref to script instance', () => {
        class TestScript extends PcScript {}

        const TestComponent = () => {
            const scriptRef = useRef<TestScript>(null);

            useEffect(() => {
                // Ensure the script instance is created
                expect(scriptRef.current).toBeInstanceOf(TestScript);
            }, []);

            return <Script script={TestScript} ref={scriptRef} />;
        };

        act(() => {
            renderWithProviders(<TestComponent />);
        });
    });

    describe('Initialization', () => {
        it('should initialize on first render', async () => {
            const initializeCount = vi.fn();

            class TestScript extends PcScript {
                initialize() {
                    initializeCount();
                }
            }

            act(() => {
                renderWithProviders(<Script script={TestScript} speed={1} />);
            });

            await waitFor(() => {
                expect(initializeCount).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('Re-rendering', () => {
        it('should not re-initialize when props are shallow equal', async () => {
            const initializeCount = vi.fn();

            class TestScript extends PcScript {
                initialize() {
                    initializeCount();
                }
            }

            const Container = ({ children }: { children: ReactNode }) => (
                <Application deviceTypes={['null']}>
                    <Entity>{children}</Entity>
                </Application>
            );

            const { rerender } = render(
                <Container>
                    <Script script={TestScript} speed={1} />
                </Container>
            );

            await waitFor(() => {
                expect(initializeCount).toHaveBeenCalledTimes(1);
            });

            // Re-render with same props
            act(() => {
                rerender(
                    <Container>
                        <Script script={TestScript} speed={1} />
                    </Container>
                );
            });

            // Should still only be called once
            expect(initializeCount).toHaveBeenCalledTimes(1);
        });

        it('should not re-initialize when props change', async () => {
            const initializeCount = vi.fn();

            class TestScript extends PcScript {
                initialize() {
                    initializeCount();
                }
            }

            const Container = ({ children }: { children: ReactNode }) => (
                <Application deviceTypes={['null']}>
                    <Entity>{children}</Entity>
                </Application>
            );

            const { rerender } = render(
                <Container>
                    <Script script={TestScript} speed={1} />
                </Container>
            );

            await waitFor(() => {
                expect(initializeCount).toHaveBeenCalledTimes(1);
            });

            // Re-render with different props
            act(() => {
                rerender(
                    <Container>
                        <Script script={TestScript} speed={2} />
                    </Container>
                );
            });

            // Should still only be called once
            expect(initializeCount).toHaveBeenCalledTimes(1);
        });
    });

    describe('Cleanup', () => {
        class _OrbitCamera extends PcScript {
            static scriptName = 'orbitCamera';
        }

        class FallbackScript extends PcScript {}

        it.each([
            ['explicit scriptName', _OrbitCamera, 'orbitCamera'],
            ['class-name fallback', FallbackScript, 'fallbackScript']
        ] as const)('should clean up and remount using %s', async (_label, script, scriptName) => {
            const scriptRef = React.createRef<PcScript>();
            const Container = ({ mounted }: { mounted: boolean }) => (
                <Application deviceTypes={['null']}>
                    <Entity>{mounted && <Script script={script} ref={scriptRef} />}</Entity>
                </Application>
            );

            const { rerender } = render(<Container mounted />);
            await waitFor(() => expect(scriptRef.current).toBeInstanceOf(script));
            const firstInstance = scriptRef.current!;
            const entity = firstInstance.entity;
            expect(entity.script![scriptName]).toBe(firstInstance);

            rerender(<Container mounted={false} />);
            expect(scriptRef.current).toBeNull();
            expect(entity.script).toBeDefined();
            expect(entity.script![scriptName]).toBeUndefined();

            const warnSpy = vi.spyOn(console, 'warn');
            try {
                rerender(<Container mounted />);
                await waitFor(() => expect(scriptRef.current).toBeInstanceOf(script));
                expect(scriptRef.current).not.toBe(firstInstance);
                expect(scriptRef.current!.entity).toBe(entity);
                expect(entity.script![scriptName]).toBe(scriptRef.current);
                expect(warnSpy).not.toHaveBeenCalled();
            } finally {
                warnSpy.mockRestore();
            }

            rerender(<Container mounted={false} />);
            expect(entity.script![scriptName]).toBeUndefined();
        });

        it('should clean up script instance on unmount', async () => {
            const destroySpy = vi.fn();

            class UnmountScript extends PcScript {
                initialize() {
                    this.on('destroy', destroySpy);
                }
            }

            let unmount: () => void;

            // 🧪 render must happen inside act only if it's doing side effects immediately
            await act(async () => {
                const result = renderWithProviders(<Script script={UnmountScript} />);
                unmount = result.unmount;
            });

            // 🧪 unmount definitely needs act to flush effects
            await act(async () => {
                unmount();
            });

            // ✅ wait for destroy to have fired
            await waitFor(() => {
                expect(destroySpy).toHaveBeenCalledTimes(1);
            });
        });
    });
});
