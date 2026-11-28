import { useEffect, useRef } from 'react';

// Keys to actions, eg { 'p': () => ... }; digit gets seat numbers, typed one or two digits at a time
export interface ShortcutHandlers {
	keys: Record<string, () => unknown>;
	digit?: (value: number) => void;
}

// Whether the key is going into something the user is typing in
const isTyping = (target: EventTarget | null) => {
	const element = target as HTMLElement | null;
	if (!element) {
		return false;
	}
	return (element.tagName === 'INPUT') || (element.tagName === 'TEXTAREA') || element.isContentEditable;
};

const isControl = (target: EventTarget | null) => {
	const element = target as HTMLElement | null;
	return !!element && ((element.tagName === 'BUTTON') || !!element.closest('[role=button], [role=radio], [role=tab], [role=switch], [role=menu]'));
};

// Keyboard shortcuts for a Magic Keyboard; they pause while a text field has focus
export const useShortcuts = (handlers: ShortcutHandlers, enabled: boolean) => {
	const latest = useRef(handlers);
	latest.current = handlers;
	const digits = useRef<{ value: string, timer: number } | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const flushDigits = () => {
			if (digits.current) {
				window.clearTimeout(digits.current.timer);
				const value = Number(digits.current.value);
				digits.current = null;
				latest.current.digit?.(value);
			}
		};

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || e.defaultPrevented) {
				return;
			}

			// Seat numbers: a second digit within a moment makes a two-digit seat
			if (/^[0-9]$/.test(e.key) && latest.current.digit) {
				e.preventDefault();
				const value = (digits.current?.value ?? '') + e.key;
				if (digits.current) {
					window.clearTimeout(digits.current.timer);
				}
				digits.current = { value, timer: window.setTimeout(flushDigits, 600) };
				if (value.length >= 2) {
					flushDigits();
				}
				return;
			}

			const key = e.key === ' ' ? 'space' : (e.key.length === 1 ? e.key.toLowerCase() : e.key);
			// Space and the arrows keep their usual job on a focused control, eg pressing a button
			if (((key === 'space') || key.startsWith('Arrow')) && isControl(e.target)) {
				return;
			}
			const handler = latest.current.keys[ key ];
			if (handler) {
				// Space would otherwise press whichever button has focus
				e.preventDefault();
				handler();
			}
		};

		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			if (digits.current) {
				window.clearTimeout(digits.current.timer);
				digits.current = null;
			}
		};
	}, [ enabled ]);
};

// The night panel listens for these, so shortcuts can step through the night without reaching into it
export type NightCommand = 'next' | 'previous' | 'show';
export const NIGHT_COMMAND_EVENT = 'clockmaker-night-command';
export const sendNightCommand = (command: NightCommand) => window.dispatchEvent(new CustomEvent<NightCommand>(NIGHT_COMMAND_EVENT, { detail: command }));
