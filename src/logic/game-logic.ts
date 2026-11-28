import type { BagModifier, PlayerModifier } from '../models/modifier';
import { AlignmentType } from '../enums/alignment-type';
import { BagAdjustmentType } from '../enums/bag-adjustment-type';
import type { Character } from '../models/character';
import { CharacterLogic } from './character-logic';
import { EffectType } from '../enums/effect-type';
import type { Game } from '../models/game';
import { ModifierType } from '../enums/modifier-type';
import type { Player } from '../models/player';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';
import { ScriptLogic } from './script-logic';

export class GameLogic {
	static getRoleCounts = (players: number, characters: Character[]) => {
		const counts = GameLogic.getBaseRoleCounts(players);

		const modifiers: { characterID: string, modifier: BagModifier }[] = [];

		characters.forEach(c => {
			c.modifiers
				.filter(m => m.type === ModifierType.BagModifier)
				.forEach(m => {
					m.data.adjustments.forEach(adjustment => {
						switch (adjustment.type) {
							case BagAdjustmentType.ChangeRoleCount:
								if (adjustment.data.options?.length === 1) {
									counts[ adjustment.data.role ] += adjustment.data.options[ 0 ];
								}
								break;
							case BagAdjustmentType.SetRoleCount:
								if (adjustment.data.count !== null) {
									counts[ adjustment.data.role ] = adjustment.data.count;
								}
								break;
							case BagAdjustmentType.AddCharacter: {
								const copies = adjustment.data.copies === 'majority'
									? Math.floor(players / 2) + 1
									: adjustment.data.copies.length === 1
										? adjustment.data.copies[ 0 ]
										: null;

								if (copies !== null) {
									const alreadyInBag = characters.filter(bagCharacter => bagCharacter.id === adjustment.data.characterID).length;
									const additionalCopies = Math.max(0, copies - alreadyInBag);
									const role = CharacterLogic.getCharacter(adjustment.data.characterID).role;
									counts[ role ] += additionalCopies;
								}
								break;
							}
							case BagAdjustmentType.ReplaceRole: {
								const replacementRole = CharacterLogic.getCharacter(adjustment.data.characterID).role;
								const replacedCount = counts[ adjustment.data.role ];
								counts[ adjustment.data.role ] = 0;
								counts[ replacementRole ] += replacedCount;
								break;
							}
							case BagAdjustmentType.AllowDuplicates:
								break;
						}
					});
					modifiers.push({ characterID: c.id, modifier: m });
				});
		});

		counts[ RoleType.Townsfolk ] = players - counts[ RoleType.Outsider ] - counts[ RoleType.Minion ] - counts[ RoleType.Demon ];

		return {
			counts: counts,
			modifiers: modifiers
		};
	};

	static getBaseRoleCounts = (players: number) => {
		const counts: Record<RoleType, number> = {
			[ RoleType.Townsfolk ]: 0,
			[ RoleType.Outsider ]: 0,
			[ RoleType.Minion ]: 0,
			[ RoleType.Demon ]: 0,
			[ RoleType.Traveller ]: 0,
			[ RoleType.Fabled ]: 0,
			[ RoleType.Loric ]: 0
		};

		switch (players) {
			case 5:
				counts.Townsfolk = 3;
				counts.Outsider = 0;
				counts.Minion = 1;
				counts.Demon = 1;
				break;
			case 6:
				counts.Townsfolk = 3;
				counts.Outsider = 1;
				counts.Minion = 1;
				counts.Demon = 1;
				break;
			case 7:
				counts.Townsfolk = 5;
				counts.Outsider = 0;
				counts.Minion = 1;
				counts.Demon = 1;
				break;
			case 8:
				counts.Townsfolk = 5;
				counts.Outsider = 1;
				counts.Minion = 1;
				counts.Demon = 1;
				break;
			case 9:
				counts.Townsfolk = 5;
				counts.Outsider = 2;
				counts.Minion = 1;
				counts.Demon = 1;
				break;
			case 10:
				counts.Townsfolk = 7;
				counts.Outsider = 0;
				counts.Minion = 2;
				counts.Demon = 1;
				break;
			case 11:
				counts.Townsfolk = 7;
				counts.Outsider = 1;
				counts.Minion = 2;
				counts.Demon = 1;
				break;
			case 12:
				counts.Townsfolk = 7;
				counts.Outsider = 2;
				counts.Minion = 2;
				counts.Demon = 1;
				break;
			case 13:
				counts.Townsfolk = 9;
				counts.Outsider = 0;
				counts.Minion = 3;
				counts.Demon = 1;
				break;
			case 14:
				counts.Townsfolk = 9;
				counts.Outsider = 1;
				counts.Minion = 3;
				counts.Demon = 1;
				break;
			case 15:
				counts.Townsfolk = 9;
				counts.Outsider = 2;
				counts.Minion = 3;
				counts.Demon = 1;
				break;
		}

		return counts;
	};

