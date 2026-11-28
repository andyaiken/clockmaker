// What tapping a seat does during the day, while the Storyteller is running a nomination or a vote
export type DayAction =
	// Picking the nominator, then the nominee; nothing is recorded until the vote starts
	| { type: 'nominate'; isExile: boolean; nominatorID: string | null; nomineeID: string | null }
	// Tapping a seat raises or lowers that player's hand
	| { type: 'vote'; nominationID: string };
