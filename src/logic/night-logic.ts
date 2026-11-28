import type { ChoiceOutcomeAction, ShowPlayer } from '../models/show-player';
import type { Night, NightStepRecord } from '../models/night';
import { AnswerLogic } from './answer-logic';
import type { Character } from '../models/character';
import { CharacterLogic } from './character-logic';
import { EffectType } from '../enums/effect-type';
import { Factory } from './factory';
import type { Game } from '../models/game';
import { GameLogic } from './game-logic';
import { NightOrder } from '../data/night-order';
import { PhaseLogic } from './phase-logic';
import { PhaseType } from '../enums/phase-type';
import type { Player } from '../models/player';
import type { PlayerModifier } from '../models/modifier';
import { PlayerState } from '../enums/player-state';
import type { RevealItem } from '../models/reveal';
import { RevealLogic } from './reveal-logic';
import { RoleType } from '../enums/role-type';
import { ShowPlayerType } from '../enums/show-player-type';

// One entry in tonight's night order: a player (or group of players) being woken
export interface Wake {
	key: string;
	title: string;
	// The character whose ability this is; null for Minion / Demon info
	character: Character | null;
	// The players being woken
	players: Player[];
	// The player the night records are filed against; null for group wakes
	playerID: string | null;
	// The character the player believes they are, if it's not their real character (eg the Drunk)
	believedCharacterID: string | null;
	steps: ShowPlayer[];
}

export class NightLogic {
	// The night being run, or during the day, the night that comes next
	static getNightNumber = (game: Game) => {
		if (game.phase.type === PhaseType.Day) {
			return game.phase.number + 1;
		}
		return Math.max(1, game.phase.number);
	};

	static isFirstNight = (game: Game) => {
		return NightLogic.getNightNumber(game) === 1;
	};

	static getWakes = (game: Game): Wake[] => {
		const firstNight = NightLogic.isFirstNight(game);
		const order = firstNight ? NightOrder.firstNight : NightOrder.otherNights;
		const alive = game.players.filter(p => p.state === PlayerState.Alive);
		const night = NightLogic.getNightNumber(game);

		const wakes: Wake[] = [];
		order.forEach(entry => {
			switch (entry) {
				case '_dusk': {
					wakes.push({
						key: `${night}-dusk`,
						title: 'Dusk',
						character: null,
						players: [],
						playerID: null,
						believedCharacterID: null,
						steps: [
							Factory.createShowPlayerStorytellerAction({ id: 'dusk', text: 'Dusk', action: 'Ask everyone to close their eyes.' })
						]
					});
					return;
				}
				case '_dawn': {
					wakes.push({
						key: `${night}-dawn`,
						title: 'Dawn',
						character: null,
						players: [],
						playerID: null,
						believedCharacterID: null,
						steps: [
							Factory.createShowPlayerStorytellerAction({ id: 'dawn', text: 'Dawn', action: 'Ask everyone to open their eyes.' }),
							Factory.createShowPlayerStorytellerAction({ id: 'night_deaths', text: 'Deaths', action: 'Announce any deaths that happened overnight.' })
						]
					});
					return;
				}
				case '_minion_info': {
					// A Poppy Grower with their ability stops evil learning each other
					if (!NightLogic.hasAbility(game, 'poppygrower')) {
						wakes.push(...NightLogic.getEvilInfoWakes(game, night, 'minions'));
					}
					return;
				}
				case '_demon_info': {
					if (!NightLogic.hasAbility(game, 'poppygrower')) {
						wakes.push(...NightLogic.getEvilInfoWakes(game, night, 'demon'));
					}
					return;
				}
				case 'snitch': {
					// The Snitch doesn't wake: each Minion is shown their own bluffs instead
					if (NightLogic.hasAbility(game, 'snitch')) {
						const snitch = CharacterLogic.getCharacter('snitch');
						alive
							.filter(p => p.character?.role === RoleType.Minion)
							.forEach(p => wakes.push({
								key: `${night}-snitch-${p.id}`,
								title: 'Minion bluffs',
								character: snitch,
								players: [ p ],
								playerID: p.id,
								believedCharacterID: null,
								steps: snitch.wakesFirstNight
							}));
					}
					return;
				}
				case 'poppygrower': {
					if (firstNight) {
						break;
					}
					// Once the Poppy Grower has died, evil learns each other at this point in the next night, if they haven't already;
					// a Poppy Grower killed later tonight (eg by the Demon) has already been passed, so that waits until tomorrow night
					const diedTonight = (p: Player) => (p.death?.phase.type === PhaseType.Night) && (p.death.phase.number === night);
					const died = game.players.some(p => (p.character?.id === 'poppygrower') && (p.state !== PlayerState.Alive) && !diedTonight(p));
					if (died && !NightLogic.hasEvilInfo(game, night)) {
						wakes.push(...NightLogic.getEvilInfoWakes(game, night, 'minions'), ...NightLogic.getEvilInfoWakes(game, night, 'demon'));
					}
					return;
				}
			}

			if (entry.startsWith('_')) {
				return;
			}

			const character = CharacterLogic.getCharacter(entry);
			const steps = firstNight ? character.wakesFirstNight : character.wakesOtherNights;
			if (steps.length === 0) {
				return;
			}

			alive
				.filter(p => p.character?.id === entry)
				.forEach(p => wakes.push({
					key: `${night}-${entry}-${p.id}`,
					title: character.name,
					character: character,
					players: [ p ],
					playerID: p.id,
					believedCharacterID: null,
					steps: steps
				}));

			alive
				.filter(p => NightLogic.getBelievedCharacterID(game, p) === entry)
				.forEach(p => wakes.push({
					key: `${night}-${entry}-${p.id}`,
					title: character.name,
					character: character,
					players: [ p ],
					playerID: p.id,
					believedCharacterID: entry,
					steps: steps
				}));
		});

		return wakes;
	};

