import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Entity as PcEntity } from 'playcanvas';
import { Element } from './Element.tsx';
import { Screen } from './Screen.tsx';
import { Entity } from '../Entity.tsx';
import { Application } from '../Application.tsx';

describe('Element', () => {
    // Regression: the auto-generated schema used to include the engine's read-only
    // `aabb` getter and assign to it on mount, throwing "Cannot set property aabb".
    it('mounts a text element without throwing', async () => {
        const ref = React.createRef<PcEntity>();

        render(
            <Application deviceTypes={["null"]}>
                <Entity>
                    <Screen />
                    <Entity ref={ref}>
                        <Element type="text" text="Hello, World!" fontSize={24} />
                    </Entity>
                </Entity>
            </Application>
        );

        await waitFor(() => expect(ref.current?.element).toBeTruthy());

        expect(ref.current!.element!.type).toBe('text');
        expect(ref.current!.element!.text).toBe('Hello, World!');
    });
});
