import { ReactNode, useState } from "react";
import { BusyContext } from "./BusyContext.js";

export const BusyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isBusy, setIsBusy] = useState(false);

    const showBusy = () => setIsBusy(true);
    const hideBusy = () => setIsBusy(false);

    return (
        <BusyContext.Provider value={{ isBusy, showBusy, hideBusy }}>
            {children}
        </BusyContext.Provider>
    );
};