	// Whether a living player really is this character and isn't drunk or poisoned
	static hasAbility = (game: Game, characterID: string) => {
		return game.players
			.filter(p => (p.state === PlayerState.Alive) && (p.character?.id === characterID))
			.some(p => !GameLogic.getEffectsOnPlayer(game, p).some(e => (e.type === EffectType.IsDrunk) || (e.type === EffectType.IsPoisoned)));
	};

	// Minion info (who the Demon is, and the other Minions) or Demon info (who the Minions are, and the bluffs)
	// Evil only learns each other in games of 7 or more
	static getEvilInfoWakes = (game: Game, night: number, which: 'minions' | 'demon'): Wake[] => {
		const role = which === 'minions' ? RoleType.Minion : RoleType.Demon;
		const players = game.players.filter(p => (p.state === PlayerState.Alive) && (p.character?.role === role));
		if ((game.players.length < 7) || (players.length === 0)) {
			return [];
		}

		const entry = which === 'minions' ? '_minion_info' : '_demon_info';
		return [ {
			key: `${night}-${entry}`,
			title: which === 'minions' ? 'Minion info' : 'Demon info',
			character: null,
			players: players,
			playerID: null,
			believedCharacterID: null,
			steps: which === 'minions'
				? [
					Factory.createShowPlayerDemonIs({ id: '_minion_info_demon', text: 'This is your Demon' }),
					Factory.createShowPlayerMinionsAre({ id: '_minion_info_minions', text: 'These are your Minions' })
				]
				: [
					Factory.createShowPlayerMinionsAre({ id: '_demon_info_minions', text: 'These are your Minions' }),
					Factory.createShowPlayerBluffsAre({ id: NightLogic.demonBluffsStepID, text: 'These characters are not in play' })
				]
		} ];
	};

	static demonBluffsStepID = '_demon_info_bluffs';

