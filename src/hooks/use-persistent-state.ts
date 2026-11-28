import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

export function usePersistentState<S>(key: string, initialState: S | (() => S)): [ S, Dispatch<SetStateAction<S>> ];

export function usePersistentState<S = undefined>(key: string): [ S | undefined, Dispatch<SetStateAction<S | undefined>> ];

export function usePersistentState<S>(key: string, initialState?: S | (() => S)): [ S | undefined, Dispatch<SetStateAction<S | undefined>> ] {
	const [ state, setState ] = useState<S | undefined>(() => {
		const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(key);
		if (stored !== null) {
			return stored === 'undefined' ? undefined : JSON.parse(stored) as S;
		}

		return typeof initialState === 'function'
			? (initialState as () => S)()
			: initialState;
	});

	useEffect(() => {
		const serialized = JSON.stringify(state);
		if (serialized === undefined && state !== undefined) {
			throw new TypeError('Persistent state must be JSON-serializable');
		}
		window.localStorage.setItem(key, serialized ?? 'undefined');
	}, [ key, state ]);

	return [ state, setState ];
}
