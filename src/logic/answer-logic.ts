import type { AnswerRule, ShowPlayer } from '../models/show-player';
import type { RevealContent, RevealItem } from '../models/reveal';
import { AlignmentType } from '../enums/alignment-type';
import { EffectType } from '../enums/effect-type';
import type { Game } from '../models/game';
import { GameLogic } from './game-logic';
import { PhaseType } from '../enums/phase-type';
import type { Player } from '../models/player';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';
import { ShowPlayerType } from '../enums/show-player-type';
import type { Wake } from './night-logic';
import { WarningLogic } from './warning-logic';

// The true answer to an information step, worked out from the grimoire
export interface WorkedAnswer {
	// The content to show the player: a number, yes / no, or a character
	content: RevealContent;
	// How the answer was reached, one line per fact, eg 'Hugo (left): good'
	working: string[];
	// Reasons the Storyteller might give a different answer, eg the player is poisoned
	cautions: string[];
}

export class AnswerLogic {
	static getRule = (step: ShowPlayer | undefined): AnswerRule | null => {
		switch (step?.type) {
			case ShowPlayerType.Number:
			case ShowPlayerType.YesNo:
				return step.data?.answer ?? null;
			case ShowPlayerType.Character:
				return step.data.answer ?? null;
		}
		return null;
	};

	// Whether the rule depends on a choice made earlier in the same wake
	static needsChoice = (rule: AnswerRule) => {
		return rule.type.startsWith('chosen_');
	};

	// The true answer to the step at this index, or null if it has no rule or can't be worked out yet
	static workOut = (game: Game, wake: Wake, items: (RevealItem | null)[], index: number): WorkedAnswer | null => {
		const rule = AnswerLogic.getRule(wake.steps[ index ]);
		const owner = wake.players.length === 1 ? wake.players[ 0 ] : null;
		if (!rule || !owner) {
			return null;
		}

		const result = AnswerLogic.evaluate(game, rule, owner, AnswerLogic.getChosen(game, items, index));
		if (!result) {
			return null;
		}

		// The waking player's own state: drunk, poisoned or mistaken about who they are
		const cautions = [ ...WarningLogic.getWarnings(game, owner) ];
		if (wake.believedCharacterID) {
			cautions.push(`${owner.name} only thinks they have this ability, so any answer will do.`);
		}
		// Anyone involved who might register as something else
		result.involved.forEach(p => {
			const note = WarningLogic.getRegistrationNote(game, p);
			if (note) {
				cautions.push(note);
			}
		});

		return { content: result.content, working: result.working, cautions: cautions.filter((c, n) => cautions.indexOf(c) === n) };
	};

	// The players picked in the nearest earlier choice in this wake
	static getChosen = (game: Game, items: (RevealItem | null)[], index: number): Player[] | null => {
		for (let i = index - 1; i >= 0; i--) {
			const content = items[ i ]?.content;
			if (content?.type === 'choose_players') {
				return content.playerIDs.map(id => game.players.find(p => p.id === id)).filter(p => p !== undefined);
			}
		}
		return null;
	};

	private static isEvil = (player: Player) => player.alignment === AlignmentType.Evil;

	private static describe = (player: Player) => `${player.name}: ${AnswerLogic.isEvil(player) ? 'evil' : 'good'}`;

