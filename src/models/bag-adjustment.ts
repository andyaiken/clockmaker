import type { BagAdjustmentType } from '../enums/bag-adjustment-type';
import type { RoleType } from '../enums/role-type';

export interface BagAdjustmentChangeRoleCount {
	type: BagAdjustmentType.ChangeRoleCount;
	data: {
		role: RoleType;
		// The changes the Storyteller can choose from, eg [ 2 ] for the Baron, [ -1, 1 ] for the Godfather; null means any change
		options: number[] | null;
	}
}

export interface BagAdjustmentSetRoleCount {
	type: BagAdjustmentType.SetRoleCount;
	data: {
		role: RoleType;
		// null means any count, eg X Outsiders for the Xaan
		count: number | null;
	}
}

// A character that must be in the bag, eg the Damsel for the Huntsman; copies already in the bag count; each copy added replaces a Townsfolk, so its own role's count goes up (eg +1 Outsider for the Damsel)
export interface BagAdjustmentAddCharacter {
	type: BagAdjustmentType.AddCharacter;
	data: {
		characterID: string;
		// The total number of copies the bag can contain, eg [ 1 ] for the Damsel, [ 1, 2, 3 ] for the Village Idiot; 'majority' means more than half the players, eg for Legion
		copies: number[] | 'majority';
	}
}

// Every token of a role is replaced by a copy of a character, eg every Minion is Riot
export interface BagAdjustmentReplaceRole {
	type: BagAdjustmentType.ReplaceRole;
	data: {
		role: RoleType;
		characterID: string;
	}
}

// Tokens of some roles may be swapped for duplicates of characters already in the bag, eg for the Pope
export interface BagAdjustmentAllowDuplicates {
	type: BagAdjustmentType.AllowDuplicates;
	data: {
		// The roles whose tokens may be swapped
		replace: RoleType[];
		// The roles whose in-play characters may be duplicated
		copy: RoleType[];
	}
}

export type BagAdjustment = BagAdjustmentChangeRoleCount | BagAdjustmentSetRoleCount | BagAdjustmentAddCharacter | BagAdjustmentReplaceRole | BagAdjustmentAllowDuplicates;
