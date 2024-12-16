// BusyContext.tsx
import { createContext, useContext } from 'react';

interface BusyContextProps {
    isBusy: boolean;
    showBusy: () => void;
    hideBusy: () => void;
}

export const BusyContext = createContext<BusyContextProps | undefined>(undefined);

export const useBusy = () => {
    const context = useContext(BusyContext);
    if (!context) {
        throw new Error('useBusy must be used within a BusyProvider');
    }
    return context;
};



