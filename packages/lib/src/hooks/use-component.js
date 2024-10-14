import { useLayoutEffect, useRef } from "react";
import { useParent } from "./use-parent";

export const useComponent = (ctype, props) => {

    const parent = useParent();
    const componentRef = useRef();
    
    useLayoutEffect(() => {
        if(parent){

            // It is necessary to clone the props object to avoid mutating the original object
            if(!parent.c[ctype]) {
                const clonedOpts = { ...props }
                componentRef.current = parent.addComponent(ctype, clonedOpts);
            } else {
                throw `Multiple '${ctype}' components have been added on the '${parent.name}' entity. Only one '${ctype}' component is allowed.`
            }
        }

        return () => {
            if(componentRef.current) {
                componentRef.current.enabled = false;
                parent.removeComponent(ctype);
                componentRef.current = null;
            }
        }

    }, [parent, ctype] );

    if(!componentRef.current) return;

    // copy props to component
    for (const key in props) {
        if (componentRef.current[key] !== undefined) {
            componentRef.current[key] = props[key];
        }
    }
}