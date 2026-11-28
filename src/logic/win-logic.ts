import { AlignmentType } from '../enums/alignment-type';
import type { Character } from '../models/character';
import { EffectType } from '../enums/effect-type';
import type { Game } from '../models/game';
import { GameLogic } from './game-logic';
import { ModifierType } from '../enums/modifier-type';
import { PhaseType } from '../enums/phase-type';
import type { Player } from '../models/player';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';

export interface SuggestedResult {
	winner: AlignmentType;
	reason: string;
	// Something the Storyteller should check before accepting it
	caveat: string | null;
}

export interface WinCondition {
	key: string;
	// The character the condition comes from
	character: Character;
	// The player who has that character; null for Fabled and Loric
	owner: Player | null;
	text: string;
	// For conditions placed on other players (eg the Fearmonger's Fear)
	placedOn: Player[];
}

export class WinLogic {
	// The core end-of-game rules; character win conditions are listed separately for the Storyteller to apply
	static getSuggestedResult = (game: Game): SuggestedResult | null => {
		if ((game.phase.type !== PhaseType.Night) && (game.phase.type !== PhaseType.Day)) {
			return null;
		}

		const alive = game.players.filter(p => (p.state === PlayerState.Alive) && (p.character?.role !== RoleType.Traveller));
		const demons = alive.filter(p => p.character?.role === RoleType.Demon);

		if (demons.length === 0) {
			// The Demon has just died, so five or more were alive a moment ago if four or more are alive now
			const scarletWoman = alive.find(p => p.character?.id === 'scarletwoman');
			return {
				winner: AlignmentType.Good,
				reason: 'No Demon is alive',
				caveat: scarletWoman && (alive.length >= 4)
					? `${scarletWoman.name} is the Scarlet Woman and may become the Demon instead`
					: null
			};
		}

		if (alive.length <= 2) {
			return {
				winner: AlignmentType.Evil,
				reason: 'Only two players are left alive',
				caveat: null
			};
		}

		return null;
	};

	// Every win condition from characters in play, whether or not it applies yet
	static getWinConditions = (game: Game): WinCondition[] => {
		const conditions: WinCondition[] = [];

		game.players
			.filter(p => p.character && (p.state === PlayerState.Alive))
			.forEach(owner => {
				GameLogic.getPlayerModifiers(game)
					.filter(pm => pm.player.id === owner.id)
					.forEach(({ modifier }) => {
						modifier.data.effects
							.filter(e => e.type === EffectType.HasWinCondition)
							.forEach(e => conditions.push({
								key: `${owner.id}-${e.id}`,
								character: owner.character!,
								owner: owner,
								text: e.type === EffectType.HasWinCondition ? e.data.text : '',
								placedOn: modifier.data.type === 'assigned' ? game.players.filter(p => modifier.data.playerIDs.includes(p.id)) : []
							}));
					});
			});

		game.otherCharacters.forEach(character => {
			character.modifiers
				.filter(m => m.type === ModifierType.PlayerModifier)
				.forEach(modifier => {
					modifier.data.effects
						.filter(e => e.type === EffectType.HasWinCondition)
						.forEach(e => conditions.push({
							key: `${character.id}-${e.id}`,
							character: character,
							owner: null,
							text: e.type === EffectType.HasWinCondition ? e.data.text : '',
							placedOn: game.players.filter(p => modifier.data.playerIDs.includes(p.id))
						}));
				});
		});

		return conditions;
	};
}
