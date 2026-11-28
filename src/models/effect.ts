import type { AlignmentType } from '../enums/alignment-type';
import type { EffectType } from '../enums/effect-type';
import type { RoleType } from '../enums/role-type';
import type { ShowPlayer } from './show-player';

interface _Effect {
	id: string;
}

export interface EffectBelievesTheyAre extends _Effect {
	type: EffectType.BelievesTheyAre;
	data: {
		restrictions: {
			types: (AlignmentType | RoleType)[];
			// If true, only in-play characters; if false, only out-of-play characters on this script; if null, any character on this script
			inPlay: boolean | null;
		};
		characterID: string;
	}
}

export interface EffectCanRegisterAs extends _Effect {
	type: EffectType.CanRegisterAs;
	data: {
		registerAs: (AlignmentType | RoleType)[];
		// If true, this only affects the modifier owner's ability (eg the Fortune Teller's red herring)
		onlyToOwner: boolean;
	}
}

export interface EffectHasTheAbilityOf extends _Effect {
	type: EffectType.HasTheAbilityOf;
	data: {
		characterID: string;
		restrictions: {
			types: (AlignmentType | RoleType)[];
			// If true, only in-play characters; if false, only out-of-play characters on this script; if null, any character on this script
			inPlay: boolean | null;
		};
	}
}

export interface EffectIsDrunk extends _Effect {
	type: EffectType.IsDrunk;
	data: null
}

export interface EffectIsPoisoned extends _Effect {
	type: EffectType.IsPoisoned;
	data: null
}

export interface EffectIsProtected extends _Effect {
	type: EffectType.IsProtected;
	data: {
		fromExecution: boolean;
		fromMurder: boolean;
	}
}

export interface EffectHasVoteModified extends _Effect {
	type: EffectType.HasVoteModified;
	data: {
		text: string;
	}
}

export interface EffectHasWinCondition extends _Effect {
	type: EffectType.HasWinCondition;
	data: {
		text: string;
	}
}

export interface EffectIsWoken extends _Effect {
	type: EffectType.IsWoken;
	data: {
		// Which nights this player is woken; they wake just after the modifier owner's place in the night order
		nights: 'first' | 'other' | 'all';
		// What the Storyteller shows or asks them, in order
		show: ShowPlayer[];
	}
}

export type Effect = EffectBelievesTheyAre | EffectCanRegisterAs | EffectHasTheAbilityOf | EffectIsDrunk | EffectIsPoisoned | EffectIsProtected | EffectHasVoteModified | EffectHasWinCondition | EffectIsWoken;
