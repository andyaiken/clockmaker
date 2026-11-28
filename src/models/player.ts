import type { AlignmentType } from '../enums/alignment-type';
import type { Character } from './character';
import type { Phase } from './phase';
import type { PlayerState } from '../enums/player-state';

export interface Death {
	phase: Phase;
	cause: string;
}

export interface Player {
	id: string;
	name: string;
	character: Character | null;
	alignment: AlignmentType;
	state: PlayerState;
	death: Death | null;
	// The characters this player has been told are not in play (eg the Demon's, a Lunatic's or a Snitch Minion's bluffs);
	// missing until they've been shown some
	bluffs?: Character[];
}
