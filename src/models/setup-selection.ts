// What the Storyteller has picked in the setup section, ready to place on a seat
export type SetupSelection =
	| { type: 'character'; characterID: string }
	| { type: 'modifier'; playerID: string; modifierID: string };