	// Whether Minion or Demon info was shown or skipped on an earlier night
	private static hasEvilInfo = (game: Game, night: number) => {
		const stepIDs = [ '_minion_info_demon', '_minion_info_minions', '_demon_info_minions', NightLogic.demonBluffsStepID ];
		return game.history.nights
			.filter(n => n.number < night)
			.some(n => n.steps.some(r => stepIDs.includes(r.stepID)));
	};

	static getBelievedCharacterID = (game: Game, player: Player) => {
		const effect = GameLogic.getEffectsOnPlayer(game, player)
			.find(e => e.type === EffectType.BelievesTheyAre);

		return (effect && effect.type === EffectType.BelievesTheyAre && effect.data.characterID) ? effect.data.characterID : null;
	};

	// Builds the reveal items for a wake, pre-filled from the game state, or from tonight's records if it has already been shown
	// Null entries are Storyteller-only steps
	static createItems = (game: Game, wake: Wake): (RevealItem | null)[] => {
		const player = wake.players.length === 1 ? wake.players[ 0 ] : null;
		const night = NightLogic.getNight(game);

		const items = wake.steps.map(step => {
			let item = RevealLogic.createItem(step, game, player);
			if (item && (item.content.type === 'you_are') && wake.believedCharacterID) {
				// Show the player the character they believe they are, not their real one
				item = { ...item, content: { ...item.content, characterID: wake.believedCharacterID } };
			}
			if (item) {
				item = NightLogic.fillFromReminders(game, wake, step, item);
			}

			const record = night.steps.find(r => (r.stepID === step.id) && (r.playerID === wake.playerID));
			return item && record && (!record.ignored || NightLogic.isQuestion(item)) ? NightLogic.applyRecord(item, record) : item;
		});

		// Fill in answers the app can work out, unless there's a reason the Storyteller might give a different one,
		// or the step has already been recorded tonight. Answers that depend on a choice wait for it.
		return items.map((item, index) => {
			const step = wake.steps[ index ];
			const rule = AnswerLogic.getRule(step);
			if (!item || !rule || AnswerLogic.needsChoice(rule) || night.steps.some(r => (r.stepID === step.id) && (r.playerID === wake.playerID))) {
				return item;
			}
			const answer = AnswerLogic.workOut(game, wake, items, index);
			return (answer && (answer.cautions.length === 0)) ? AnswerLogic.apply(item, answer) : item;
		});
	};

	// Fills in the later steps whose answers depend on the choice at this index, unless there's a reason to give a different answer
	static fillChosenAnswers = (game: Game, wake: Wake, items: (RevealItem | null)[], index: number): (RevealItem | null)[] => {
		return items.map((item, i) => {
			const rule = AnswerLogic.getRule(wake.steps[ i ]);
			if (!item || (i <= index) || !rule || !AnswerLogic.needsChoice(rule)) {
				return item;
			}
			const answer = AnswerLogic.workOut(game, wake, items, i);
			return (answer && (answer.cautions.length === 0)) ? AnswerLogic.apply(item, answer) : item;
		});
	};

