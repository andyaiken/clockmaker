import type { AlignmentType } from '../enums/alignment-type';
import type { Character } from '../models/character';
import { CharacterLogic } from './character-logic';
import { Factory } from './factory';
import type { Game } from '../models/game';
import { GameLogic } from './game-logic';
import { HistoryLogic } from './history-logic';
import type { LogEntry } from '../models/log-entry';
import { ModifierType } from '../enums/modifier-type';
import type { Phase } from '../models/phase';
import { PhaseType } from '../enums/phase-type';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';
import { ScriptLogic } from './script-logic';
import { Utility } from '../utils/utility';

export class PhaseLogic {
	static getLabel = (phase: Phase) => {
		switch (phase.type) {
			case PhaseType.Night:
			case PhaseType.Day:
				return `${phase.type} ${phase.number}`;
			default:
				return phase.type;
		}
	};

	static addLog = (game: Game, text: string): Game => {
		return {
			...game,
			history: {
				...game.history,
				log: [ ...game.history.log, Factory.createLogEntry({ phase: game.phase, text: text }) ]
			}
		};
	};

	// Takes reminders that last only until dawn or dusk off everyone
	static clearExpired = (game: Game, expires: 'dawn' | 'dusk'): Game => {
		let updated = game;
		GameLogic.getPlayerModifiers(game)
			.filter(pm => (pm.modifier.data.expires === expires) && (pm.modifier.data.playerIDs.length > 0))
			.forEach(pm => updated = GameLogic.setModifierPlayerIDs(updated, pm.player.id, pm.modifier.id, []));
		return updated;
	};

	// Night N is followed by Day N
	static endNight = (game: Game): Game => {
		// Remember how the grimoire stood as the phase ended, for looking back
		game = HistoryLogic.recordSnapshot(game);
		const number = game.phase.number;
		const cleared = PhaseLogic.clearExpired(game, 'dawn');
		const updated: Game = {
			...cleared,
			phase: Factory.createPhase({ type: PhaseType.Day, number: number }),
			history: {
				...cleared.history,
				days: cleared.history.days.some(d => d.number === number)
					? cleared.history.days
					: [ ...cleared.history.days, Factory.createDay({ number: number }) ]
			}
		};

		return PhaseLogic.addLog(updated, `Day ${number} begins`);
	};

	// Day N is followed by Night N + 1
	static endDay = (game: Game): Game => {
		// Remember how the grimoire stood as the phase ended, for looking back
		game = HistoryLogic.recordSnapshot(game);
		const number = game.phase.number + 1;
		const cleared = PhaseLogic.clearExpired(game, 'dusk');
		const updated: Game = {
			...cleared,
			phase: Factory.createPhase({ type: PhaseType.Night, number: number }),
			history: {
				...cleared.history,
				nights: cleared.history.nights.some(n => n.number === number)
					? cleared.history.nights
					: [ ...cleared.history.nights, Factory.createNight({ number: number }) ]
			}
		};

		return PhaseLogic.addLog(updated, `Night ${number} begins`);
	};

	static getDefaultCauseOfDeath = (game: Game) => {
		return game.phase.type === PhaseType.Day ? 'Executed' : 'Killed at night';
	};

	// Swaps a player with their neighbour; seats run clockwise in array order, so the last seat neighbours the first
	static movePlayer = (game: Game, playerID: string, direction: 'clockwise' | 'anticlockwise'): Game => {
		const count = game.players.length;
		const index = game.players.findIndex(p => p.id === playerID);
		if ((index === -1) || (count < 2)) {
			return game;
		}

		const target = (index + (direction === 'clockwise' ? 1 : -1) + count) % count;
		const players = [ ...game.players ];
		[ players[ index ], players[ target ] ] = [ players[ target ], players[ index ] ];

		return PhaseLogic.addLog({ ...game, players: players }, `${game.players[ index ].name} swaps seats with ${game.players[ target ].name}`);
	};

	static setPlayerState = (game: Game, playerID: string, state: PlayerState): Game => {
		const player = game.players.find(p => p.id === playerID);
		if (!player || (player.state === state)) {
			return game;
		}

		const wasAlive = player.state === PlayerState.Alive;
		const isAlive = state === PlayerState.Alive;

		const updated: Game = {
			...game,
			players: game.players.map(p => {
				if (p.id !== playerID) {
					return p;
				}

				return {
					...p,
					state: state,
					death: isAlive
						? null
						: (p.death ?? { phase: game.phase, cause: PhaseLogic.getDefaultCauseOfDeath(game) })
				};
			})
		};

		if (wasAlive && !isAlive) {
			return PhaseLogic.addLog(updated, `${player.name} died`);
		}
		if (!wasAlive && isAlive) {
			return PhaseLogic.addLog(updated, `${player.name} is alive again`);
		}
		return updated;
	};

	// Gives a player a fresh copy of a character; the old character's reminders go with it
	// Alignment is left as it is: the Storyteller changes it separately when the rules say so
	static changeCharacter = (game: Game, playerID: string, characterID: string): Game => {
		const player = game.players.find(p => p.id === playerID);
		const source = [ ...ScriptLogic.getCharacters(game.script), ...game.otherCharacters ].find(c => c.id === characterID)
			?? CharacterLogic.getCharacters().find(c => c.id === characterID);
		if (!player || !source || (player.character?.id === characterID)) {
			return game;
		}

		const updated: Game = {
			...game,
			players: game.players.map(p => p.id === playerID ? { ...p, character: Utility.copy(source) } : p)
		};
		return PhaseLogic.addLog(updated, `${player.name} becomes the ${source.name}`);
	};

