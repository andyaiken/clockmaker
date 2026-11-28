import { AlignmentType } from '../enums/alignment-type';
import { BagAdjustmentType } from '../enums/bag-adjustment-type';
import type { Character } from '../models/character';
import { CharacterLogic } from './character-logic';
import { Factory } from './factory';
import type { Game } from '../models/game';
import { GameLogic } from './game-logic';
import { HistoryLogic } from './history-logic';
import { ModifierType } from '../enums/modifier-type';
import { PhaseLogic } from './phase-logic';
import { PhaseType } from '../enums/phase-type';
import type { Player } from '../models/player';
import type { PlayerModifier } from '../models/modifier';
import { RoleType } from '../enums/role-type';
import type { Script } from '../models/script';
import { ScriptLogic } from './script-logic';
import { SeatingLogic } from './seating-logic';
import type { SetupSelection } from '../models/setup-selection';
import { Utility } from '../utils/utility';

// Everything before the first night: building the bag, then placing characters and setup reminders on the seats
export class SetupLogic {
	// A seat still has the name it was given when the game was created, eg 'Seat 3'
	static isDefaultName = (name: string) => /^Seat \d+$/.test(name);

	// Names shared by more than one player (ignoring case and spaces), which make players hard to tell apart
	static getDuplicateNames = (game: Game) => {
		const names = game.players.map(p => p.name.trim()).filter(n => !SetupLogic.isDefaultName(n));
		return names.filter((n, i) => names.findIndex(m => m.toLowerCase() === n.toLowerCase()) !== i)
			.filter((n, i, list) => list.findIndex(m => m.toLowerCase() === n.toLowerCase()) === i);
	};

	// Whether a script's type suits this many players
	static isScriptSuitable = (script: Script, players: number) => {
		return script.type === ScriptLogic.getScriptTypeForPlayerCount(players);
	};

	static getScriptsForPlayers = (scripts: Script[], players: number) => {
		return scripts.filter(s => SetupLogic.isScriptSuitable(s, players));
	};

	// Evil only learns each other in games of 7 or more, so smaller (Teensyville) games have no bluffs
	static getBluffCount = (players: number) => {
		return players >= 7 ? 3 : 0;
	};

	// The bag is full, with its bluffs if the game has any
	static isBagReady = (script: Script | null, players: number, bagIDs: string[], bluffIDs: string[]) => {
		if (!script) {
			return false;
		}
		if (bluffIDs.length !== SetupLogic.getBluffCount(players)) {
			return false;
		}
		return bagIDs.length === players;
	};

	// The script characters of a role that haven't been put in the bag or the bluffs
	static getUnselectedCharacters = (characters: Character[], role: RoleType, bagIDs: string[], bluffIDs: string[]) => {
		return characters.filter(c => (c.role === role) && !bagIDs.includes(c.id) && !bluffIDs.includes(c.id));
	};

	// The characters among these IDs, optionally of one role
	static getSelectedCharacters = (characters: Character[], ids: string[], role?: RoleType) => {
		return characters.filter(c => ids.includes(c.id) && ((role === undefined) || (c.role === role)));
	};

	// More characters of a role are in the bag than there is room for, eg after adding a Baron when the Townsfolk were already full
	static isRoleOverfull = (characters: Character[], bagIDs: string[], role: RoleType, count: number) => {
		return SetupLogic.getSelectedCharacters(characters, bagIDs, role).length > count;
	};

	// Bluffs are good characters that aren't in play
	static bluffRoles = [ RoleType.Townsfolk, RoleType.Outsider ];

	static addToBag = (bagIDs: string[], id: string) => {
		return bagIDs.includes(id) ? bagIDs : [ ...bagIDs, id ];
	};

	static addToBluffs = (players: number, bluffIDs: string[], id: string) => {
		return (bluffIDs.length >= SetupLogic.getBluffCount(players)) || bluffIDs.includes(id) ? bluffIDs : [ ...bluffIDs, id ];
	};

