"use client";

import { Script } from "@playcanvas/react/components";
import { Grid as GridScript } from "@playcanvas/react/scripts";
import { FC } from "react";

const Grid: FC = ({ ...props }) => {
    return <Script script={GridScript} {...props} />
}

export default Grid;