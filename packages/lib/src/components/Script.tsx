import { Script as PcScript } from "playcanvas";
import { useScript } from "../hooks"

interface ScriptProps {
    script: typeof PcScript;
}

export const Script = ({ script, ...props } : ScriptProps ) => {

    useScript(script, props);

}