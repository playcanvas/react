import { Script as PcScript } from "playcanvas";
import { useScript } from "../hooks"
import { FC, memo, useMemo } from "react";
import { shallowEquals } from "../utils/shallow-equals";

interface ScriptProps {
    script: typeof PcScript;
    [key: string]: unknown;
}

const ScriptComponent: FC<ScriptProps> = ({ script, ...props }) => {
    // Memoize props so that the same object reference is passed if props haven't changed
    const memoizedProps = useMemo(() => props, [props]);

    useScript(script, memoizedProps);
    return null;
};

// Memoize the component to prevent re-rendering if `script` or `props` are the same
export const Script = memo(ScriptComponent, (prevProps, nextProps) => (
    prevProps.script === nextProps.script && shallowEquals(prevProps, nextProps)
));