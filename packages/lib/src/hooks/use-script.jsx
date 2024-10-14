import {  useLayoutEffect, useRef } from "react";
import { useParent } from "./use-parent";

const toLowerCamelCase = str => str[0].toLowerCase() + str.substring(1);

export const useScript = (ScriptConstructor, props) => {
    const parent = useParent();
    const scriptName = toLowerCamelCase(ScriptConstructor.name)
    const scriptRef = useRef(null);


    useLayoutEffect(() => {
        // if (parent) {
        // Ensure the parent entity has a script component
        if (!parent.script) {
            parent.addComponent('script');
        }

        // Check if the script already exists on the parent
        // console.log('Script Name', scriptName)
        if (!parent.script[scriptName]) {
            // Create the script instance with the provided attributes
            const scriptInstance = parent.script.create(ScriptConstructor, { properties: { ...props }, preloading: false });
            scriptInstance.__name = scriptName;
            scriptRef.current = scriptInstance;
        } else {
            throw new Error(
                `Multiple '${scriptName}' scripts have been added to the '${parent.name}' entity. Only one '${scriptName}' script is allowed.`
            );
        }
        // }

        // Cleanup function to remove the script when the component is unmounted
        return () => {
            // console.log('Running Script cleanup');
            if (scriptRef.current) {
                parent.script[scriptName] = null;
                parent.script.destroy(scriptRef.current);
                scriptRef.current = null;
            }
        };
    }, [parent, ScriptConstructor, scriptRef.current]);

    // Update script attributes when props change
    useLayoutEffect(() => {
        if (scriptRef.current) {
            for (const key in props) {
                if (scriptRef.current[key] !== undefined) {
                    scriptRef.current[key] = props[key];
                }
            }
        }
    }, [props]); // Re-run effect when props change
};


    // useLayoutEffect(() => {
    //     if (parent) {
    //         // Ensure the parent entity has a script component
    //         if (!parent.script) {
    //             parent.addComponent('script');
    //         }

    //         // Check if the script already exists on the parent
    //         // console.log('Script Name', scriptName)
    //         if (!parent.script[scriptName]) {
    //             // Create the script instance with the provided attributes
    //             const scriptInstance = parent.script.create(ScriptConstructor, { properties: { ...props }, preloading: false });
    //             scriptInstance.__name = scriptName;
    //             scriptRef.current = scriptInstance;
    //         } else {
    //             throw new Error(
    //                 `Multiple '${scriptName}' scripts have been added to the '${parent.name}' entity. Only one '${scriptName}' script is allowed.`
    //             );
    //         }
    //     }

    //     // Cleanup function to remove the script when the component is unmounted
    //     return () => {
    //         // console.log('Running Script cleanup');
    //         if (scriptRef.current) {
    //             parent.script[scriptName] = null;
    //             parent.script.destroy(scriptRef.current);
    //             scriptRef.current = null;
    //         }
    //     };
    // }, [parent, ScriptConstructor, scriptRef.current]);

    // if (!scriptRef.current) return;