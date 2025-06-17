"use client"

import { FC } from "react";
import { useComponent } from "../hooks";
import { Entity, ElementComponent } from "playcanvas";
import { PublicProps, Serializable } from "../utils/types-utils";
import { validatePropsWithDefaults, createComponentDefinition, getStaticNullApplication, Schema } from "../utils/validation";

/**
 * The Screen component allows an entity to render a 2D screen space UI element.
 * This is useful for creating UI elements that are rendered in screen space rather than world space.
 * 
 * @param {ElementProps} props - The props to pass to the screen component.
 * @see https://api.playcanvas.com/engine/classes/ElementComponent.html
 * 
 * @example
 * <Entity>
 *  <Screen screenSpace={true} />
 *   <Element>Hey</Element>
 *  </Screen>
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
    "ElementComponent"
);


componentDefinition.schema = {
    ...componentDefinition.schema,
    children: {
        validate: (value: unknown) => typeof value === "string",
        errorMsg: (value: unknown) => `Invalid value for prop "children": ${value}. Expected a string.`,
        default: "Invalid children"
    }
} as Schema<ElementProps, ElementComponent>; 