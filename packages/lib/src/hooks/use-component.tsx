import { useLayoutEffect, useRef } from "react";
import { useParent } from "./use-parent";
import { useApp } from "./use-app";
import { Application, Component, Entity } from "playcanvas";

type ComponentProps = {
  [key: string]: unknown;
}

export const useComponent = (ctype: string, props: ComponentProps): void => {
  const componentRef = useRef<Component | null>();
  const parent : Entity = useParent();
  const app : Application = useApp();

  useLayoutEffect(() => {
    if (parent) {
      // Only add the component if it hasn't been added yet
      if (!componentRef.current) {
        const clonedOpts = { ...props };
        componentRef.current = parent.addComponent(ctype, clonedOpts);
      }
      // Do not throw an error if the component already exists
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

  useLayoutEffect(() => {

    const comp: Component | null | undefined = componentRef.current
    // Ensure componentRef.current exists before updating props
    if (!comp) return;

    const filteredProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => key in comp)
    );

    Object.assign(comp, filteredProps)

  }, [props]);
};