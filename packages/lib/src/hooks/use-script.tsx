import { useEffect, useRef } from 'react';
import { useParent } from './use-parent';
import { useApp } from './use-app';
import { Application, Entity, Script, ScriptComponent } from 'playcanvas';

const toLowerCamelCase = (str: string) : string => str[0].toLowerCase() + str.substring(1);

interface Props {
  [key: string]: any;
}

export const useScript = (ScriptConstructor: typeof Script, props: Props) : void  => {
  const parent: Entity = useParent();
  const app: Application = useApp();
  const scriptName: string = toLowerCamelCase(ScriptConstructor.name);
  const scriptRef = useRef<any>(null);
  const scriptComponentRef = useRef<ScriptComponent | null>(null);

  // Create the script synchronously
  useEffect(() => {
    if (!app) return;

    // Ensure the parent entity has a script component
    if (!parent.script) {
      parent.addComponent('script');
    }

    // Check if we've already created the script
    if (!scriptRef.current) {
      // Create the script instance with the provided attributes
      const scriptComponent : ScriptComponent = parent.script as ScriptComponent;
      const scriptInstance = scriptComponent.create(ScriptConstructor, {
        properties: { ...props },
        preloading: false,
      });
      // @ts-ignore
      scriptInstance.__name = scriptName;
      scriptRef.current = scriptInstance;
      scriptComponentRef.current = scriptComponent;
    }

    // Cleanup function to remove the script when the component is unmounted
    return () => {
      if(!app) return;
      const scriptComponent = scriptComponentRef.current;
      const script = scriptRef.current;
      if (script && scriptComponent) {
        scriptComponent.destroy(scriptRef.current);
      } else {
        console.log('Script not found on parent entity', parent?.script, scriptRef.current);
        script.fire('destroy');
      }
      scriptRef.current = null;
      scriptComponentRef.current = null;
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