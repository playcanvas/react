'use client';

import type { ElementComponent } from 'playcanvas';
import { Entity } from 'playcanvas';
import type { FC } from 'react';

import { useComponent } from '../hooks/index.ts';
import type { PublicProps, Serializable } from '../utils/types-utils.ts';
import type { Schema } from '../utils/validation.ts';
import { validatePropsPartial, createComponentDefinition, getStaticNullApplication } from '../utils/validation.ts';

/**
 * The Element component renders 2D UI content — text, an image, or a group — on an entity.
 * Add it to a child of an entity that has a {@link Screen} component.
 *
 * @param {ElementProps} props - The props to pass to the element component.
 * @see https://api.playcanvas.com/engine/classes/ElementComponent.html
 *
 * @example
 * <Entity>
 *   <Screen />
 *   <Entity>
 *     <Element type="text" fontAsset={font} text="Hello, World!" />
 *   </Entity>
 * </Entity>
 */
export const Element: FC<ElementProps> = (props) => {
    // Apply only the props that are given. An element's anchor, margins, width and height all
    // describe the same rectangle, so applying the defaults of the ones that are not given
    // would overwrite the ones that are.
    const safeProps = orderProps(validatePropsPartial(props, componentDefinition));

    useComponent('element', safeProps, componentDefinition.schema);
    return null;
};

type ElementProps = Partial<Serializable<PublicProps<ElementComponent>>>;

// Props that others depend on, in the order they need applying: the type first, so that there
// is an image or a text for the image and text props to apply to, then the anchor and pivot,
// and the margins before the width and height, which is the order the engine applies them in.
const ORDERED_PROPS = ['type', 'anchor', 'pivot', 'margin', 'left', 'bottom', 'right', 'top', 'width', 'height'];

const orderProps = (props: ElementProps): ElementProps => {
    const ordered: Record<string, unknown> = {};
    for (const key of ORDERED_PROPS) {
        if (key in props) ordered[key] = props[key as keyof ElementProps];
    }
    for (const [key, value] of Object.entries(props)) {
        if (!(key in ordered)) ordered[key] = value;
    }
    return ordered as ElementProps;
};

// The schema is built from a text element rather than a group, whose color, outline color,
// shadow color, alignment and shadow offset are null, so that colors given as CSS strings or
// arrays are converted rather than assigned as they are.
const componentDefinition = createComponentDefinition<ElementProps, ElementComponent>(
    'Element',
    () =>
        new Entity('mock-element', getStaticNullApplication()).addComponent('element', {
            type: 'text'
        }) as ElementComponent,
    (component) => (component as ElementComponent).system.destroy(),
    { apiName: 'ElementComponent' }
);

componentDefinition.schema = {
    ...componentDefinition.schema,
    children: {
        validate: (value: unknown) => typeof value === 'string',
        errorMsg: (value: unknown) => `Invalid value for prop "children": ${value}. Expected a string.`,
        default: 'Invalid children'
    }
} as Schema<ElementProps, ElementComponent>;
