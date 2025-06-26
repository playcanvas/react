"use client"

import { FC } from "react";
import { useComponent } from "../hooks/index.ts";
import { Entity, ScreenComponent } from "playcanvas";
import { PublicProps, Serializable } from "../utils/types-utils.ts";
import { validatePropsWithDefaults, createComponentDefinition, getStaticNullApplication, Schema } from "../utils/validation.ts";

/**
 * The Screen component allows an entity to render a 2D screen space UI element.
 * This is useful for creating UI elements that are rendered in screen space rather than world space.
 * 
 * @param {ScreenProps} props - The props to pass to the screen component.
 * @see https://api.playcanvas.com/engine/classes/ScreenComponent.html
 * 
 * @example
 * <Entity>
 *  <Screen screenSpace={true} />
 * </Entity>
 */
export const Screen: FC<ScreenProps> = (props) => {
    const safeProps = validatePropsWithDefaults(props, componentDefinition);

    useComponent("screen", safeProps, componentDefinition.schema);
    return null;
};

interface ScreenProps extends Partial<Serializable<PublicProps<ScreenComponent>>> {
    /**
     * Whether the screen is rendered in screen space.
     * @default true
     */
    screenSpace?: boolean;
    /**
     * The reference resolution of the screen.
     * @default [1280, 720]
     */
    referenceResolution?: [number, number];
    /**
     * The scale mode of the screen.
     * @default "blend"
     */
    scaleMode?: "blend" | "stretch" | "fit";
}

const componentDefinition = createComponentDefinition<ScreenProps, ScreenComponent>(
    "Screen",
    () => new Entity("mock-screen", getStaticNullApplication()).addComponent("screen") as ScreenComponent,
    (component) => (component as ScreenComponent).system.destroy(),
    "ScreenComponent"
);

componentDefinition.schema = {
    ...componentDefinition.schema,
    screenSpace: {
        validate: (value: unknown) => typeof value === "boolean",
        errorMsg: (value: unknown) => `Invalid value for prop "screenSpace": ${value}. Expected a boolean.`,
        default: true
    },
    referenceResolution: {
        validate: (value: unknown) => Array.isArray(value) && value.length === 2 && value.every(v => typeof v === "number"),
        errorMsg: (value: unknown) => `Invalid value for prop "referenceResolution": ${value}. Expected a tuple of [number, number].`,
        default: [1280, 720]
    },
    scaleMode: {
        validate: (value: unknown) => typeof value === "string" && ["blend", "stretch", "fit"].includes(value as string),
        errorMsg: (value: unknown) => `Invalid value for prop "scaleMode": ${value}. Expected one of: "blend", "stretch", "fit".`,
        default: "blend"
    }
} as Schema<ScreenProps, ScreenComponent>; 