export interface Nomination {
	id: string;
	nominatorID: string;
	nomineeID: string;
	// The players who voted, in the order the hand went round
	voterIDs: string[];
	// The total, after vote modifiers; the Storyteller can override it
	votes: number;
	// A vote to exile a Traveller, which anyone can vote in
	isExile: boolean;
}

export interface Day {
	number: number;
	nominations: Nomination[];
	executedPlayerID: string | null;
	// Any number of Travellers can be exiled in a day
	exiledPlayerIDs: string[];
}