	// Fills Character and Player steps from the setup reminders the waking character placed (eg the Washerwoman's Townsfolk and Wrong)
	static fillFromReminders = (game: Game, wake: Wake, step: ShowPlayer, item: RevealItem): RevealItem => {
		// Someone who only believes they are this character placed no reminders, so there's nothing to go on
		if (!wake.playerID || wake.believedCharacterID) {
			return item;
		}

		const ownerID = wake.playerID;
		const getModifier = (modifierID: string) => GameLogic.findPlayerModifier(game, ownerID, modifierID);

		if ((step.type === ShowPlayerType.Character) && step.data?.fromReminder && (item.content.type === 'characters')) {
			const modifier = getModifier(step.data.fromReminder);
			const holder = game.players.find(p => modifier?.data.playerIDs.includes(p.id));
			const roles = (modifier?.data.restrictions ?? []).filter(r => Object.values(RoleType).includes(r as RoleType));
			// A misregistering holder (eg a Recluse shown as a Minion) needs the Storyteller to pick the character
			if (holder?.character && ((roles.length === 0) || roles.includes(holder.character.role))) {
				return { ...item, content: { ...item.content, characterIDs: [ holder.character.id ] } };
			}
			return item;
		}

		if ((step.type === ShowPlayerType.Player) && (step.data?.fromReminders.length ?? 0) > 0 && (item.content.type === 'players')) {
			const modifierIDs = step.data.fromReminders;
			// Seat order, so the correct player isn't always the first one shown
			const holders = game.players.filter(p => modifierIDs.some(id => getModifier(id)?.data.playerIDs.includes(p.id)));
			const holder = holders[ step.data.index ];
			return holder ? { ...item, content: { ...item.content, playerIDs: [ holder.id ] } } : item;
		}

		return item;
	};

	static applyRecord = (item: RevealItem, record: NightStepRecord): RevealItem => {
		const content = item.content;
		switch (content.type) {
			case 'you_are':
				return { ...item, content: { ...content, characterID: record.characterIDs[ 0 ] ?? null, alignment: record.alignment } };
			case 'characters':
			case 'choose_characters':
				return { ...item, content: { ...content, characterIDs: record.characterIDs } };
			case 'players':
			case 'choose_players':
				return { ...item, content: { ...content, playerIDs: record.playerIDs } };
			case 'alignment':
				return { ...item, content: { ...content, alignment: record.alignment ?? content.alignment } };
			case 'number':
				return { ...item, content: { ...content, value: record.number ?? content.value } };
			case 'yes_no':
				return { ...item, content: { ...content, value: record.yesNo ?? content.value } };
			case 'choose_yes_no':
				return { ...item, content: { ...content, value: record.yesNo } };
			default:
				return item;
		}
	};

	static getNight = (game: Game): Night => {
		const number = NightLogic.getNightNumber(game);
		return game.history.nights.find(n => n.number === number) ?? Factory.createNight({ number: number });
	};

	static isQuestion = (item: RevealItem | null): boolean => {
		switch (item?.content.type) {
			case 'choose_players':
			case 'choose_characters':
			case 'choose_yes_no':
				return true;
			default:
				return false;
		}
	};

	static isAnswerValid = (item: RevealItem): boolean => {
		switch (item.content.type) {
			case 'choose_players':
				return item.content.playerIDs.length >= item.content.min && item.content.playerIDs.length <= item.content.max;
			case 'choose_characters':
				return item.content.characterIDs.length >= item.content.min && item.content.characterIDs.length <= item.content.max;
			case 'choose_yes_no':
				return item.content.value !== null;
			default:
				return false;
		}
	};

	static hasAnswer = (item: RevealItem): boolean => {
		switch (item.content.type) {
			case 'choose_players':
				return item.content.playerIDs.length > 0;
			case 'choose_characters':
				return item.content.characterIDs.length > 0;
			case 'choose_yes_no':
				return item.content.value !== null;
			default:
				return false;
		}
	};

	// Splits a wake into what's shown together: a stage ends at each step where the player chooses something,
	// so their answer is known before the next stage (eg the Fortune Teller's yes / no) is shown
	static getStages = (items: (RevealItem | null)[]): number[][] => {
		const stages: number[][] = [];
		let current: number[] = [];
		items.forEach((item, index) => {
			current.push(index);
			if (NightLogic.isQuestion(item)) {
				stages.push(current);
				current = [];
			}
		});
		if (current.length > 0) {
			stages.push(current);
		}
		return stages;
	};

	// Whether any step of the wake (or of the given steps) has been shown tonight
	static isShown = (game: Game, wake: Wake, indices?: number[]) => {
		const night = NightLogic.getNight(game);
		return wake.steps
			.filter((_, index) => !indices || indices.includes(index))
			.some(step => night.steps.some(r => (r.stepID === step.id) && (r.playerID === wake.playerID) && !r.ignored));
	};

