import { useEffect, useRef } from "react";
import { useParent } from "../Entity";

const toLowerCamelCase = str => str[0].toLowerCase() + str.substring(1);

export const useScript = (ScriptConstructor, props) => {
    const parent = useParent();
    const scriptRef = useRef();
    const scriptName = toLowerCamelCase(ScriptConstructor.name)

    useEffect(() => {
        if (parent) {
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
        }

        // Cleanup function to remove the script when the component is unmounted
        return () => {
            // console.log('Running Script cleanup');
            if (scriptRef.current) {
                parent.script[scriptName] = null;
                parent.script.destroy(scriptRef.current);
                scriptRef.current = null;
            }
        };
    }, [parent, scriptName]);

    if (!scriptRef.current) return;

    // Update script attributes with the latest props
    for (const key in props) {
        if (scriptRef.current[key] !== undefined) {
            scriptRef.current[key] = props[key];
        }
    }
};