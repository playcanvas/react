import { useEffect, useRef } from 'react';
import { useParent } from './use-parent';
import { useApp } from './use-app';
import { Application, Entity, Script, ScriptComponent } from 'playcanvas';
// import { ScriptConstructor } from '../components/Script';

const toLowerCamelCase = (str: string) : string => str[0].toLowerCase() + str.substring(1);

interface Props {
  [key: string]: unknown;
}

export const useScript = (scriptConstructor:  new (...args: any[]) => Script, props: Props) : void  => {
  const parent: Entity = useParent();
  const app: Application = useApp();
  const scriptName: string = toLowerCamelCase(scriptConstructor.constructor.name);
  const scriptRef = useRef<Script | null>(null);
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
      const scriptInstance = scriptComponent.create(scriptConstructor as typeof Script, {
        properties: { ...props },
        preloading: false,
      });
      // @ts-expect-error Override the super private `__name` instance
      scriptInstance.__name = scriptName;
      scriptRef.current = scriptInstance;
      scriptComponentRef.current = scriptComponent;
    }

    // Cleanup function to remove the script when the component is unmounted
    return () => {
      const scriptComponent = scriptComponentRef.current;
      const script = scriptRef.current;
      scriptRef.current = null;
      scriptComponentRef.current = null;

      if (app && app.root && script && scriptComponent) {
        scriptComponent.destroy(scriptName);
      } else if (script) {
        script.fire('destroy');
      }
    };
  }, [app, parent, scriptConstructor]);

  // Update script props when they change
  useEffect(() => {
    const script: Script | null | undefined = scriptRef.current
    // Ensure componentRef.current exists before updating props
    if (!script) return;

    const filteredProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => key in script)
    );

    Object.assign(script, filteredProps)

  }, [props]);
};