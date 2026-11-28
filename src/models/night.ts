import type { AlignmentType } from '../enums/alignment-type';

// What happened at one step of the night: what the player chose, or what they were shown
export interface NightStepRecord {
	// The ShowPlayer step this records
	stepID: string;
	// The player who was woken; null for Storyteller actions
	playerID: string | null;
	// Absent on older records, which were shown rather than ignored
	ignored?: boolean;
	// Absent on older records, whose question stages were already complete
	answerComplete?: boolean;
	playerIDs: string[];
	characterIDs: string[];
	number: number | null;
	yesNo: boolean | null;
	alignment: AlignmentType | null;
}

export interface Night {
	number: number;
	steps: NightStepRecord[];
}
