import { useCallback, useRef, useState } from 'react';
import type { Game } from '../models/game';

// How many earlier states are kept
const LIMIT = 50;
// Changes this close together that don't add to the log (eg typing a name) count as one step
const MERGE_WITHIN = 1000;

export interface UndoToast {
	id: number;
	text: string;
}

// Keeps a short history of game states, so any change can be undone and redone.
// Changes that add to the game's log (ending a phase, a death, an outcome) are announced with a toast that offers Undo.
export const useUndoable = (game: Game | null, setGame: (game: Game | null) => void) => {
	const past = useRef<(Game | null)[]>([]);
	const future = useRef<(Game | null)[]>([]);
	const last = useRef<{ at: number, merge: boolean }>({ at: 0, merge: false });
	const [ toast, setToast ] = useState<UndoToast | null>(null);
	// Re-renders when the history changes, so canUndo and canRedo stay current
	const [ , setVersion ] = useState(0);

	const change = useCallback((next: Game | null, label?: string) => {
		const logged = (next?.history.log.length ?? 0) > (game?.history.log.length ?? 0);
		const now = Date.now();
		const merge = !label && !logged && (game !== null) && (next !== null);
		if (!(merge && last.current.merge && (now - last.current.at < MERGE_WITHIN))) {
			past.current = [ ...past.current, game ].slice(-LIMIT);
		}
		last.current = { at: now, merge: merge };
		future.current = [];
		setGame(next);
		setVersion(v => v + 1);

		const text = label ?? (logged && next ? next.history.log[ next.history.log.length - 1 ].text : null);
		if (text) {
			setToast({ id: now, text: text });
		}
	}, [ game, setGame ]);

	const undo = useCallback(() => {
		if (past.current.length === 0) {
			return null;
		}
		const previous = past.current[ past.current.length - 1 ];
		past.current = past.current.slice(0, -1);
		future.current = [ game, ...future.current ];
		last.current = { at: 0, merge: false };
		setGame(previous);
		setToast(null);
		setVersion(v => v + 1);
		return previous;
	}, [ game, setGame ]);

	const redo = useCallback(() => {
		if (future.current.length === 0) {
			return null;
		}
		const next = future.current[ 0 ];
		future.current = future.current.slice(1);
		past.current = [ ...past.current, game ].slice(-LIMIT);
		last.current = { at: 0, merge: false };
		setGame(next);
		setToast(null);
		setVersion(v => v + 1);
		return next;
	}, [ game, setGame ]);

	const dismissToast = useCallback(() => setToast(null), []);

	return {
		change,
		undo,
		redo,
		canUndo: past.current.length > 0,
		canRedo: future.current.length > 0,
		toast,
		dismissToast
	};
};
