import { render, waitFor } from '@testing-library/react';
import type { Entity as PcEntity } from 'playcanvas';
import { Color } from 'playcanvas';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { Application } from '../Application.tsx';
import { Entity } from '../Entity.tsx';

import { Element } from './Element.tsx';
import { Screen } from './Screen.tsx';

describe('Element', () => {
    // Regression: the auto-generated schema used to include the engine's read-only
    // `aabb` getter and assign to it on mount, throwing "Cannot set property aabb".
    it('mounts a text element without throwing', async () => {
        const ref = React.createRef<PcEntity>();

        render(
            <Application deviceTypes={['null']}>
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

describe('Element prop application', () => {
    // Renders an element inside a 400 x 300 group element on a screen, and returns its entity
    const renderInPanel = async (element: React.ReactElement) => {
        const ref = React.createRef<PcEntity>();
        const result = render(
            <Application deviceTypes={['null']}>
                <Entity>
                    <Screen />
                    <Entity>
                        <Element
                            type="group"
                            anchor={[0.5, 0.5, 0.5, 0.5]}
                            pivot={[0.5, 0.5]}
                            width={400}
                            height={300}
                        />
                        <Entity ref={ref}>{element}</Entity>
                    </Entity>
                </Entity>
            </Application>
        );
        await waitFor(() => expect(ref.current?.element).toBeTruthy());
        return { entity: ref.current!, ...result };
    };

    // Regression: the defaults of the props that were not given, among them the margins and
    // their left/right/top/bottom aliases, were applied after the width and height on every
    // render, which changed the size of the element.
    it('keeps the width and height of an element with a point anchor', async () => {
        const { entity } = await renderInPanel(
            <Element type="image" anchor={[0.5, 0.5, 0.5, 0.5]} pivot={[0.5, 0.5]} width={200} height={100} />
        );

        expect(entity.element!.calculatedWidth).toBeCloseTo(200);
        expect(entity.element!.calculatedHeight).toBeCloseTo(100);
    });

    it('keeps the margins of an element with split anchors', async () => {
        const { entity } = await renderInPanel(
            <Element type="image" anchor={[0, 0, 1, 1]} margin={[20, 20, 20, 20]} />
        );

        expect(entity.element!.calculatedWidth).toBeCloseTo(360);
        expect(entity.element!.calculatedHeight).toBeCloseTo(260);
    });

    it('keeps the size of an element when it renders again', async () => {
        const ref = React.createRef<PcEntity>();
        const tree = (label: string) => (
            <Application deviceTypes={['null']}>
                <Entity>
                    <Screen />
                    <Entity ref={ref} name={label}>
                        <Element
                            type="image"
                            anchor={[0.5, 0.5, 0.5, 0.5]}
                            pivot={[0.5, 0.5]}
                            width={200}
                            height={100}
                        />
                    </Entity>
                </Entity>
            </Application>
        );
        const { rerender } = render(tree('first'));
        await waitFor(() => expect(ref.current?.element).toBeTruthy());

        rerender(tree('second'));
        await waitFor(() => expect(ref.current?.name).toBe('second'));

        expect(ref.current!.element!.calculatedWidth).toBeCloseTo(200);
        expect(ref.current!.element!.calculatedHeight).toBeCloseTo(100);
    });

    // Regression: the schema was built from a group element, whose color is null, so a color
    // given as a string was assigned as it was and the element's color became NaN.
    it('converts a color given as a hex string', async () => {
        const { entity } = await renderInPanel(<Element type="image" color="#ff8000" />);

        const color = entity.element!.color;
        expect(color.r).toBeCloseTo(1);
        expect(color.g).toBeCloseTo(128 / 255);
        expect(color.b).toBeCloseTo(0);
    });

    it('accepts a color given as an array or a Color', async () => {
        const { entity: fromArray } = await renderInPanel(<Element type="image" color={[0, 1, 0] as never} />);
        expect(fromArray.element!.color.g).toBeCloseTo(1);

        const { entity: fromColor } = await renderInPanel(<Element type="text" color={new Color(0, 0, 1) as never} />);
        expect(fromColor.element!.color.b).toBeCloseTo(1);
    });

    it('converts the outline and shadow colors of a text element', async () => {
        const { entity } = await renderInPanel(
            <Element type="text" outlineColor="#ff0000" shadowColor="#0000ff80" outlineThickness={0.5} />
        );

        expect(entity.element!.outlineColor.r).toBeCloseTo(1);
        expect(entity.element!.shadowColor.b).toBeCloseTo(1);
        expect(entity.element!.shadowColor.a).toBeCloseTo(128 / 255);
    });

    it('applies the type before the props that depend on it', async () => {
        const { entity } = await renderInPanel(<Element color="#ff0000" type="image" />);

        expect(entity.element!.type).toBe('image');
        expect(entity.element!.color.r).toBeCloseTo(1);
        expect(entity.element!.color.g).toBeCloseTo(0);
    });
});
