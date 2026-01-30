import React, { useState, useRef } from 'react';
import { Switch } from '@mui/material';

const ScreenWakeLock: React.FC = () => {
    const [isWakeLockActive, setIsWakeLockActive] = useState(false);
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

    // Fallback: tiny hidden video to keep iOS PWA awake
    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Detect PWA mode (standalone)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;

    // Detect iOS specifically
    const isIOS =
        /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const enable = event.target.checked;

        if (isIOS && isPWA) {
            // Use video fallback
            if (enable) {
                await enableFallback();
            } else {
                disableFallback();
            }
            setIsWakeLockActive(enable);
            return;
        }

        // Normal Wake Lock API
        if (enable) {
            await requestWakeLock();
        } else {
            await releaseWakeLock();
        }
    };

    const requestWakeLock = async () => {
        try {
            const wl = await navigator.wakeLock.request('screen');
            setWakeLock(wl);
            setIsWakeLockActive(true);

            wl.addEventListener('release', () => {
                setIsWakeLockActive(false);
                setWakeLock(null);
            });

        } catch (err) {
            console.error('Failed to acquire wake lock:', err);
        }
    };

    const releaseWakeLock = async () => {
        try {
            if (wakeLock) {
                await wakeLock.release();
                setWakeLock(null);
                setIsWakeLockActive(false);
            }
        } catch (err) {
            console.error('Failed to release wake lock:', err);
        }
    };

    // --- iOS PWA fallback using hidden looping video ---

    const enableFallback = async () => {
        if (!videoRef.current) return;

        try {
            await videoRef.current.play();
        } catch (err) {
            console.error("iOS fallback video couldn't play:", err);
        }
    };

    const disableFallback = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <>
            <Switch
                checked={isWakeLockActive}
                onChange={handleToggle}
                color="primary"
                inputProps={{ 'aria-label': 'keep screen on toggle' }}
            />

            {/* The tiny fallback video */}
            {(isIOS && isPWA) && (
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    loop
                    style={{ display: 'none' }}
                    src="data:video/mp4;base64,AAAAHGZ0eXBtNAAACG1wNGEAAACBbW9vdgAAAGxtdmhkAAAAANr7AAB6+wAAAgAAAG5tb2R1AAAAAAEAAQABAAAAAAAtaGRscgAAAAAAAAAAc291bmQAAAAAAAAAAAAAAAABAAAAL2J0cmQAAAABAAAAAwAAAFJlc2RzAAAAAAMAAABkAAAAAHBhdHRzAAAAAQAAAAEAAAACAAAAAAAcAAAAAQAAABx0cmFrAAAAXHRraGQAAAABAAAAAwAAAFRraGQAAAABAAAAAwAAAHN0dHMAAAAUAAAAAQAAAAEAAAABAAAAHQAAABRzdHNjAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAUc3RzegAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAdAAASSHRyYWsAAABcdGtoZAAAAAEAAAADAAAAVGtoZAAAAAEAAAADAAAAc3R0cwAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAUc3RzcwAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAABRzdHR6AAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAHQAAABRzdHNhAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAA"
                />
            )}
        </>
    );
};

export default ScreenWakeLock;