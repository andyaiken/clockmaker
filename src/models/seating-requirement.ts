import type { AlignmentType } from '../enums/alignment-type';
import type { RoleType } from '../enums/role-type';
import type { SeatingRequirementType } from '../enums/seating-requirement-type';

// The modifier's owner sits next to at least one player of these types, eg the Marionette next to the Demon
export interface SeatingRequirementNeighbours {
	type: SeatingRequirementType.Neighbours;
	data: {
		types: (AlignmentType | RoleType)[];
	}
}

// Every player of these types sits in one unbroken line, eg evil players for the Lord of Typhon
export interface SeatingRequirementInLine {
	type: SeatingRequirementType.InLine;
	data: {
		types: (AlignmentType | RoleType)[];
		// If true, the modifier's owner is not at either end of the line
		ownerInMiddle: boolean;
	}
}

// At least one pair of neighbours share an alignment, eg for the Revolutionary
export interface SeatingRequirementNeighboursSameAlignment {
	type: SeatingRequirementType.NeighboursSameAlignment;
	data: {
		// The owner's player modifier that marks the pair; once it's on two players, those two must be the pair
		modifierID: string | null;
	}
}

export type SeatingRequirement = SeatingRequirementNeighbours | SeatingRequirementInLine | SeatingRequirementNeighboursSameAlignment;
