// wakeLock.d.ts
interface WakeLockSentinel {
    type: 'screen';
    release: () => void;
}

interface Navigator {
    wakeLock: {
        request: (type: 'screen') => Promise<WakeLockSentinel>;
    };
}
