import { useEffect } from 'react';

// Keeps the screen on while a game is open (Safari on iPadOS 16.4 and later); the lock is let go when the app is in the background,
// so it's asked for again whenever the app comes back
export const useWakeLock = (active: boolean) => {
	useEffect(() => {
		if (!active || !('wakeLock' in navigator)) {
			return;
		}

		let lock: WakeLockSentinel | null = null;
		let cancelled = false;

		const request = async () => {
			if (document.visibilityState !== 'visible') {
				return;
			}
			try {
				const sentinel = await navigator.wakeLock.request('screen');
				if (cancelled) {
					void sentinel.release();
				} else {
					lock = sentinel;
				}
			} catch {
				// Not allowed right now (eg low power mode); the screen will sleep as usual
			}
		};

		const onVisibility = () => {
			if (document.visibilityState === 'visible') {
				void request();
			}
		};

		void request();
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			cancelled = true;
			document.removeEventListener('visibilitychange', onVisibility);
			void lock?.release();
		};
	}, [ active ]);
};
