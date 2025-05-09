import React, { ReactNode, useEffect, useRef } from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Script } from './Script';
import { Entity } from '../Entity';
import { Script as PcScript } from 'playcanvas';
import { Application } from '../Application';

const renderWithProviders = (ui: ReactNode) => {
    return render(
        <Application>
            <Entity>
                {ui}
            </Entity>
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
        
        renderWithProviders(<Script script={TestingScript} speed={speed} direction={direction} str={str} />);
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

        renderWithProviders(<TestComponent />);
    });

    describe('Initialization', () => {
        it('should initialize on first render', () => {
            const initializeCount = vi.fn();

            class TestScript extends PcScript {
                initialize() {
                    initializeCount();
                }
            }

            renderWithProviders(<Script script={TestScript} speed={1} />);
            
            expect(initializeCount).toHaveBeenCalledTimes(1);
        });
    });

    describe('Re-rendering', () => {
        it('should not re-initialize when props are shallow equal', () => {
            const initializeCount = vi.fn();

            class TestScript extends PcScript {
                initialize() {
                    initializeCount();
                }
            }

            const Container = ({ children }: { children: ReactNode }) => (
                <Application>
                    <Entity>
                        {children}
                    </Entity>
                </Application>
            );

            const { rerender } = render(
                <Container>
                    <Script script={TestScript} speed={1} />
                </Container>
            );

            // Re-render with same props
            rerender(
                <Container>
                    <Script script={TestScript} speed={1} />
                </Container>
            );

            expect(initializeCount).toHaveBeenCalledTimes(1);
        });

        it('should not re-initialize when props change', () => {
            const initializeCount = vi.fn();

            class TestScript extends PcScript {
                initialize() {
                    initializeCount();
                }
            }

            const Container = ({ children }: { children: ReactNode }) => (
                <Application>
                    <Entity>
                        {children}
                    </Entity>
                </Application>
            );

            const { rerender } = render(
                <Container>
                    <Script script={TestScript} speed={1} />
                </Container>
            );

            // Re-render with different props
            rerender(
                <Container>
                    <Script script={TestScript} speed={2} />
                </Container>
            );

            expect(initializeCount).toHaveBeenCalledTimes(1);
        });
    });

    describe('Cleanup', () => {
        it('should clean up script instance on unmount', () => {
            const destroySpy = vi.fn();

            class UnmountScript extends PcScript {
                initialize() {
                    this.on('destroy', destroySpy);
                }
            }

            const { unmount } = renderWithProviders(
                <Script script={UnmountScript} />
            );

            unmount();

            expect(destroySpy).toHaveBeenCalledTimes(1);
        });
    });
}); 