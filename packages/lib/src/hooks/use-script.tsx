import { ForwardedRef, useEffect, useRef } from 'react';
import { useParent } from './use-parent';
import { useApp } from './use-app';
import { Application, Entity, Script, ScriptComponent } from 'playcanvas';
import { SubclassOf } from '../utils/types-utils';

/**
 * This hook is used to create a script component on an entity. 
 * @param scriptConstructor - The constructor for the script.
 * @param props - The props for the script.
 * 
 * @example
 * const script = useScript(MyScript, {
 *   myProperty: 'value',
 * });
 */
export const useScript = (
  scriptConstructor: SubclassOf<Script>, 
  props: Props, 
  ref: ForwardedRef<Script>
) : void  => {
  
  const parent: Entity = useParent();
  const app: Application = useApp();
  const scriptName: string = toLowerCamelCase(scriptConstructor.name);
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
      const scriptInstance = scriptComponent.create(scriptConstructor as unknown as typeof Script, {
        properties: { ...props },
        preloading: false,
      }) as Script;

      if (ref) {
        if (typeof ref === 'function') {
          ref(scriptInstance);
        } else {
          ref.current = scriptInstance;
        }
      }

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

        if (ref) {
          if (typeof ref === 'function') {
            ref(null);
          } else {
            ref.current = null;
          }
        }
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

const toLowerCamelCase = (str: string) : string => str[0].toLowerCase() + str.substring(1);

interface Props {
  [key: string]: unknown;
}