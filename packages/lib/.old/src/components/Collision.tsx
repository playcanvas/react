"use client"

import { FC } from "react";
import { useComponent } from "../hooks";

type CollisionProps = {
    [key: string]: unknown;
}

export const Collision: FC<CollisionProps> = (props) => {

    useComponent("collision", props);
    return null
    
}