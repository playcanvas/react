'use client'

import { Container } from "@playcanvas/react";
import { useModel } from "./hooks/use-asset";
import { Asset } from "playcanvas";

export const Glb = ({ src, children }: { src: string, children?: React.ReactNode }) => {
    
    const { data: model, isLoading, error } = useModel(src);

    if (isLoading) return null;
    if (error) return null;

    return <Container asset={model as Asset}>
        {children}
    </Container>
}