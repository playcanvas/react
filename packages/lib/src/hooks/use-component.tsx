import { useLayoutEffect, useRef } from "react";
import { useParent } from "./use-parent";
import { useApp } from "./use-app";
import { Application, Entity } from "playcanvas";

interface ComponentProps {
  [key: string]: any;
}



export const useComponent = (ctype: string, props: ComponentProps): void => {
  const parent : Entity = useParent();
  const app : Application = useApp();
  const componentRef = useRef<any>();

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
      if (componentRef.current) {
        type SystemKeys = keyof typeof app.systems;
        if (app.systems[ctype as SystemKeys]) parent.removeComponent(ctype);
        componentRef.current = null;
      }
    };
  }, [app, parent, ctype]);

  useLayoutEffect(() => {
    // Ensure componentRef.current exists before updating props
    if (componentRef.current) {
      for (const key in props) {
        if (componentRef.current[key] !== undefined) {
          componentRef.current[key] = props[key];
        }
      }
    }
  }, [props]);
};