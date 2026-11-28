import type { AlignmentType } from '../enums/alignment-type';
import type { BagAdjustment } from './bag-adjustment';
import type { Effect } from './effect';
import type { ModifierType } from '../enums/modifier-type';
import type { RoleType } from '../enums/role-type';
import type { SeatingRequirement } from './seating-requirement';

interface _Modifier {
	id: string;
	label: string;
}

export interface BagModifier extends _Modifier {
	type: ModifierType.BagModifier;
	data: {
		text: string;
		// Empty when the change can't be codified, eg 'Most players are Legion'
		adjustments: BagAdjustment[];
	};
}

export interface SeatingModifier extends _Modifier {
	type: ModifierType.SeatingModifier;
	data: {
		text: string;
		requirements: SeatingRequirement[];
	};
}

export interface PlayerModifier extends _Modifier {
	type: ModifierType.PlayerModifier;
	data: {
		// Whether this modifier applies to the player who owns it, or to the player it's added to
		type: 'self' | 'assigned';
		// Whether this modifier is placed during setup: 'yes' must be placed before the game can start; 'optional' may be placed
		setup: 'yes' | 'no' | 'optional';
		// When this modifier is removed from everyone automatically: at the end of the night, at the end of the day, or never
		expires: 'never' | 'dawn' | 'dusk';
		text: string;
		restrictions: (RoleType | AlignmentType | 'not_self')[];
		effects: Effect[];
		// The most players this can be placed on at once; null means no limit
		max: number | null;
		// The players this has been placed on
		playerIDs: string[];
	};
}

export type Modifier = BagModifier | SeatingModifier | PlayerModifier;
