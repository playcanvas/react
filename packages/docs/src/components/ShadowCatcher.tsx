import { Script } from "@playcanvas/react/components";
import { ShadowCatcher as ShadowCatcherScript } from "@playcanvas/react/scripts";
import { FC } from "react";

const ShadowCatcherComponent: FC<Record<string, unknown>> = (props) => {
    return <Script script={ShadowCatcherScript} {...props} />
}

export default ShadowCatcherComponent;
