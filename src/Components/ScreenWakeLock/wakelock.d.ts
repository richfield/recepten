// wakeLock.d.ts
interface WakeLockSentinel extends EventTarget {
    type: 'screen';
    released: boolean;
    release: () => Promise<void>;
}

interface Navigator {
    wakeLock: {
        request: (type: 'screen') => Promise<WakeLockSentinel>;
    };
    standalone?: boolean;
}
