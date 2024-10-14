import { useContext } from "react";
import { AppContext } from "../contexts/app-context";

export const useApp = () => {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error("`useApp` must be used within an Application component");
    }
    return appContext;
};
  