	// The log, split into runs of entries from the same phase; phases and entries are in the order they happened
	static getLogGroups = (game: Game) => {
		const groups: { label: string, entries: LogEntry[] }[] = [];
		game.history.log.forEach(entry => {
			const label = PhaseLogic.getLabel(entry.phase);
			const last = groups[ groups.length - 1 ];
			if (last && (last.label === label)) {
				last.entries.push(entry);
			} else {
				groups.push({ label: label, entries: [ entry ] });
			}
		});
		return groups;
	};

	static setPlayerName = (game: Game, playerID: string, name: string): Game => {
		return { ...game, players: game.players.map(p => p.id === playerID ? { ...p, name: name } : p) };
	};

	static setAlignment = (game: Game, playerID: string, alignment: AlignmentType): Game => {
		return { ...game, players: game.players.map(p => p.id === playerID ? { ...p, alignment: alignment } : p) };
	};

	// Adds a Fabled or Loric, or takes it away if it's already in the game
	static toggleOtherCharacter = (game: Game, characterID: string): Game => {
		const existing = game.otherCharacters.find(c => c.id === characterID);
		if (existing) {
			return PhaseLogic.addLog({ ...game, otherCharacters: game.otherCharacters.filter(c => c.id !== characterID) }, `${existing.name} removed`);
		}

		const character = CharacterLogic.getCharacter(characterID);
		return PhaseLogic.addLog({ ...game, otherCharacters: [ ...game.otherCharacters, Utility.copy(character) ] }, `${character.name} added`);
	};

	// Travellers not already in play: those on the script, then the rest
	static getAvailableTravellers = (game: Game) => {
		const inPlay = game.players.map(p => p.character?.id);
		const onScript = ScriptLogic.getCharacters(game.script).filter(c => (c.role === RoleType.Traveller) && !inPlay.includes(c.id));
		const others = CharacterLogic.getCharacters().filter(c => (c.role === RoleType.Traveller) && !inPlay.includes(c.id) && !onScript.some(s => s.id === c.id));
		return { onScript: onScript, others: others };
	};

	// Where a new Traveller sits: after the chosen player, or after the last seat if nobody has been chosen
	static getTravellerSeat = (game: Game, afterPlayerID: string | null) => {
		return game.players.find(p => p.id === afterPlayerID) ?? game.players[ game.players.length - 1 ] ?? null;
	};

	// Adds a seat for a Traveller who joins partway through; they sit clockwise after the given player (or last, if none is given)
	static addTraveller = (game: Game, data: { name: string, characterID: string, alignment: AlignmentType, afterPlayerID: string | null }): Game => {
		const source = [ ...ScriptLogic.getCharacters(game.script), ...CharacterLogic.getCharacters() ].find(c => c.id === data.characterID);
		if (!source) {
			return game;
		}

		const player = { ...Factory.createPlayer({ name: data.name, alignment: data.alignment }), character: Utility.copy(source) };
		const after = game.players.findIndex(p => p.id === data.afterPlayerID);
		const index = after === -1 ? game.players.length : after + 1;
		const players = [ ...game.players.slice(0, index), player, ...game.players.slice(index) ];

		const neighbours = players.length > 2
			? ` between ${players[ (index - 1 + players.length) % players.length ].name} and ${players[ (index + 1) % players.length ].name}`
			: '';
		return PhaseLogic.addLog({ ...game, players: players }, `${player.name} joins as the ${source.name} (${data.alignment})${neighbours}`);
	};

	// Takes a player's seat out of the circle, eg a Traveller who leaves; their reminders go with them, and any placed on them are taken off
	// Past nights and days keep their records, which show the player as unknown
	static removePlayer = (game: Game, playerID: string): Game => {
		const player = game.players.find(p => p.id === playerID);
		if (!player) {
			return game;
		}

		const clear = (character: Character): Character => ({
			...character,
			modifiers: character.modifiers.map(m =>
				(m.type === ModifierType.PlayerModifier) && m.data.playerIDs.includes(playerID)
					? { ...m, data: { ...m.data, playerIDs: m.data.playerIDs.filter(id => id !== playerID) } }
					: m)
		});

		const updated: Game = {
			...game,
			players: game.players.filter(p => p.id !== playerID).map(p => p.character ? { ...p, character: clear(p.character) } : p),
			otherCharacters: game.otherCharacters.map(clear),
			modifiers: game.modifiers.map(m => ({ ...m, data: { ...m.data, playerIDs: m.data.playerIDs.filter(id => id !== playerID) } }))
		};
		return PhaseLogic.addLog(updated, `${player.name}${player.character ? ` (${player.character.name})` : ''} leaves the game`);
	};

	static setCauseOfDeath = (game: Game, playerID: string, cause: string): Game => {
		return {
			...game,
			players: game.players.map(p => (p.id === playerID) && p.death ? { ...p, death: { ...p.death, cause: cause } } : p)
		};
	};
}
