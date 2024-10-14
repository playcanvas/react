import { useContext } from "react";
import { ParentContext } from "../contexts/parent-context";

export const useParent = () => {
    const context = useContext(ParentContext);
    if (!context) {
        throw new Error('`useParent` must be used within an App or Entity via a ParentContext.Provider');
    }
    return context;
};
