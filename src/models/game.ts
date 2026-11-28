import type { Character } from './character';
import type { Day } from './day';
import type { LogEntry } from './log-entry';
import type { Night } from './night';
import type { Phase } from './phase';
import type { Player } from './player';
import type { PlayerModifier } from './modifier';
import type { Script } from './script';

// How the grimoire stood when a phase ended, for looking back
export interface PhaseSnapshot {
	phase: Phase;
	players: Player[];
	modifiers: PlayerModifier[];
	otherCharacters: Character[];
}

// A line drawn on the circle. Points are stored against the ring rather than the screen, so ink turns with its seats:
// r runs from 0 at the centre to 1 at the rim, and seat is a position round the ring in seats (1.5 is halfway between seats 2 and 3)
export interface InkStroke {
	points: { r: number, seat: number }[];
}

export interface Game {
	id: string;
	script: Script;
	players: Player[];
	bag: Character[];
	bluffs: Character[];
	phase: Phase;

	history: {
		nights: Night[];
		days: Day[];
		log: LogEntry[];
		// Missing from games saved before looking back was possible
		snapshots?: PhaseSnapshot[];
	};

	// Fabled / loric characters
	otherCharacters: Character[];

	// Modifiers placed by the Storyteller, not belonging to any character
	modifiers: PlayerModifier[];

	notes: string;

	// The seat drawn at the top of the grimoire, so the Storyteller can turn the circle to match the table; 0 if not set
	topSeat?: number;

	// Ink drawn on the circle, by phase (eg 'Day-2'); each phase starts with a clean circle
	ink?: Record<string, InkStroke[]>;
}
