"use client"

import { FC } from "react";
import { useComponent } from "../hooks/index.ts";
import { Entity, ElementComponent } from "playcanvas";
import { PublicProps, Serializable } from "../utils/types-utils.ts";
import { validatePropsWithDefaults, createComponentDefinition, getStaticNullApplication, Schema } from "../utils/validation.ts";

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
    const safeProps = validatePropsWithDefaults(props, componentDefinition);

    useComponent("element", safeProps, componentDefinition.schema);
    return null;
};

type ElementProps = Partial<Serializable<PublicProps<ElementComponent>>>

const componentDefinition = createComponentDefinition<ElementProps, ElementComponent>(
    "Element",
    () => new Entity("mock-element", getStaticNullApplication()).addComponent("element") as ElementComponent,
    (component) => (component as ElementComponent).system.destroy(),
    { apiName: "ElementComponent" }
);


componentDefinition.schema = {
    ...componentDefinition.schema,
    children: {
        validate: (value: unknown) => typeof value === "string",
        errorMsg: (value: unknown) => `Invalid value for prop "children": ${value}. Expected a string.`,
        default: "Invalid children"
    }
} as Schema<ElementProps, ElementComponent>; 