import { Script } from "@playcanvas/react/components";
import { ShadowCatcher as ShadowCatcherScript } from "@playcanvas/react/scripts";
import { FC } from "react";
import type { ScriptConstructor } from "../../../lib/dist/components/Script";

const ShadowCatcher: FC<Record<string, unknown>> = (props) => {
    
    return <Script script={ShadowCatcherScript} {...props} />
}

export default ShadowCatcher;