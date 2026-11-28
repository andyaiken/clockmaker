import type { AlignmentType } from '../enums/alignment-type';
import type { RoleType } from '../enums/role-type';

// The filled-in values shown alongside a reveal item's text
export type RevealContent =
	// Text only
	| { type: 'none' }
	| { type: 'you_are'; characterID: string | null; alignment: AlignmentType | null }
	| { type: 'characters'; characterIDs: string[] }
	| { type: 'players'; playerIDs: string[] }
	| { type: 'role'; role: RoleType }
	| { type: 'alignment'; alignment: AlignmentType }
	| { type: 'number'; value: number }
	| { type: 'yes_no'; value: boolean }
	| { type: 'grimoire' }
	// The player's answer to a choose step; only the prompt text is shown on the overlay
	| { type: 'choose_players'; playerIDs: string[]; min: number; max: number; restrictions: ('not_self' | 'alive' | 'dead')[] }
	| { type: 'choose_characters'; characterIDs: string[]; min: number; max: number; types: (AlignmentType | RoleType)[]; inPlay: boolean | null }
	| { type: 'choose_yes_no'; value: boolean | null };

export interface RevealItem {
	id: string;
	// Shown to the player, eg 'Your grandchild is'
	text: string;
	content: RevealContent;
}

// Everything shown to a player at once on the full-screen overlay
export interface Reveal {
	items: RevealItem[];
	// The player being shown it, so maps can mark their seat 'You'; null for a group
	playerID?: string | null;
}