	// Every character's player modifiers, including those of dead players, so their reminders stay visible
	static getPlayerModifiers = (game: Game) => {
		const modifiers: { player: Player, modifier: PlayerModifier }[] = [];

		game.players.forEach(p => {
			if (p.character) {
				p.character.modifiers
					.filter(m => m.type === ModifierType.PlayerModifier)
					.forEach(m => modifiers.push({ player: p, modifier: m }));
			}
		});

		game.otherCharacters.forEach(c => {
			const owner = GameLogic.getOtherCharacterOwner(c);
			c.modifiers
				.filter(m => m.type === ModifierType.PlayerModifier)
				.forEach(m => modifiers.push({ player: owner, modifier: m }));
		});

		return modifiers;
	};

	// Fabled and Loric don't sit in a seat, so they own their modifiers through a stand-in player that is always alive
	// The stand-in's ID is the character's ID, which can't clash with a player's
	private static getOtherCharacterOwner = (character: Character): Player => {
		return {
			id: character.id,
			name: character.name,
			character: character,
			alignment: AlignmentType.Good,
			state: PlayerState.Alive,
			death: null
		};
	};

	// One of a modifier owner's player modifiers
	static findPlayerModifier = (game: Game, ownerID: string, modifierID: string) => {
		return GameLogic.getPlayerModifiers(game).find(pm => (pm.player.id === ownerID) && (pm.modifier.id === modifierID))?.modifier ?? null;
	};

	static getAlivePlayers = (game: Game) => {
		return game.players.filter(p => p.state === PlayerState.Alive);
	};

	// Changes one of a modifier owner's player modifiers, whether the owner is a player or a Fabled / Loric
	private static updatePlayerModifier = (game: Game, ownerID: string, modifierID: string, update: (modifier: PlayerModifier) => PlayerModifier): Game => {
		const updateCharacter = (character: Character): Character => ({
			...character,
			modifiers: character.modifiers.map(m =>
				(m.type === ModifierType.PlayerModifier) && (m.id === modifierID) ? update(m) : m)
		});

		return {
			...game,
			players: game.players.map(p =>
				(p.id === ownerID) && p.character ? { ...p, character: updateCharacter(p.character) } : p),
			otherCharacters: game.otherCharacters.map(c => c.id === ownerID ? updateCharacter(c) : c)
		};
	};

	// Sets which players a character's modifier is placed on
	static setModifierPlayerIDs = (game: Game, ownerID: string, modifierID: string, playerIDs: string[]): Game => {
		return GameLogic.updatePlayerModifier(game, ownerID, modifierID, m => ({ ...m, data: { ...m.data, playerIDs: playerIDs } }));
	};

	// Places a modifier on a player; if the modifier is already on as many players as it allows, it moves from the earliest one
	static placeModifier = (game: Game, ownerID: string, modifierID: string, playerID: string): Game => {
		const modifier = GameLogic.findPlayerModifier(game, ownerID, modifierID);
		if (!modifier || modifier.data.playerIDs.includes(playerID)) {
			return game;
		}

		let playerIDs = [ ...modifier.data.playerIDs, playerID ];
		if ((modifier.data.max !== null) && (playerIDs.length > modifier.data.max)) {
			playerIDs = playerIDs.slice(playerIDs.length - modifier.data.max);
		}

		return GameLogic.setModifierPlayerIDs(game, ownerID, modifierID, playerIDs);
	};

	static removeModifier = (game: Game, ownerID: string, modifierID: string, playerID: string): Game => {
		const modifier = GameLogic.findPlayerModifier(game, ownerID, modifierID);
		if (!modifier) {
			return game;
		}

		return GameLogic.setModifierPlayerIDs(game, ownerID, modifierID, modifier.data.playerIDs.filter(id => id !== playerID));
	};

	// Characters the Storyteller can give a player: the script's, and any Fabled or Loric in the game
	static getAvailableCharacters = (game: Game) => {
		return [ ...ScriptLogic.getCharacters(game.script), ...game.otherCharacters ];
	};

	// The characters in the game right now: the players', and any Fabled or Loric
	static getCharactersInPlay = (game: Game) => {
		return [ ...game.players.map(p => p.character).filter(c => c !== null), ...game.otherCharacters ];
	};

	// A character the game knows about, preferring its own copies (which carry this game's reminders)
	static findCharacter = (game: Game, id: string): Character | null => {
		return [ ...ScriptLogic.getCharacters(game.script), ...game.bluffs, ...game.otherCharacters ].find(c => c.id === id)
			?? CharacterLogic.getCharacters().find(c => c.id === id)
			?? null;
	};

