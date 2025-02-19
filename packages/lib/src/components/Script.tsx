import { AppBase, Entity, Script as PcScript } from "playcanvas";
import { useScript } from "../hooks"
import { FC, memo, useMemo } from "react";
import { shallowEquals } from "../utils/shallow-equals";

// type PcScriptWithoutPrivateName = Omit<typeof PcScript, '__name'> & {
//     __name: string;
// };
// type PcScriptWithoutPrivateName = {
//     new (args: { app: AppBase; entity: Entity; }): PcScript
//     __name: string;
// };

interface ScriptProps {
    script: new (args: { app: AppBase; entity: Entity; }) => PcScript;
    [key: string]: unknown;
}

const ScriptComponent: FC<ScriptProps> = ({ script, ...props }) => {
    // Memoize props so that the same object reference is passed if props haven't changed
    const memoizedProps = useMemo(() => props, [props]);

    useScript(script, memoizedProps);
    return null;
};

// Memoize the component to prevent re-rendering if `script` or `props` are the same
export const Script = memo(ScriptComponent, (prevProps, nextProps) => {
    return prevProps.script === nextProps.script && shallowEquals(prevProps, nextProps)
});