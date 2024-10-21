import { Entity } from "playcanvas";
import { useContext, createContext } from "react";
export const ParentContext = createContext<Entity | undefined>(undefined);

export const useParent = (): Entity => {
    const context = useContext(ParentContext);
    if (context === undefined) {
        throw new Error('`useParent` must be used within an App or Entity via a ParentContext.Provider');
    }
    return context;
};
