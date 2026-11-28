// A choice being made by tapping seats on the circle, eg the players the Fortune Teller chose
export interface SeatPick {
	pickedIDs: string[];
	// The seats that can be picked; the rest are dimmed
	availableIDs: string[];
	onPick: (playerID: string) => void;
}
