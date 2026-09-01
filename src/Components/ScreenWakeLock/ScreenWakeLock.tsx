import React, { useEffect, useRef, useState } from 'react';
import { Switch } from '@mui/material';

const ScreenWakeLock: React.FC = () => {
    const [isWakeLockActive, setIsWakeLockActive] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const isPWA =
        typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
            ('standalone' in window.navigator && window.navigator.standalone === true));

    const isIOS =
        typeof navigator !== 'undefined' &&
        (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const supportsWakeLock =
        typeof navigator !== 'undefined' && 'wakeLock' in navigator;

    const requestWakeLock = async () => {
        try {
            if (!supportsWakeLock || isIOS) {
                return;
            }

            const wl = await navigator.wakeLock.request('screen');
            wakeLockRef.current = wl;
            setIsWakeLockActive(true);

            wl.addEventListener('release', () => {
                if (wakeLockRef.current === wl) {
                    wakeLockRef.current = null;
                }
                setIsWakeLockActive(false);
            });
        } catch (err) {
            console.error('Failed to acquire wake lock:', err);
            setIsWakeLockActive(false);
        }
    };

    const releaseWakeLock = async () => {
        try {
            const currentWakeLock = wakeLockRef.current;
            if (currentWakeLock) {
                await currentWakeLock.release();
            }
        } catch (err) {
            console.error('Failed to release wake lock:', err);
        } finally {
            wakeLockRef.current = null;
            setIsWakeLockActive(false);
        }
    };

    const enableFallback = async () => {
        if (!videoRef.current) {
            return;
        }

        const video = videoRef.current;
        video.muted = true;
        video.playsInline = true;
        video.loop = true;

        try {
            if (video.paused) {
                await video.play();
            }
        } catch (err) {
            console.error("iOS fallback video couldn't play:", err);
        }
    };

    const disableFallback = () => {
        if (!videoRef.current) {
            return;
        }

        const video = videoRef.current;
        video.pause();
        video.currentTime = 0;
    };

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'hidden' && wakeLockRef.current && !isIOS) {
                await releaseWakeLock();
                return;
            }

            if (
                document.visibilityState === 'visible' &&
                isWakeLockActive &&
                !isIOS &&
                supportsWakeLock &&
                !wakeLockRef.current
            ) {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isWakeLockActive, isIOS, supportsWakeLock]);

    useEffect(() => {
        return () => {
            if (wakeLockRef.current && !isIOS) {
                void releaseWakeLock();
            }
            disableFallback();
        };
    }, [isIOS]);

    const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const enable = event.target.checked;

        if (isIOS && isPWA) {
            if (enable) {
                await enableFallback();
            } else {
                disableFallback();
            }
            setIsWakeLockActive(enable);
            return;
        }

        if (enable) {
            await requestWakeLock();
        } else {
            await releaseWakeLock();
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

            {(isIOS && isPWA) && (
                <video
                    ref={videoRef}
                    playsInline
                    muted
                    loop
                    preload="auto"
                    style={{ display: 'none' }}
                    src="data:video/mp4;base64,AAAAHGZ0eXBtNAAACG1wNGEAAACBbW9vdgAAAGxtdmhkAAAAANr7AAB6+wAAAgAAAG5tb2R1AAAAAAEAAQABAAAAAAAtaGRscgAAAAAAAAAAc291bmQAAAAAAAAAAAAAAAABAAAAL2J0cmQAAAABAAAAAwAAAFJlc2RzAAAAAAMAAABkAAAAAHBhdHRzAAAAAQAAAAEAAAACAAAAAAAcAAAAAQAAABx0cmFrAAAAXHRraGQAAAABAAAAAwAAAFRraGQAAAABAAAAAwAAAHN0dHMAAAAUAAAAAQAAAAEAAAABAAAAHQAAABRzdHNjAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAUc3RzegAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAdAAASSHRyYWsAAABcdGtoZAAAAAEAAAADAAAAVGtoZAAAAAEAAAADAAAAc3R0cwAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAA"
                />
            )}
        </>
    );
};

export default ScreenWakeLock;