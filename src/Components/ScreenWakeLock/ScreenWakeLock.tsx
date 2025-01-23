import React, { useState } from 'react';
import { Switch } from '@mui/material';

const ScreenWakeLock: React.FC = () => {
    const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

    const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const isChecked = event.target.checked;
        if (isChecked) {
            await requestWakeLock();
        } else {
            await releaseWakeLock();
        }
    };

    const requestWakeLock = async (): Promise<void> => {
        try {
            const newWakeLock: WakeLockSentinel = await navigator.wakeLock.request('screen');
            setWakeLock(newWakeLock);
            setIsWakeLockActive(true);
        } catch (err) {
            console.error('Failed to acquire wake lock:', err);
        }
    };

    const releaseWakeLock = async (): Promise<void> => {
        try {
            if (wakeLock) {
                wakeLock.release();
                setWakeLock(null);
                setIsWakeLockActive(false);
            }
        } catch (err) {
            console.error('Failed to release wake lock:', err);
        }
    };

    return (
            <Switch
                checked={isWakeLockActive}
                onChange={handleToggle}
                color="primary"
                inputProps={{ 'aria-label': 'keep screen on toggle' }}
            />
    );
};

export default ScreenWakeLock;
