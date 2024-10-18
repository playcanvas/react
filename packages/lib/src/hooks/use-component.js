import { useLayoutEffect, useRef } from "react";
import { useParent } from "./use-parent";
import { useApp } from "./use-app";

export const useComponent = (ctype, props) => {
  const parent = useParent();
  const app = useApp();
  const componentRef = useRef();

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
        // componentRef.current.enabled = false;
        if (app.system?.[ctype]) parent.removeComponent(ctype);
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