	static isStarted = (game: Game, wake: Wake, indices?: number[]) => {
		const night = NightLogic.getNight(game);
		return wake.steps
			.filter((_, index) => !indices || indices.includes(index))
			.some(step => night.steps.some(r => (r.stepID === step.id) && (r.playerID === wake.playerID)));
	};

	static isComplete = (game: Game, wake: Wake, indices: number[]) => {
		const night = NightLogic.getNight(game);
		return wake.steps
			.filter((_, index) => indices.includes(index))
			.every(step => night.steps.some(r => (r.stepID === step.id) && (r.playerID === wake.playerID) && (r.answerComplete !== false)));
	};

	static recordShown = (game: Game, wake: Wake, items: (RevealItem | null)[], indices?: number[]): Game => {
		return NightLogic.recordSteps(game, wake, items, indices, false);
	};

	static recordIgnored = (game: Game, wake: Wake, items: (RevealItem | null)[], indices: number[]): Game => {
		return NightLogic.recordSteps(game, wake, items, indices, true);
	};

	static recordAnswer = (game: Game, wake: Wake, items: (RevealItem | null)[], index: number): Game => {
		const step = wake.steps[ index ];
		const record = NightLogic.getNight(game).steps.find(r => (r.stepID === step.id) && (r.playerID === wake.playerID));
		if (!record || !NightLogic.isQuestion(items[ index ])) {
			throw new Error('Cannot record an answer before the question is shown or ignored');
		}
		const updated = NightLogic.recordSteps(game, wake, items, [ index ], record.ignored === true);
		return NightLogic.setAnswerComplete(updated, wake, index, false);
	};

	static completeAnswer = (game: Game, wake: Wake, item: RevealItem, index: number): Game => {
		const night = NightLogic.getNight(game);
		const step = wake.steps[ index ];
		const record = night.steps.find(r => (r.stepID === step.id) && (r.playerID === wake.playerID));
		if (!record) {
			throw new Error('Cannot complete a question before it is shown or ignored');
		}
		// An ignored question (eg the Ravenkeeper didn't die) can be completed without an answer
		if (!NightLogic.isAnswerValid(item) && !(record.ignored && !NightLogic.hasAnswer(item))) {
			throw new Error('Cannot complete a question without a valid answer');
		}
		return NightLogic.setAnswerComplete(game, wake, index, true);
	};

	private static setAnswerComplete = (game: Game, wake: Wake, index: number, complete: boolean): Game => {
		const night = NightLogic.getNight(game);
		const step = wake.steps[ index ];
		return {
			...game,
			history: {
				...game.history,
				nights: game.history.nights.map(n => n.number === night.number
					? { ...n, steps: n.steps.map(r => (r.stepID === step.id) && (r.playerID === wake.playerID) ? { ...r, answerComplete: complete } : r) }
					: n)
			}
		};
	};

