import { useEffect, useRef, useState } from 'react';

export interface DayTimer {
	// Length of the timer, in seconds
	duration: number;
	// When it will run out (ms since epoch); null when it isn't running
	endsAt: number | null;
}

export const useDayTimerRemaining = (timer: DayTimer) => {
	const [ now, setNow ] = useState(() => Date.now());
	const running = timer.endsAt !== null;

	useEffect(() => {
		if (!running) {
			return;
		}
		setNow(Date.now());
		const interval = window.setInterval(() => setNow(Date.now()), 250);
		return () => window.clearInterval(interval);
	}, [ running, timer.endsAt ]);

	return timer.endsAt !== null ? Math.min(timer.duration, (timer.endsAt - now) / 1000) : timer.duration;
};

// Calls onExpire once when a running timer reaches zero
export const useDayTimerExpiry = (timer: DayTimer, onExpire: () => void) => {
	const expire = useRef(onExpire);
	useEffect(() => {
		expire.current = onExpire;
	});

	useEffect(() => {
		if (timer.endsAt === null) {
			return;
		}
		const timeout = window.setTimeout(() => expire.current(), Math.max(0, timer.endsAt - Date.now()));
		return () => window.clearTimeout(timeout);
	}, [ timer.endsAt ]);
};
