import { useSyncExternalStore } from 'react';

export const MIN_SCREEN_WIDTH = 1080;
export const MIN_SCREEN_HEIGHT = 660;

export type ScreenFit = 'ok' | 'portrait' | 'small';

const query = `(max-width: ${MIN_SCREEN_WIDTH - 1}px), (max-height: ${MIN_SCREEN_HEIGHT - 1}px)`;

const subscribe = (onChange: () => void) => {
	window.addEventListener('resize', onChange);
	return () => window.removeEventListener('resize', onChange);
};

const getFit = (): ScreenFit => {
	if (!window.matchMedia(query).matches) {
		return 'ok';
	}
	// A big enough screen held upright only needs turning
	const w = window.innerWidth;
	const h = window.innerHeight;
	if ((h > w) && (h >= MIN_SCREEN_WIDTH) && (w >= MIN_SCREEN_HEIGHT)) {
		return 'portrait';
	}
	return 'small';
};

export const useScreenFit = () => useSyncExternalStore(subscribe, getFit, () => 'ok' as ScreenFit);
