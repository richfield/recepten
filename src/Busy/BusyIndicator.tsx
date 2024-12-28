// BusyIndicator.tsx
import React from 'react';
import { useBusy } from './BusyContext.js';

import { CircularProgress, Dialog, DialogContent } from '@mui/material';

export const BusyIndicator: React.FC = () => {
    const { isBusy } = useBusy();

    return (
        <Dialog open={isBusy}  disableEscapeKeyDown>
            <DialogContent style={{ textAlign: 'center' }}>
                <CircularProgress />
            </DialogContent>
        </Dialog>
    );
};
