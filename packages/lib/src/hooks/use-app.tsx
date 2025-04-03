import { Application } from "playcanvas";
import { useContext, createContext } from "react";
export const AppContext = createContext<Application | null >(null);


/**
 * This hook is used to get the application instance.
 * @returns {Application} app - The application instance.
 * 
 * @example
 * const app = useApp();
 */
export const useApp = () : Application => {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error("`useApp` must be used within an Application component");
    }
    return appContext;
};