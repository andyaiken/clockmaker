import { AlignmentType } from '../enums/alignment-type';
import { CharacterLogic } from './character-logic';
import type { Effect } from '../models/effect';
import { EffectType } from '../enums/effect-type';
import type { Game } from '../models/game';
import { GameLogic } from './game-logic';
import { ModifierType } from '../enums/modifier-type';
import { NightLogic } from './night-logic';
import type { Player } from '../models/player';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';
import { ScriptLogic } from './script-logic';

// What the player seats show: their characters and reminders, or what's unusual about each player.
// Lenses show exceptions: a seat with nothing unusual to say gets no badge.
export type GrimoireView = 'characters' | 'alignment' | 'role' | 'drunk' | 'alive' | 'votes';

export type BadgeTone = 'good' | 'evil' | RoleType | 'warning' | 'ok' | 'dim';

export interface SeatBadge {
	label: string;
	// A second line, eg what a Drunk believes they are
	detail: string | null;
	tone: BadgeTone;
}

export class GrimoireViewLogic {
	static views: { id: GrimoireView, label: string }[] = [
		{ id: 'characters', label: 'Info' },
		{ id: 'alignment', label: 'Team' },
		{ id: 'role', label: 'Type' },
		{ id: 'drunk', label: 'Health' },
		{ id: 'alive', label: 'Alive' },
		{ id: 'votes', label: 'Votes' }
	];

	static getBadge = (game: Game, player: Player, view: GrimoireView): SeatBadge | null => {
		switch (view) {
			case 'characters':
				return null;
			case 'alignment':
				return GrimoireViewLogic.getAlignmentBadge(game, player);
			case 'role':
				return GrimoireViewLogic.getRoleBadge(game, player);
			case 'drunk':
				return GrimoireViewLogic.getDrunkBadge(game, player);
			case 'alive':
				return player.state === PlayerState.Alive
					? null
					: { label: 'Dead', detail: null, tone: 'dim' };
			case 'votes':
				return GrimoireViewLogic.getVotesBadge(game, player);
		}
	};

	// A monogram for every character the game might show: the script's first, in script order, then any others
	static getMonograms = (game: Game) => {
		return CharacterLogic.getMonograms([
			...ScriptLogic.getCharacters(game.script),
			...game.players.flatMap(p => p.character ? [ p.character ] : []),
			...game.otherCharacters,
			...CharacterLogic.getCharacters()
		]);
	};

	// The character a player thinks they are, if it isn't their own (the Drunk, Marionette, Lunatic)
	static getBelieved = (game: Game, player: Player) => {
		const id = NightLogic.getBelievedCharacterID(game, player);
		return id ? (CharacterLogic.getCharacters().find(c => c.id === id) ?? null) : null;
	};

	// What else a player might register as, from their own character or a reminder placed on them
	static getRegistersAs = (game: Game, player: Player) => {
		const own: Effect[] = (player.character?.modifiers ?? [])
			.filter(m => (m.type === ModifierType.PlayerModifier) && (m.data.type === 'self'))
			.flatMap(m => m.type === ModifierType.PlayerModifier ? m.data.effects : []);
		const types = [ ...own, ...GameLogic.getEffectsOnPlayer(game, player) ]
			.flatMap(e => ((e.type === EffectType.CanRegisterAs) && !e.data.onlyToOwner) ? e.data.registerAs : []);
		return types.filter((t, n) => types.indexOf(t) === n);
	};

	// Good players with nothing unusual about them get no badge
	static getAlignmentBadge = (game: Game, player: Player): SeatBadge | null => {
		const notes: string[] = [];

		const believed = GrimoireViewLogic.getBelieved(game, player);
		const believedAlignment = believed ? CharacterLogic.getAlignment(believed.role) : null;
		if (believedAlignment && (believedAlignment !== player.alignment)) {
			notes.push(`thinks ${believedAlignment.toLowerCase()}`);
		}

		const registers = GrimoireViewLogic.getRegistersAs(game, player)
			.filter(t => ((t === AlignmentType.Good) || (t === AlignmentType.Evil)) && (t !== player.alignment));
		if (registers.length > 0) {
			notes.push(`may register ${registers.map(t => t.toLowerCase()).join(' / ')}`);
		}

		if ((player.alignment === AlignmentType.Good) && (notes.length === 0)) {
			return null;
		}

		return {
			label: player.alignment,
			detail: notes.length > 0 ? notes.join('; ') : null,
			tone: player.alignment === AlignmentType.Good ? 'good' : 'evil'
		};
	};

	static getRoleBadge = (game: Game, player: Player): SeatBadge | null => {
		if (!player.character) {
			return null;
		}

		const notes: string[] = [];
		const believed = GrimoireViewLogic.getBelieved(game, player);
		if (believed && (believed.role !== player.character.role)) {
			notes.push(`thinks ${believed.role}`);
		}

		const registers = GrimoireViewLogic.getRegistersAs(game, player)
			.filter(t => Object.values(RoleType).includes(t as RoleType) && (t !== player.character?.role));
		if (registers.length > 0) {
			notes.push(`may register ${registers.join(' / ')}`);
		}

		return {
			label: player.character.role,
			detail: notes.length > 0 ? notes.join('; ') : null,
			tone: player.character.role
		};
	};

	static getDrunkBadge = (game: Game, player: Player): SeatBadge | null => {
		const effects = GameLogic.getEffectsOnPlayer(game, player);
		const drunk = effects.some(e => e.type === EffectType.IsDrunk);
		const poisoned = effects.some(e => e.type === EffectType.IsPoisoned);
		const believed = GrimoireViewLogic.getBelieved(game, player);

		// The Marionette and Lunatic aren't drunk, but they don't have the ability they think they have
		const detail = believed ? `thinks they're the ${believed.name}` : null;

		if (drunk && poisoned) {
			return { label: 'Drunk & poisoned', detail: detail, tone: 'warning' };
		}
		if (drunk) {
			return { label: 'Drunk', detail: detail, tone: 'warning' };
		}
		if (poisoned) {
			return { label: 'Poisoned', detail: detail, tone: 'warning' };
		}
		if (believed) {
			return { label: 'No ability', detail: detail, tone: 'warning' };
		}
		return null;
	};

	static getVotesBadge = (game: Game, player: Player): SeatBadge | null => {
		// Vote rules from reminders on the player (eg the Bureaucrat's or Thief's), shown as a reminder to the Storyteller
		const modified = GameLogic.getEffectsOnPlayer(game, player).some(e => e.type === EffectType.HasVoteModified);
		const detail = modified ? 'vote modified' : null;

		switch (player.state) {
			case PlayerState.Alive:
				return modified ? { label: 'Vote modified', detail: null, tone: 'warning' } : null;
			case PlayerState.DeadWithGhostVote:
				return { label: 'Ghost vote', detail: detail, tone: 'warning' };
			case PlayerState.DeadWithoutGhostVote:
				return { label: 'No vote', detail: detail, tone: 'dim' };
		}
	};
}
