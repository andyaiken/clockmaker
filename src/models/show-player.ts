import type { AlignmentType } from '../enums/alignment-type';
import type { RoleType } from '../enums/role-type';
import type { ShowPlayerType } from '../enums/show-player-type';

interface _ShowPlayer {
	id: string;
	// Shown to the player, eg 'Your grandchild is'
	text: string;
	// For the Storyteller only
	note: string;
}

// Text only, with nothing else shown
export interface ShowPlayerPrompt extends _ShowPlayer {
	type: ShowPlayerType.Prompt;
	data: null
}

export interface ShowPlayerYouAre extends _ShowPlayer {
	type: ShowPlayerType.YouAre;
	data: {
		includeAlignment: boolean;
	}
}

export interface ShowPlayerCharacter extends _ShowPlayer {
	type: ShowPlayerType.Character;
	data: {
		// Pre-fills the character from whoever holds this reminder of the waking character; null if there's nothing to go on
		fromReminder: string | null;
		// How to work out the true answer from the grimoire, if it can be
		answer?: AnswerRule | null;
	}
}

export interface ShowPlayerPlayer extends _ShowPlayer {
	type: ShowPlayerType.Player;
	data: {
		// Pre-fills the player from whoever holds these reminders of the waking character, taken in seat order
		// so the correct player isn't always shown first; index picks which of them this step shows
		fromReminders: string[];
		index: number;
	}
}

export interface ShowPlayerRole extends _ShowPlayer {
	type: ShowPlayerType.Role;
	data: null
}

export interface ShowPlayerAlignment extends _ShowPlayer {
	type: ShowPlayerType.Alignment;
	data: null
}

export interface ShowPlayerGrimoire extends _ShowPlayer {
	type: ShowPlayerType.Grimoire;
	data: null
}

export interface ShowPlayerYesNo extends _ShowPlayer {
	type: ShowPlayerType.YesNo;
	// How to work out the true answer from the grimoire, if it can be
	data: { answer: AnswerRule | null } | null
}

export interface ShowPlayerNumber extends _ShowPlayer {
	type: ShowPlayerType.Number;
	// How to work out the true answer from the grimoire, if it can be
	data: { answer: AnswerRule | null } | null
}

export interface ShowPlayerDemonIs extends _ShowPlayer {
	type: ShowPlayerType.DemonIs;
	data: null
}

export interface ShowPlayerMinionsAre extends _ShowPlayer {
	type: ShowPlayerType.MinionsAre;
	data: null
}

export interface ShowPlayerBluffsAre extends _ShowPlayer {
	type: ShowPlayerType.BluffsAre;
	data: null
}

// The player chooses between min and max players
export interface ShowPlayerChoosePlayers extends _ShowPlayer {
	type: ShowPlayerType.ChoosePlayers;
	data: {
		min: number;
		max: number;
		restrictions: ('not_self' | 'alive' | 'dead')[];
		// An optional outcome the Storyteller can apply to the choice (or other players)
		outcome: { modifierID: string; action: ChoiceOutcomeAction } | null;
	}
}

// The player chooses between min and max characters
export interface ShowPlayerChooseCharacters extends _ShowPlayer {
	type: ShowPlayerType.ChooseCharacters;
	data: {
		min: number;
		max: number;
		types: (AlignmentType | RoleType)[];
		// If true, only in-play characters; if false, only out-of-play characters; if null, any character
		inPlay: boolean | null;
	}
}

// The player answers a yes / no question
export interface ShowPlayerChooseYesNo extends _ShowPlayer {
	type: ShowPlayerType.ChooseYesNo;
	data: null
}

// Something the Storyteller does without waking anyone
export interface ShowPlayerStorytellerAction extends _ShowPlayer {
	type: ShowPlayerType.StorytellerAction;
	data: {
		action: string;
	}
}

export type ShowPlayer = ShowPlayerPrompt | ShowPlayerYouAre | ShowPlayerCharacter | ShowPlayerPlayer | ShowPlayerRole | ShowPlayerAlignment | ShowPlayerGrimoire | ShowPlayerYesNo | ShowPlayerNumber | ShowPlayerDemonIs | ShowPlayerMinionsAre | ShowPlayerBluffsAre | ShowPlayerChoosePlayers | ShowPlayerChooseCharacters | ShowPlayerStorytellerAction | ShowPlayerChooseYesNo;

// A generic question about the grimoire whose true answer the app can work out for an information step.
// 'Chosen' means the players picked in the nearest earlier choice in the same wake.
export type AnswerRule =
	// How many of the waking player's two nearest living neighbours are evil
	| { type: 'evil_living_neighbours' }
	// How many pairs of evil players sit next to each other
	| { type: 'evil_pairs' }
	// How many dead players are evil
	| { type: 'dead_evil' }
	// How many steps from a Demon to its nearest Minion
	| { type: 'demon_to_minion' }
	// The character of the player executed in the day just gone
	| { type: 'executed_character' }
	// The character of the chosen player
	| { type: 'chosen_character' }
	// Whether any chosen player is of this role (counting reminders that make them register as it to the waking player)
	| { type: 'chosen_include', role: RoleType }
	// Whether the chosen players are all the same alignment
	| { type: 'chosen_same_alignment' };

// What a choice outcome does to the players it's applied to, besides placing its reminder
export type ChoiceOutcomeAction = 'place' | 'kill' | 'revive';
