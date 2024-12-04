import { Script } from "@playcanvas/react/components";
import { AutoRotator } from "@playcanvas/react/scripts";
import { FC } from "react";

const AutoRotate: FC<Record<string, unknown>> = (props) => {
    return <Script script={AutoRotator} {...props} />
}

export default AutoRotate;