	private static recordSteps = (game: Game, wake: Wake, items: (RevealItem | null)[], indices: number[] | undefined, ignored: boolean): Game => {
		const night = NightLogic.getNight(game);
		const steps = wake.steps.filter((_, index) => !indices || indices.includes(index));

		const records = steps.map(step => {
			const index = wake.steps.indexOf(step);
			const record: NightStepRecord = Factory.createNightStepRecord({ stepID: step.id, playerID: wake.playerID });
			const previous = night.steps.find(r => (r.stepID === step.id) && (r.playerID === wake.playerID));
			const item = items[ index ];
			if (NightLogic.isQuestion(item)) {
				record.answerComplete = previous ? previous.answerComplete ?? true : false;
			}
			if (ignored) {
				record.ignored = true;
			}
			if (ignored && !NightLogic.isQuestion(item)) {
				return record;
			}
			switch (item?.content.type) {
				case 'you_are':
					record.characterIDs = item.content.characterID ? [ item.content.characterID ] : [];
					record.alignment = item.content.alignment;
					break;
				case 'characters':
				case 'choose_characters':
					record.characterIDs = item.content.characterIDs;
					break;
				case 'players':
				case 'choose_players':
					record.playerIDs = item.content.playerIDs;
					break;
				case 'alignment':
					record.alignment = item.content.alignment;
					break;
				case 'number':
					record.number = item.content.value;
					break;
				case 'yes_no':
				case 'choose_yes_no':
					record.yesNo = item.content.value;
					break;
			}
			return record;
		});

		const updatedNight: Night = {
			...night,
			steps: [
				...night.steps.filter(r => !(steps.some(s => s.id === r.stepID) && (r.playerID === wake.playerID))),
				...records
			]
		};

		return {
			...NightLogic.recordBluffs(game, wake, steps, records),
			history: {
				...game.history,
				nights: [
					...game.history.nights.filter(n => n.number !== night.number),
					updatedNight
				].sort((a, b) => a.number - b.number)
			}
		};
	};

	// Remembers the bluffs each woken player was shown; the Demon's are also the game's bluffs
	private static recordBluffs = (game: Game, wake: Wake, steps: ShowPlayer[], records: NightStepRecord[]): Game => {
		let updated = game;
		steps.forEach((step, n) => {
			const record = records[ n ];
			if ((step.type !== ShowPlayerType.BluffsAre) || record.ignored) {
				return;
			}
			const bluffs = record.characterIDs.map(CharacterLogic.getCharacter);
			updated = {
				...updated,
				players: updated.players.map(p => wake.players.some(w => w.id === p.id) ? { ...p, bluffs: bluffs } : p),
				bluffs: step.id === NightLogic.demonBluffsStepID ? bluffs : updated.bluffs
			};
		});
		return updated;
	};

	// The reminder a choice can place (killing or reviving as it does), if the waking character's choice can be acted on
	static getChoiceOutcome = (game: Game, wake: Wake, index: number) => {
		const step = wake.steps[ index ];
		if ((step?.type !== ShowPlayerType.ChoosePlayers) || !step.data.outcome || !wake.playerID || wake.believedCharacterID) {
			return null;
		}

		const outcome = step.data.outcome;
		const modifier = GameLogic.findPlayerModifier(game, wake.playerID, outcome.modifierID);
		if (!modifier || (modifier.data.type !== 'assigned')) {
			return null;
		}

		return { outcome: outcome, modifier: modifier };
	};

	// Only living players can be killed, and only dead ones revived
	static isOutcomeTarget = (player: Player, action: ChoiceOutcomeAction) => {
		return ((action !== 'kill') || (player.state === PlayerState.Alive)) && ((action !== 'revive') || (player.state !== PlayerState.Alive));
	};

	static getOutcomeTargets = (game: Game, action: ChoiceOutcomeAction) => {
		return game.players.filter(p => NightLogic.isOutcomeTarget(p, action));
	};

	static isOutcomeSelectionValid = (modifier: PlayerModifier, playerIDs: string[]) => {
		return (playerIDs.length > 0) && ((modifier.data.max === null) || (playerIDs.length <= modifier.data.max));
	};

	// The wording for applying a choice outcome
	static getOutcomeLabels = (action: ChoiceOutcomeAction, modifier: PlayerModifier) => {
		switch (action) {
			case 'kill':
				return { title: 'Confirm deaths', button: 'Kill selected players' };
			case 'revive':
				return { title: 'Confirm resurrection', button: 'Revive selected players' };
			case 'place':
				return { title: `Place ${modifier.label} reminder`, button: 'Place reminder' };
		}
	};

