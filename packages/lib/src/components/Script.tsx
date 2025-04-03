import { AppBase, Entity, Script as PcScript } from "playcanvas";
import { useScript } from "../hooks"
import { FC, memo, useMemo } from "react";
import { shallowEquals } from "../utils/shallow-equals";
import { validateAndSanitizeProps } from "../utils/validation";

/**
 * The Script component allows you to hook into the entity's lifecycle. This allows you to
 * run code  during the frame update loop, or when the entity is created or destroyed.
 * Use this for high-performance code that needs to run on every frame.
 * 
 * @param {ScriptProps} props - The props to pass to the script component.
 * 
 * @example
 * // A Rotator script that rotates the entity around the Y axis
 * class Rotator extends Script {
 *  update(dt: number) {
 *    this.entity.rotate(0, 1, 0, dt);
 *  }
 * }
 * <Script script={Rotator} />
 */
const ScriptComponent: FC<ScriptProps> = (props) => {

    const validatedProps = validateAndSanitizeProps(props, schema, 'Script');

    const { script, ...restProps } = validatedProps;

    // Memoize props so that the same object reference is passed if props haven't changed
    const memoizedProps = useMemo(() => restProps, [restProps]);

    useScript(script as new (args: { app: AppBase; entity: Entity; }) => PcScript, memoizedProps);
    return null;
};

// Memoize the component to prevent re-rendering if `script` or `props` are the same
export const Script = memo(ScriptComponent, (prevProps, nextProps) => {
    return prevProps.script === nextProps.script && shallowEquals(prevProps, nextProps)
});

interface ScriptProps {
    script: new (args: { app: AppBase; entity: Entity; }) => PcScript;
    [key: string]: unknown;
}

class NullScript extends PcScript {}

const schema = {
    script: {
      validate: (value: unknown): boolean => Boolean(value && value instanceof Function && value.prototype instanceof PcScript),
      errorMsg: (value: unknown) => `Invalid value for prop "script": "${value}". Expected a subclass of Script.`,
      default: NullScript
    },
}