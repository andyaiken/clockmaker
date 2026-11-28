import { AlignmentType } from '../enums/alignment-type';
import { CharacterLogic } from './character-logic';
import type { Effect } from '../models/effect';
import { EffectType } from '../enums/effect-type';
import type { Game } from '../models/game';
import { GameLogic } from './game-logic';
import { ModifierType } from '../enums/modifier-type';
import type { Player } from '../models/player';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';

export class WarningLogic {
	// Things the Storyteller should know before showing this player anything: drunk, poisoned, not who they think they are
	static getWarnings = (game: Game, player: Player): string[] => {
		const warnings: string[] = [];

		GameLogic.getModifiersOnPlayer(game, player)
			// A dead character's ability has stopped working
			.filter(pm => pm.player.state === PlayerState.Alive)
			.forEach(({ player: owner, modifier }) => {
				const effects = modifier.data.effects;
				const believes = effects.find(e => e.type === EffectType.BelievesTheyAre);
				const describe = (state: string) => {
					const source = owner.id === player.id ? '' : ` by the ${owner.character?.name ?? '?'} (${owner.name})`;
					// The reminder's label only adds something when it isn't just the state (eg the Innkeeper's "Drunk")
					const label = modifier.label.toLowerCase() === state.toLowerCase() ? '' : ` (${modifier.label})`;
					return `${state}${source}${label}: their ability doesn't work. You may give false information.`;
				};

				if (believes && (believes.type === EffectType.BelievesTheyAre)) {
					warnings.push(WarningLogic.getBelievesWarning(owner.character?.id ?? '', owner.character?.name ?? '?', believes.data.characterID));
					return;
				}

				if (effects.some(e => e.type === EffectType.IsDrunk)) {
					warnings.push(describe('Drunk'));
				}
				if (effects.some(e => e.type === EffectType.IsPoisoned)) {
					warnings.push(describe('Poisoned'));
				}
			});

		// The Vortox makes every Townsfolk's information false
		const thinksTownsfolk = (player.character?.role === RoleType.Townsfolk) || WarningLogic.believesRole(game, player, RoleType.Townsfolk);
		const vortox = game.players.find(p => (p.state === PlayerState.Alive) && (p.character?.id === 'vortox'));
		if (thinksTownsfolk && vortox) {
			warnings.push(`The Vortox (${vortox.name}) is in play: Townsfolk information must be false.`);
		}

		return warnings;
	};

	// Registration notes for each of these players who might register as something else
	static getRegistrationNotes = (game: Game, playerIDs: string[]) => {
		return GameLogic.getPlayers(game, playerIDs)
			.map(p => WarningLogic.getRegistrationNote(game, p))
			.filter(n => n !== null);
	};

	// For players being shown or chosen: notes that they might register as something else (eg the Spy or Recluse)
	static getRegistrationNote = (game: Game, player: Player): string | null => {
		const own: Effect[] = (player.character?.modifiers ?? [])
			.filter(m => (m.type === ModifierType.PlayerModifier) && (m.data.type === 'self'))
			.flatMap(m => m.type === ModifierType.PlayerModifier ? m.data.effects : []);

		const types = [ ...own, ...GameLogic.getEffectsOnPlayer(game, player) ]
			.flatMap(e => ((e.type === EffectType.CanRegisterAs) && !e.data.onlyToOwner) ? e.data.registerAs : []);
		if (types.length === 0) {
			return null;
		}

		const unique = types.filter((t, n) => types.indexOf(t) === n);
		const describe = (t: AlignmentType | RoleType) => (t === AlignmentType.Good) || (t === AlignmentType.Evil) ? t.toLowerCase() : `${/^[AEIOU]/.test(t) ? 'an' : 'a'} ${t}`;
		const list = unique.map(describe);
		const joined = list.length > 1 ? `${list.slice(0, -1).join(', ')} or ${list[ list.length - 1 ]}` : list[ 0 ];
		return `${player.name} is the ${player.character?.name ?? '?'} and might register as ${joined}.`;
	};

	private static getBelievesWarning = (ownerCharacterID: string, ownerCharacterName: string, believedID: string) => {
		const believed = believedID ? (CharacterLogic.getCharacters().find(c => c.id === believedID)?.name ?? believedID) : 'another character';
		switch (ownerCharacterID) {
			case 'drunk':
				return `Is the Drunk: thinks they are the ${believed}. They have no ability; you may give false information.`;
			case 'marionette':
				return `Is the Marionette: thinks they are the ${believed}. They have no ability; you may give false information.`;
			case 'lunatic':
				return `Is the Lunatic: thinks they are the ${believed}. Their choices don't kill; the real Demon learns who they chose.`;
			default:
				return `Is the ${ownerCharacterName}: thinks they are the ${believed}.`;
		}
	};

	private static believesRole = (game: Game, player: Player, role: RoleType) => {
		return GameLogic.getEffectsOnPlayer(game, player).some(e =>
			(e.type === EffectType.BelievesTheyAre)
			&& (CharacterLogic.getCharacters().find(c => c.id === e.data.characterID)?.role === role));
	};
}
