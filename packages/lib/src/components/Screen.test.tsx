import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Screen } from './Screen.tsx';
import { Entity } from '../Entity.tsx';
import { Application } from '../Application.tsx';
import { Vec2, Entity as PcEntity } from 'playcanvas';

const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <Application deviceTypes={["null"]}>
            <Entity>
                {ui}
            </Entity>
        </Application>
    );
};

describe('Screen', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render with default props', () => {
        const { container } = renderWithProviders(<Screen />);
        expect(container).toBeTruthy();
    });

    it('should render with custom props', () => {
        const { container } = renderWithProviders(
            <Screen
                screenSpace={false}
                referenceResolution={[1920, 1080]}
                scaleMode="stretch"
            />
        );
        expect(container).toBeTruthy();
    });

    it('should throw error if used outside of Entity', () => {
        expect(() => {
            render(<Screen />);
        }).toThrow('`useParent` must be used within an App or Entity via a ParentContext.Provider');
    });
});

describe('Screen prop application', () => {
    // Regression: referenceResolution was applied as a raw array, but the engine
    // setter reads value.x/value.y, leaving the screen scale (and child UI) NaN.
    it('applies referenceResolution as a Vec2, not a raw array', async () => {
        const ref = React.createRef<PcEntity>();
        render(
            <Application deviceTypes={["null"]}>
                <Entity ref={ref}>
                    <Screen referenceResolution={[1280, 720]} />
                </Entity>
            </Application>
        );

        await waitFor(() => expect(ref.current?.screen).toBeTruthy());

        const screen = ref.current!.screen!;
        expect(screen.referenceResolution).toBeInstanceOf(Vec2);
        expect(screen.referenceResolution.x).toBe(1280);
        expect(screen.referenceResolution.y).toBe(720);
    });
});