	// Fills the bag's empty slots with random script characters, then the bluffs (if the game has any)
	// Characters are added one at a time, recounting after each, so bag modifiers (eg the Baron's extra Outsiders) are honoured
	static fillBag = (players: number, scriptCharacters: Character[], bagIDs: string[], bluffIDs: string[]) => {
		const bag = [ ...bagIDs ];
		const roles = [ RoleType.Demon, RoleType.Minion, RoleType.Outsider, RoleType.Townsfolk ];
		const getCharacters = (ids: string[]) => ids.map(id => scriptCharacters.find(c => c.id === id) ?? CharacterLogic.getCharacter(id));
		const countInBag = (ids: string[], role: RoleType) => getCharacters(ids).filter(c => c.role === role).length;
		const isAvailable = (c: Character) => !bag.includes(c.id) && !bluffIDs.includes(c.id);
		// Roles with no character left that fits are skipped, so the loop always ends
		const stuck: RoleType[] = [];

		while (bag.length < players) {
			const characters = getCharacters(bag);
			const counts = GameLogic.getRoleCounts(players, characters).counts;

			// A character that a bag modifier requires, eg the Damsel for the Huntsman
			const required = characters
				.flatMap(c => c.modifiers)
				.flatMap(m => m.type === ModifierType.BagModifier ? m.data.adjustments : [])
				.flatMap(a => (a.type === BagAdjustmentType.AddCharacter) && ((a.data.copies === 'majority') || (Math.min(...a.data.copies) > 0)) ? [ a.data.characterID ] : [])
				// The setup page only shows script characters, so one that isn't on the script is left to the Storyteller
				.find(id => !bag.includes(id) && !bluffIDs.includes(id) && scriptCharacters.some(c => c.id === id));
			if (required) {
				bag.push(required);
				continue;
			}

			const role = roles.find(r => !stuck.includes(r) && (countInBag(bag, r) < counts[ r ]));
			if (!role) {
				break;
			}

			// A character is only added if it doesn't leave another role with more characters than it has room for
			const pick = Utility.shuffle(scriptCharacters.filter(c => (c.role === role) && isAvailable(c)))
				.find(c => {
					const ids = [ ...bag, c.id ];
					const newCounts = GameLogic.getRoleCounts(players, getCharacters(ids)).counts;
					return roles.every(r => countInBag(ids, r) <= newCounts[ r ]);
				});
			if (pick) {
				bag.push(pick.id);
			} else {
				stuck.push(role);
			}
		}

		// Bluffs are good characters that aren't in play
		const bluffs = [
			...bluffIDs,
			...Utility.shuffle(scriptCharacters.filter(c => ((c.role === RoleType.Townsfolk) || (c.role === RoleType.Outsider)) && isAvailable(c)))
				.slice(0, Math.max(0, SetupLogic.getBluffCount(players) - bluffIDs.length))
				.map(c => c.id)
		];

		return { bagIDs: bag, bluffIDs: bluffs };
	};

	// A new game from the bag; when re-racking, the players keep their names
	static createGame = (data: { players: number, script: Script, bagIDs: string[], bluffIDs: string[], otherCharacterIDs: string[], playerNames: string[] | null }): Game => {
		const game = Factory.createGame({
			players: data.players,
			script: data.script,
			bag: data.bagIDs.map(CharacterLogic.getCharacter),
			bluffs: data.bluffIDs.map(CharacterLogic.getCharacter),
			otherCharacters: data.otherCharacterIDs.map(CharacterLogic.getCharacter)
		});

		const names = data.playerNames;
		return names
			? { ...game, players: game.players.map((player, index) => ({ ...player, name: names[ index ] ?? player.name })) }
			: game;
	};

	// What carries over when a game is re-racked: the players, the script, and the Fabled and Loric
	static getReRackInfo = (game: Game) => {
		return {
			playerNames: game.players.map(p => p.name),
			scriptID: game.script.id,
			otherCharacterIDs: game.otherCharacters.map(c => c.id)
		};
	};

	// Player modifiers that are (or may be) placed during setup
	static getSetupModifiers = (game: Game) => {
		return GameLogic.getPlayerModifiers(game).filter(m => m.modifier.data.setup !== 'no');
	};

	static findSetupModifier = (game: Game, selection: SetupSelection | null) => {
		if (selection?.type !== 'modifier') {
			return null;
		}
		return SetupLogic.getSetupModifiers(game).find(m => (m.player.id === selection.playerID) && (m.modifier.id === selection.modifierID)) ?? null;
	};

	// Required setup modifiers that aren't yet on enough players, or still need a character picked
	static getUnplacedModifiers = (game: Game) => {
		return SetupLogic.getSetupModifiers(game)
			.filter(m => m.modifier.data.setup === 'yes')
			.filter(m =>
				(m.modifier.data.playerIDs.length < (m.modifier.data.max ?? 1))
				|| GameLogic.getCharacterEffects(m.modifier).some(e => e.data.characterID === ''));
	};

