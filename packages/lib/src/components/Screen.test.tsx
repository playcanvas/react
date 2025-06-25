import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Screen } from './Screen.tsx';
import { Entity } from '../Entity.tsx';
import { Application } from '../Application.tsx';

const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <Application>
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