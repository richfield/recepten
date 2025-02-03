import { ReactNode, useCallback, useState } from "react";
import { BusyContext } from "./BusyContext.js";

export const BusyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isBusy, setIsBusy] = useState(false);

    const showBusy = useCallback(() => {
        setIsBusy(prev => prev !== true ? true : prev);
    }, []);

    const hideBusy = useCallback(() => {
        setIsBusy(prev => prev !== false ? false : prev);
    }, []);

    return (
        <BusyContext.Provider value={{ isBusy, showBusy, hideBusy }}>
            {children}
        </BusyContext.Provider>
    );
};
