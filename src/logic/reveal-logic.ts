import type { RevealContent, RevealItem } from '../models/reveal';
import { AlignmentType } from '../enums/alignment-type';
import type { Game } from '../models/game';
import type { Player } from '../models/player';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';
import type { ShowPlayer } from '../models/show-player';
import { ShowPlayerType } from '../enums/show-player-type';
import { Utility } from '../utils/utility';

export class RevealLogic {
	// The ShowPlayer types that can be shown on the overlay, in the order the ad-hoc picker lists them
	static adHocTypes = [
		ShowPlayerType.YouAre,
		ShowPlayerType.Character,
		ShowPlayerType.Player,
		ShowPlayerType.Role,
		ShowPlayerType.Alignment,
		ShowPlayerType.YesNo,
		ShowPlayerType.Number,
		ShowPlayerType.DemonIs,
		ShowPlayerType.MinionsAre,
		ShowPlayerType.BluffsAre,
		ShowPlayerType.Grimoire,
		ShowPlayerType.Prompt
	];

	// Turns a ShowPlayer template into a reveal item, filling in whatever the game state already tells us
	// Returns null for steps that are never shown to a player
	// The name of an ad hoc item type in the reveal builder
	static getTypeLabel = (type: ShowPlayerType) => {
		return type === ShowPlayerType.Prompt ? 'Text only' : type;
	};

	// What kind of thing an item shows, eg 'Choose players'
	static getItemLabel = (item: RevealItem) => {
		switch (item.content.type) {
			case 'none':
				return 'Text only';
			case 'you_are':
				return 'You are';
			case 'characters':
				return 'Characters';
			case 'players':
				return 'Players';
			case 'role':
				return 'Character type';
			case 'alignment':
				return 'Alignment';
			case 'number':
				return 'Number';
			case 'yes_no':
				return 'Yes / No';
			case 'grimoire':
				return 'Grimoire';
			case 'choose_players':
				return 'Choose players';
			case 'choose_characters':
				return 'Choose characters';
			case 'choose_yes_no':
				return 'Choose yes / no';
		}
	};

	// eg 'Their choice (1 of 2)'
	static getChoiceLabel = (count: number, min: number, max: number) => {
		const range = min === max ? `${max}` : `${min}-${max}`;
		return `Their choice (${count} of ${range})`;
	};

	// The players a player can choose from, given the step's restrictions
	static getChoosablePlayers = (game: Game, restrictions: ('not_self' | 'alive' | 'dead')[], ownerID: string | null) => {
		return game.players
			.filter(p => !(restrictions.includes('not_self') && (p.id === ownerID)))
			.filter(p => !restrictions.includes('alive') || (p.state === PlayerState.Alive))
			.filter(p => !restrictions.includes('dead') || (p.state !== PlayerState.Alive));
	};

	static createItem = (showPlayer: ShowPlayer, game: Game, player: Player | null): RevealItem | null => {
		if (showPlayer.type === ShowPlayerType.StorytellerAction) {
			return null;
		}

		const includeAlignment = showPlayer.type === ShowPlayerType.YouAre ? showPlayer.data.includeAlignment : false;
		const content = RevealLogic.createChoiceContent(showPlayer) ?? RevealLogic.createContent(showPlayer.type, game, player, includeAlignment);
		if (!content) {
			return null;
		}

		return {
			id: Utility.guid(),
			text: showPlayer.text,
			content: content
		};
	};

	// Creates a reveal item of the given type, with default text
	static createAdHocItem = (type: ShowPlayerType, game: Game, player: Player | null): RevealItem | null => {
		const content = RevealLogic.createContent(type, game, player, false);
		if (!content) {
			return null;
		}

		return {
			id: Utility.guid(),
			text: RevealLogic.getDefaultText(type),
			content: content
		};
	};

	static createContent = (type: ShowPlayerType, game: Game, player: Player | null, includeAlignment: boolean): RevealContent | null => {
		switch (type) {
			case ShowPlayerType.Prompt:
			case ShowPlayerType.ChoosePlayers:
			case ShowPlayerType.ChooseCharacters:
			case ShowPlayerType.ChooseYesNo:
				// The player answers by pointing; only the prompt is shown
				return { type: 'none' };
			case ShowPlayerType.YouAre:
				return {
					type: 'you_are',
					characterID: player?.character?.id ?? null,
					alignment: includeAlignment && player ? player.alignment : null
				};
			case ShowPlayerType.Character:
				return { type: 'characters', characterIDs: [] };
			case ShowPlayerType.Player:
				return { type: 'players', playerIDs: [] };
			case ShowPlayerType.Role:
				return { type: 'role', role: RoleType.Townsfolk };
			case ShowPlayerType.Alignment:
				return { type: 'alignment', alignment: AlignmentType.Good };
			case ShowPlayerType.YesNo:
				return { type: 'yes_no', value: true };
			case ShowPlayerType.Number:
				return { type: 'number', value: 0 };
			case ShowPlayerType.DemonIs:
				return { type: 'players', playerIDs: RevealLogic.getPlayerIDsWithRole(game, RoleType.Demon) };
			case ShowPlayerType.MinionsAre:
				return { type: 'players', playerIDs: RevealLogic.getPlayerIDsWithRole(game, RoleType.Minion) };
			case ShowPlayerType.BluffsAre:
				// Anyone who's already been given bluffs keeps the same ones; otherwise start from the Demon's
				return { type: 'characters', characterIDs: (player?.bluffs ?? game.bluffs).map(c => c.id) };
			case ShowPlayerType.Grimoire:
				return { type: 'grimoire' };
			case ShowPlayerType.StorytellerAction:
				return null;
		}
	};

	// For steps where the player chooses something: holds their answer, ready to be filled in
	static createChoiceContent = (showPlayer: ShowPlayer): RevealContent | null => {
		switch (showPlayer.type) {
			case ShowPlayerType.ChoosePlayers:
				return {
					type: 'choose_players',
					playerIDs: [],
					min: showPlayer.data.min,
					max: showPlayer.data.max,
					restrictions: showPlayer.data.restrictions
				};
			case ShowPlayerType.ChooseCharacters:
				return {
					type: 'choose_characters',
					characterIDs: [],
					min: showPlayer.data.min,
					max: showPlayer.data.max,
					types: showPlayer.data.types,
					inPlay: showPlayer.data.inPlay
				};
			case ShowPlayerType.ChooseYesNo:
				return { type: 'choose_yes_no', value: null };
			default:
				return null;
		}
	};

	static getDefaultText = (type: ShowPlayerType): string => {
		switch (type) {
			case ShowPlayerType.YouAre:
				return 'You are';
			case ShowPlayerType.Character:
				return 'This character';
			case ShowPlayerType.Player:
				return 'This player';
			case ShowPlayerType.Role:
				return 'This type of character';
			case ShowPlayerType.Alignment:
				return 'This alignment';
			case ShowPlayerType.YesNo:
				return '';
			case ShowPlayerType.Number:
				return '';
			case ShowPlayerType.DemonIs:
				return 'Your Demon is';
			case ShowPlayerType.MinionsAre:
				return 'Your Minions are';
			case ShowPlayerType.BluffsAre:
				return 'These characters are not in play';
			case ShowPlayerType.Grimoire:
				return 'This is the Grimoire';
			default:
				return '';
		}
	};

	static getPlayerIDsWithRole = (game: Game, role: RoleType) => {
		return game.players
			.filter(p => p.character?.role === role)
			.map(p => p.id);
	};
}