	// Players picked in a wake, who might register as something else (eg the Recluse as a Minion)
	static getPickedPlayerIDs = (items: (RevealItem | null)[]) => {
		return items.flatMap(item => {
			switch (item?.content.type) {
				case 'players':
				case 'choose_players':
					return item.content.playerIDs;
				default:
					return [];
			}
		});
	};

	static isWakeShown = (game: Game, wake: Wake, items: (RevealItem | null)[]) => {
		return NightLogic.getStages(items).every(stage => NightLogic.isShown(game, wake, stage));
	};

	// The steps of the stages that have already been shown, whose records should follow any edits
	static getShownIndices = (game: Game, wake: Wake, items: (RevealItem | null)[]) => {
		return NightLogic.getStages(items).filter(stage => NightLogic.isShown(game, wake, stage)).flat();
	};

	// The items at these steps that have something to show
	static getItemsToShow = (items: (RevealItem | null)[], indices: number[]) => {
		return indices.map(i => items[ i ]).filter(i => i !== null);
	};

	// Whether a stage has anything to show the player, and which of its steps (if any) asks them a question
	static getStageInfo = (items: (RevealItem | null)[], stage: number[]) => {
		const questionIndex = stage.find(i => NightLogic.isQuestion(items[ i ]));
		return {
			hasAnythingToShow: stage.some(i => items[ i ] !== null),
			questionIndex: questionIndex ?? null
		};
	};

	// Whether an answered choice has an outcome the Storyteller can now apply
	static hasOutcomeToApply = (wake: Wake, index: number, item: RevealItem) => {
		const step = wake.steps[ index ];
		return (step.type === ShowPlayerType.ChoosePlayers) && !!step.data.outcome && !wake.believedCharacterID && NightLogic.hasAnswer(item);
	};

	static isWakeComplete = (game: Game, wake: Wake, items: (RevealItem | null)[]) => {
		return NightLogic.getStages(items).every(stage => NightLogic.isComplete(game, wake, stage));
	};

	// The wake to show: the one the Storyteller picked, or else the first that isn't done yet
	static getSelectedWake = (game: Game, wakes: Wake[], selectedKey: string | null, getItems: (wake: Wake) => (RevealItem | null)[]) => {
		return wakes.find(w => w.key === selectedKey)
			?? wakes.find(w => !NightLogic.isWakeComplete(game, w, getItems(w)))
			?? wakes[ 0 ]
			?? null;
	};

	static applyChoiceOutcome = (game: Game, wake: Wake, index: number, playerIDs: string[]): Game => {
		const step = wake.steps[ index ];
		if ((game.phase.type !== PhaseType.Night) || !wake.playerID || wake.believedCharacterID
			|| (step?.type !== ShowPlayerType.ChoosePlayers) || !step.data.outcome
			|| !NightLogic.isComplete(game, wake, [ index ])) {
			throw new Error('Cannot apply this night choice outcome');
		}

		const { modifierID, action } = step.data.outcome;
		const ownerID = wake.playerID;
		const modifier = GameLogic.findPlayerModifier(game, ownerID, modifierID);
		if (!modifier || modifier.data.type !== 'assigned' || !NightLogic.isOutcomeSelectionValid(modifier, playerIDs)
			|| new Set(playerIDs).size !== playerIDs.length
			|| playerIDs.some(id => !game.players.some(p => (p.id === id) && NightLogic.isOutcomeTarget(p, action)))) {
			throw new Error('Invalid players or modifier for night choice outcome');
		}

		let updated = game;
		playerIDs.forEach(id => {
			updated = GameLogic.placeModifier(updated, ownerID, modifierID, id);
			if (action === 'kill') {
				updated = PhaseLogic.setPlayerState(updated, id, PlayerState.DeadWithGhostVote);
				updated = PhaseLogic.setCauseOfDeath(updated, id, `Killed by the ${wake.title}`);
			} else if (action === 'revive') {
				updated = PhaseLogic.setPlayerState(updated, id, PlayerState.Alive);
			}
		});
		return updated;
	};
}