	static findPlayer = (game: Game, playerID: string | null) => {
		return game.players.find(p => p.id === playerID) ?? null;
	};

	// The players with these IDs, in seat order
	static getPlayers = (game: Game, playerIDs: string[]) => {
		return game.players.filter(p => playerIDs.includes(p.id));
	};

	// The players a modifier is placed on, in seat order
	static getPlacedPlayers = (game: Game, modifier: PlayerModifier) => {
		return GameLogic.getPlayers(game, modifier.data.playerIDs);
	};

	// Modifiers that aren't on this player yet, which the Storyteller could add
	static getAvailableModifiers = (game: Game, player: Player) => {
		return GameLogic.getPlayerModifiers(game).filter(pm => !pm.modifier.data.playerIDs.includes(player.id));
	};

	// The states a player is in because of modifiers on them, eg 'Drunk'
	static getStateLabels = (game: Game, player: Player) => {
		const effects = GameLogic.getEffectsOnPlayer(game, player);
		const states: { type: EffectType, label: string }[] = [
			{ type: EffectType.IsDrunk, label: 'Drunk' },
			{ type: EffectType.IsPoisoned, label: 'Poisoned' },
			{ type: EffectType.IsProtected, label: 'Protected' }
		];
		return states.filter(s => effects.some(e => e.type === s.type)).map(s => s.label);
	};

	// The modifiers placed on this player, and the player whose character owns each one
	static getModifiersOnPlayer = (game: Game, player: Player) => {
		return GameLogic.getPlayerModifiers(game).filter(pm => pm.modifier.data.playerIDs.includes(player.id));
	};

	// Effects where the Storyteller picks a character (eg the Drunk's believed Townsfolk); returns those on a modifier
	static getCharacterEffects = (modifier: PlayerModifier) => {
		return modifier.data.effects.filter(e => (e.type === EffectType.BelievesTheyAre) || (e.type === EffectType.HasTheAbilityOf));
	};

	// The script characters that satisfy a character effect's restrictions
	static getCharacterEffectOptions = (game: Game, restrictions: { types: (AlignmentType | RoleType)[], inPlay: boolean | null }) => {
		return GameLogic.filterCharacters(game, ScriptLogic.getCharacters(game.script), restrictions);
	};

	// The characters of these roles or alignments (any, if none are given), and in play or not (either, if null)
	static filterCharacters = (game: Game, characters: Character[], restrictions: { types: (AlignmentType | RoleType)[], inPlay: boolean | null }) => {
		const inPlayIDs = game.players.map(p => p.character?.id);
		return characters
			.filter(c => (restrictions.types.length === 0) || restrictions.types.some(t => (t === c.role) || (t === CharacterLogic.getAlignment(c.role))))
			.filter(c => (restrictions.inPlay === null) || (restrictions.inPlay === inPlayIDs.includes(c.id)));
	};

	static setEffectCharacter = (game: Game, ownerID: string, modifierID: string, effectID: string, characterID: string): Game => {
		return GameLogic.updatePlayerModifier(game, ownerID, modifierID, m => ({
			...m,
			data: {
				...m.data,
				effects: m.data.effects.map(e =>
					(e.id === effectID) && ((e.type === EffectType.BelievesTheyAre) || (e.type === EffectType.HasTheAbilityOf))
						? { ...e, data: { ...e.data, characterID: characterID } }
						: e)
			}
		}));
	};

	// The effects of every modifier that has been placed on this player, whoever owns it
	// Whether a player might register as this alignment or role to everyone: from their own character (eg the Spy or Recluse)
	// or from a modifier placed on them (eg the Lycanthrope's Faux Paw); effects that only fool their owner are left out
	static canRegisterAs = (game: Game, player: Player, type: AlignmentType | RoleType) => {
		const own = (player.character?.modifiers ?? [])
			.filter(m => (m.type === ModifierType.PlayerModifier) && (m.data.type === 'self'))
			.flatMap(m => m.type === ModifierType.PlayerModifier ? m.data.effects : []);

		return [ ...own, ...GameLogic.getEffectsOnPlayer(game, player) ]
			.some(e => (e.type === EffectType.CanRegisterAs) && !e.data.onlyToOwner && e.data.registerAs.includes(type));
	};

	// A dead player's ability stops working, so effects from their modifiers are left out
	static getEffectsOnPlayer = (game: Game, player: Player) => {
		return [
			...GameLogic.getPlayerModifiers(game).filter(pm => pm.player.state === PlayerState.Alive).map(pm => pm.modifier),
			...game.modifiers
		]
			.filter(m => m.data.playerIDs.includes(player.id))
			.flatMap(m => m.data.effects);
	};
}
