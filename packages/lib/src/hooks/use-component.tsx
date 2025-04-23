import { useLayoutEffect, useRef } from "react";
import { useParent } from "./use-parent";
import { useApp } from "./use-app";
import { Application, Component, Entity } from "playcanvas";
import { applyProps, Schema } from "../utils/validation";

export function useComponent<T, InstanceType>(
  ctype: string | null, 
  props: T, 
  schema: Schema<T, InstanceType>
): void {
  const componentRef = useRef<Component | null>(null);
  const parent : Entity = useParent();
  const app : Application = useApp();

  useLayoutEffect(() => {
    if(!ctype) {
      return;
    }

    if (parent) {
      // Only add the component if it hasn't been added yet
      if (!componentRef.current) {
        componentRef.current = parent.addComponent(ctype);
      }
    }

    return () => {
      const comp = componentRef.current
      componentRef.current = null;

      if(!app || !app.root) return;

      if (comp) {
        type SystemKeys = keyof typeof app.systems;
        if (app.systems[ctype as SystemKeys]) parent.removeComponent(ctype);
      }
    };
  }, [app, parent, ctype]);

  // Update component props
  useLayoutEffect(() => {

    if(!ctype) {
      return
    }

    const comp: Component | null | undefined = componentRef.current
    // Ensure componentRef.current exists before updating props
    if (!comp) return;

    const filteredProps = Object.fromEntries(
      Object.entries(props as Record<keyof Component, unknown>).filter(([key]) => key in comp)
    );

    applyProps(comp as InstanceType, schema, filteredProps as Record<keyof Component, unknown>);

  });
};