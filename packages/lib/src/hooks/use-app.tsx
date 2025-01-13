import { Application } from "playcanvas";
import { useContext, createContext } from "react";
export const AppContext = createContext<Application | null >(null);

export const useApp = () : Application => {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error("`useApp` must be used within an Application component");
    }
    return appContext;
};


