import { useContext, createContext } from "react";

export const AppContext = createContext(null);

export const useApp = () => {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error("`useApp` must be used within an Application component");
    }
    return appContext;
};