	// Every required setup modifier is on enough players, with any character it needs picked
	static isSetupComplete = (game: Game) => {
		return SetupLogic.getUnplacedModifiers(game).length === 0;
	};

	static beginGame = (game: Game): Game => {
		// Remember how the grimoire stood at the end of setup, for looking back
		const recorded = HistoryLogic.recordSnapshot(game);
		return PhaseLogic.addLog({
			...recorded,
			phase: { type: PhaseType.Night, number: 1 },
			history: {
				...recorded.history,
				nights: recorded.history.nights.length > 0 ? recorded.history.nights : [ Factory.createNight({ number: 1 }) ]
			}
		}, 'Night 1 begins');
	};

	// Puts a bag character in a seat; whoever was there goes back into the bag
	static assignCharacter = (game: Game, playerID: string, characterID: string): Game => {
		const character = game.bag.find(c => c.id === characterID);
		const player = game.players.find(p => p.id === playerID);
		if (!character || !player) {
			return game;
		}

		const bag = game.bag.filter(c => c.id !== characterID);
		if (player.character) {
			bag.push(player.character);
		}

		return {
			...game,
			bag: bag,
			players: game.players.map(p =>
				p.id === playerID
					? { ...p, character: character, alignment: CharacterLogic.getAlignment(character.role) ?? p.alignment }
					: p)
		};
	};

	// Whether a modifier can go on this player; misregistering players (eg the Spy or Recluse) count as what they might register as
	static isModifierEligible = (game: Game, owner: Player, modifier: PlayerModifier, player: Player) => {
		if (modifier.data.type === 'self') {
			return player.id === owner.id;
		}

		return modifier.data.restrictions.every(restriction => {
			switch (restriction) {
				case 'not_self':
					return player.id !== owner.id;
				case AlignmentType.Good:
				case AlignmentType.Evil:
					return (player.alignment === restriction) || GameLogic.canRegisterAs(game, player, restriction);
				default:
					return (player.character?.role === restriction) || GameLogic.canRegisterAs(game, player, restriction);
			}
		});
	};

	// A seat already holding the modifier can be clicked to take it off; otherwise it must be eligible, with room for another
	static canToggleModifier = (game: Game, owner: Player, modifier: PlayerModifier, player: Player) => {
		if (!SetupLogic.isModifierEligible(game, owner, modifier, player)) {
			return false;
		}
		const data = modifier.data;
		return data.playerIDs.includes(player.id) || (data.max === null) || (data.playerIDs.length < data.max);
	};

	static toggleModifier = (game: Game, owner: Player, modifier: PlayerModifier, player: Player): Game => {
		if (!SetupLogic.canToggleModifier(game, owner, modifier, player)) {
			return game;
		}
		return modifier.data.playerIDs.includes(player.id)
			? GameLogic.removeModifier(game, owner.id, modifier.id, player.id)
			: GameLogic.setModifierPlayerIDs(game, owner.id, modifier.id, [ ...modifier.data.playerIDs, player.id ]);
	};

	// The seats where clicking would do something with the current selection
	// While placing a character, only the seats that keep seating modifiers achievable are included, though any seat can be clicked
	static getTargetPlayerIDs = (game: Game, selection: SetupSelection | null): string[] => {
		if ((game.bag.length > 0) && (selection?.type === 'character')) {
			return SeatingLogic.getSuggestedPlayerIDs(game, selection.characterID) ?? game.players.map(p => p.id);
		}

		const selected = game.bag.length === 0 ? SetupLogic.findSetupModifier(game, selection) : null;
		if (selected) {
			return game.players.filter(p => SetupLogic.canToggleModifier(game, selected.player, selected.modifier, p)).map(p => p.id);
		}

		return [];
	};

	// What clicking a seat does with the current selection: the updated game, and whether the selection is used up
	// Returns null when the click isn't a setup action, so it selects the player instead
	static selectSeat = (game: Game, selection: SetupSelection | null, player: Player): { game: Game, clearSelection: boolean } | null => {
		if ((game.bag.length > 0) && (selection?.type === 'character')) {
			return { game: SetupLogic.assignCharacter(game, player.id, selection.characterID), clearSelection: true };
		}

		const selected = game.bag.length === 0 ? SetupLogic.findSetupModifier(game, selection) : null;
		if (selected) {
			return { game: SetupLogic.toggleModifier(game, selected.player, selected.modifier, player), clearSelection: false };
		}

		return null;
	};
}
