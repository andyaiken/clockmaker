import type { Phase } from './phase';

export interface LogEntry {
	id: string;
	timestamp: number;
	phase: Phase;
	text: string;
}