	private static evaluate = (game: Game, rule: AnswerRule, owner: Player, chosen: Player[] | null): { content: RevealContent, working: string[], involved: Player[] } | null => {
		const players = game.players;
		const count = players.length;

		switch (rule.type) {
			case 'evil_living_neighbours': {
				const index = players.indexOf(owner);
				const find = (step: number) => {
					for (let i = 1; i < count; i++) {
						const p = players[ (((index + (step * i)) % count) + count) % count ];
						if ((p.id !== owner.id) && (p.state === PlayerState.Alive)) {
							return p;
						}
					}
					return null;
				};
				const neighbours = [ find(-1), find(1) ].filter(p => p !== null).filter((p, n, all) => all.findIndex(q => q.id === p.id) === n);
				return {
					content: { type: 'number', value: neighbours.filter(AnswerLogic.isEvil).length },
					working: neighbours.map(AnswerLogic.describe),
					involved: neighbours
				};
			}
			case 'evil_pairs': {
				const pairs: string[] = [];
				if (count > 2) {
					players.forEach((p, i) => {
						const next = players[ (i + 1) % count ];
						if (AnswerLogic.isEvil(p) && AnswerLogic.isEvil(next)) {
							pairs.push(`${p.name} and ${next.name}`);
						}
					});
				}
				return {
					content: { type: 'number', value: pairs.length },
					working: pairs.length > 0 ? pairs : [ 'No evil players sit next to each other' ],
					involved: players.filter(p => p.id !== owner.id)
				};
			}
			case 'dead_evil': {
				const dead = players.filter(p => p.state !== PlayerState.Alive);
				const evil = dead.filter(AnswerLogic.isEvil);
				return {
					content: { type: 'number', value: evil.length },
					working: dead.length > 0 ? dead.map(AnswerLogic.describe) : [ 'Nobody is dead' ],
					involved: dead
				};
			}
			case 'demon_to_minion': {
				const demons = players.filter(p => p.character?.role === RoleType.Demon);
				const minions = players.filter(p => p.character?.role === RoleType.Minion);
				if ((demons.length === 0) || (minions.length === 0)) {
					return null;
				}
				let best: { steps: number, demon: Player, minion: Player } | null = null;
				demons.forEach(d => minions.forEach(m => {
					const gap = Math.abs(players.indexOf(d) - players.indexOf(m));
					const steps = Math.min(gap, count - gap);
					if (!best || (steps < best.steps)) {
						best = { steps, demon: d, minion: m };
					}
				}));
				const found = best as { steps: number, demon: Player, minion: Player } | null;
				return found
					? {
						content: { type: 'number', value: found.steps },
						working: [ `${found.demon.name} (${found.demon.character?.name}) to ${found.minion.name} (${found.minion.character?.name})` ],
						involved: [ ...demons, ...minions ]
					}
					: null;
			}
			case 'executed_character': {
				// The night after Day N is Night N + 1
				const night = game.phase.type === PhaseType.Night ? game.phase.number : game.phase.number + 1;
				const day = game.history.days.find(d => d.number === night - 1);
				const executed = players.find(p => p.id === day?.executedPlayerID);
				if (!executed?.character) {
					return { content: { type: 'characters', characterIDs: [] }, working: [ 'Nobody was executed today' ], involved: [] };
				}
				return {
					content: { type: 'characters', characterIDs: [ executed.character.id ] },
					working: [ `${executed.name} was executed: ${executed.character.name}` ],
					involved: [ executed ]
				};
			}
			case 'chosen_character': {
				const target = chosen?.[ 0 ];
				if (!target?.character) {
					return null;
				}
				return {
					content: { type: 'characters', characterIDs: [ target.character.id ] },
					working: [ `${target.name} is the ${target.character.name}` ],
					involved: [ target ]
				};
			}
			case 'chosen_include': {
				if (!chosen || (chosen.length === 0)) {
					return null;
				}
				const working = chosen.map(p => {
					// Reminders this player's own ability placed, that make someone register as the role to them alone (eg a red herring)
					const toOwner = GameLogic.getModifiersOnPlayer(game, p)
						.filter(pm => pm.player.id === owner.id)
						.flatMap(pm => pm.modifier.data.effects)
						.some(e => (e.type === EffectType.CanRegisterAs) && e.data.onlyToOwner && e.data.registerAs.includes(rule.role));
					const is = p.character?.role === rule.role;
					return { player: p, counts: is || toOwner, text: `${p.name}: ${p.character?.name ?? 'no character'}${toOwner && !is ? ` (registers as a ${rule.role} to ${owner.name})` : ''}` };
				});
				return {
					content: { type: 'yes_no', value: working.some(w => w.counts) },
					working: working.map(w => w.text),
					involved: chosen
				};
			}
			case 'chosen_same_alignment': {
				if (!chosen || (chosen.length < 2)) {
					return null;
				}
				return {
					content: { type: 'yes_no', value: chosen.every(p => p.alignment === chosen[ 0 ].alignment) },
					working: chosen.map(AnswerLogic.describe),
					involved: chosen
				};
			}
		}
	};

	// Whether the item already shows this answer
	static matches = (item: RevealItem, answer: WorkedAnswer) => {
		const a = item.content;
		const b = answer.content;
		if ((a.type === 'number') && (b.type === 'number')) {
			return a.value === b.value;
		}
		if ((a.type === 'yes_no') && (b.type === 'yes_no')) {
			return a.value === b.value;
		}
		if ((a.type === 'characters') && (b.type === 'characters')) {
			return JSON.stringify(a.characterIDs) === JSON.stringify(b.characterIDs);
		}
		return false;
	};

	// The item with the worked-out answer in place
	static apply = (item: RevealItem, answer: WorkedAnswer): RevealItem => {
		return (item.content.type === answer.content.type) ? { ...item, content: answer.content } : item;
	};

	// A short form of the answer, eg '1', 'Yes' or 'Imp'
	static describeAnswer = (answer: WorkedAnswer, characterName: (id: string) => string) => {
		const c = answer.content;
		switch (c.type) {
			case 'number':
				return `${c.value}`;
			case 'yes_no':
				return c.value ? 'Yes' : 'No';
			case 'characters':
				return c.characterIDs.length > 0 ? c.characterIDs.map(characterName).join(', ') : 'Nothing to show';
		}
		return '';
	};
}
