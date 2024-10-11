import { useEffect, useRef } from "react";
import { useParent } from "../Entity";

export const useComponent = (ctype, props) => {

    const parent = useParent();
    const componentRef = useRef();
    
    useEffect(() => {
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
                parent.removeComponent(ctype);
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