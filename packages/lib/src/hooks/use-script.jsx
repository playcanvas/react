import { useLayoutEffect, useEffect, useRef } from 'react';
import { useParent } from './use-parent';
import { useApp } from './use-app';

const toLowerCamelCase = (str) => str[0].toLowerCase() + str.substring(1);

export const useScript = (ScriptConstructor, props) => {
  const parent = useParent();
  const app = useApp();
  const scriptName = toLowerCamelCase(ScriptConstructor.name);
  const scriptRef = useRef(null);

  // Create the script synchronously
  useLayoutEffect(() => {
    // Ensure the parent entity has a script component
    if (!parent.script) {
      parent.addComponent('script');
    }

    // Check if we've already created the script
    if (!scriptRef.current) {
      // Create the script instance with the provided attributes
      const scriptInstance = parent.script.create(ScriptConstructor, {
        properties: { ...props },
        preloading: false,
      });
      scriptInstance.__name = scriptName;
      scriptRef.current = scriptInstance;
    }

    // Cleanup function to remove the script when the component is unmounted
    return () => {
      if (parent?.script && scriptRef.current) {
        parent.script.destroy(scriptRef.current);
      }
      scriptRef.current.fire('destroy');
      scriptRef.current = null;
    };
  }, [app, parent, ScriptConstructor]);

  // Update script props when they change
  useEffect(() => {
    if (scriptRef.current) {
      for (const key in props) {
        if (scriptRef.current[key] !== undefined) {
          scriptRef.current[key] = props[key];
        }
      }
    }
  }, [props]);
};