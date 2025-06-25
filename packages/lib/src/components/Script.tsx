import { Script as PcScript } from "playcanvas";
import { useScript } from "../hooks/index.ts";
import { forwardRef, memo, useMemo } from "react";
import { ComponentDefinition, validatePropsPartial } from "../utils/validation.ts";
import { shallowEquals } from "../utils/compare.tsx";
import { SubclassOf } from "../utils/types-utils.ts";

/**
 * The Script component allows you to hook into the entity's lifecycle. This allows you to
 * run code  during the frame update loop, or when the entity is created or destroyed.
 * Use this for high-performance code that needs to run on every frame.
 * 
 * @param {ScriptProps} props - The props to pass to the script component.
 * @see https://api.playcanvas.com/engine/classes/Script.html
 * @example
 * // A Rotator script that rotates the entity around the Y axis
 * class Rotator extends Script {
 *  update(dt: number) {
 *    this.entity.rotate(0, 1, 0, dt);
 *  }
 * }
 * <Script script={Rotator} />
 */

const ScriptComponent = forwardRef<PcScript, ScriptProps>(function ScriptComponent(
    props,
    ref
  ): React.ReactElement | null {
    const validatedProps = validatePropsPartial(props as ScriptProps, componentDefinition, false);
  
    const { script, ...restProps } = validatedProps;
  
    const memoizedProps = useMemo(() => restProps, [restProps]);
  
    useScript(script as SubclassOf<PcScript>, memoizedProps, ref);
  
    return null;
  });

// Memoize the component to prevent re-rendering if `script` or `props` are the same
export const Script = memo(ScriptComponent, (prevProps, nextProps) => {
    return prevProps.script === nextProps.script && shallowEquals(prevProps, nextProps)
});

interface ScriptProps {
    script: SubclassOf<PcScript>;
    [key: string]: unknown;
}

class NullScript extends PcScript {}

const componentDefinition = {
    name: "Script",
    apiName: "ScriptComponent",
    schema : {
        script: {
            validate: (value: unknown): boolean => Boolean(value && value instanceof Function && value.prototype instanceof PcScript),
            errorMsg: (value: unknown) => `Invalid value for prop "script": "${value}". Expected a subclass of Script.`,
            default: NullScript
        }
    }
} as ComponentDefinition<ScriptProps, PcScript>