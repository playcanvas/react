"use client";

import { Entity } from "@playcanvas/react";
import { Script } from "@playcanvas/react/components";
import { Grid as GridScript } from "playcanvas/scripts/esm/grid.mjs";
import { FC } from "react";

const Grid: FC = ({ ...props }) => {
    return <Entity scale={[1000, 1000, 1000]}>
        <Script script={GridScript} {...props} />
    </Entity>
}

export default Grid;