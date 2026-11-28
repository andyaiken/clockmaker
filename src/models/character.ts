import type { Modifier } from './modifier';
import type { RoleType } from '../enums/role-type';
import type { ShowPlayer } from './show-player';

export interface Character {
	id: string;
	name: string;
	role: RoleType;
	quote: string;
	ability: string;
	wakesFirstNight: ShowPlayer[];
	wakesOtherNights: ShowPlayer[];
	modifiers: Modifier[];
	// Rule changes that apply when this character and another are both on the script
	jinxes: Jinx[];
}

export interface Jinx {
	// The other character in the jinx
	characterID: string;
	text: string;
}
