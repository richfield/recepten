import { useContext } from "react";
import { ApplicationContext } from "./ApplicationContext.js";

export const useApplicationContext = () => {
    const context = useContext(ApplicationContext);
    if (!context) {
        throw new Error('useApplicationContext must be used within a ApplicationContextProvider');
    }
    return context;
};