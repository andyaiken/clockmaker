import type { AnswerRule, ShowPlayer, ShowPlayerAlignment, ShowPlayerBluffsAre, ShowPlayerCharacter, ShowPlayerChooseCharacters, ShowPlayerChoosePlayers, ShowPlayerChooseYesNo, ShowPlayerDemonIs, ShowPlayerGrimoire, ShowPlayerMinionsAre, ShowPlayerNumber, ShowPlayerPlayer, ShowPlayerPrompt, ShowPlayerRole, ShowPlayerStorytellerAction, ShowPlayerYesNo, ShowPlayerYouAre } from '../models/show-player';
import type { BagAdjustment, BagAdjustmentAddCharacter, BagAdjustmentAllowDuplicates, BagAdjustmentChangeRoleCount, BagAdjustmentReplaceRole, BagAdjustmentSetRoleCount } from '../models/bag-adjustment';
import type { BagModifier, Modifier, PlayerModifier, SeatingModifier } from '../models/modifier';
import type { Character, Jinx } from '../models/character';
import type { Day, Nomination } from '../models/day';
import type { Effect, EffectBelievesTheyAre, EffectCanRegisterAs, EffectHasTheAbilityOf, EffectHasVoteModified, EffectHasWinCondition, EffectIsDrunk, EffectIsPoisoned, EffectIsProtected, EffectIsWoken } from '../models/effect';
import type { Night, NightStepRecord } from '../models/night';
import type { SeatingRequirement, SeatingRequirementInLine, SeatingRequirementNeighbours, SeatingRequirementNeighboursSameAlignment } from '../models/seating-requirement';
import { AlignmentType } from '../enums/alignment-type';
import { BagAdjustmentType } from '../enums/bag-adjustment-type';
import { EffectType } from '../enums/effect-type';
import type { Game } from '../models/game';
import type { LogEntry } from '../models/log-entry';
import { ModifierType } from '../enums/modifier-type';
import type { Phase } from '../models/phase';
import { PhaseType } from '../enums/phase-type';
import type { Player } from '../models/player';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';
import type { Script } from '../models/script';
import { ScriptType } from '../enums/script-type';
import { SeatingRequirementType } from '../enums/seating-requirement-type';
import { ShowPlayerType } from '../enums/show-player-type';
import { Utility } from '../utils/utility';

export class Factory {
	static createScript = (data: { id: string, name: string, type?: ScriptType, isHomebrew?: boolean, author?: string, almanac?: string, characterIDs?: string[] }): Script => {
		return {
			id: data.id,
			name: data.name,
			type: data.type || ScriptType.RavenswoodBluff,
			isHomebrew: data.isHomebrew ?? false,
			author: data.author || '',
			almanac: data.almanac || '',
			characterIDs: data.characterIDs || []
		};
	};

	static createCharacter = (data: { id: string, name: string, role?: RoleType, quote?: string, ability?: string, wakesFirstNight?: ShowPlayer[], wakesOtherNights?: ShowPlayer[], modifiers?: Modifier[], jinxes?: Jinx[] }): Character => {
		return {
			id: data.id,
			name: data.name,
			role: data.role || RoleType.Townsfolk,
			quote: data.quote || '',
			ability: data.ability || '',
			wakesFirstNight: data.wakesFirstNight || [],
			wakesOtherNights: data.wakesOtherNights || [],
			modifiers: data.modifiers || [],
			jinxes: data.jinxes || []
		};
	};

	static createJinx = (data: { characterID: string, text: string }): Jinx => {
		return {
			characterID: data.characterID,
			text: data.text
		};
	};

	static createBagModifier = (data: { id: string, label: string, text: string, adjustments?: BagAdjustment[] }): BagModifier => {
		return {
			type: ModifierType.BagModifier,
			id: data.id,
			label: data.label,
			data: {
				text: data.text,
				adjustments: data.adjustments || []
			}
		};
	};

	static createBagAdjustmentChangeRoleCount = (data: { role: RoleType, options?: number[] | null }): BagAdjustmentChangeRoleCount => {
		return {
			type: BagAdjustmentType.ChangeRoleCount,
			data: {
				role: data.role,
				options: data.options ?? null
			}
		};
	};

	static createBagAdjustmentSetRoleCount = (data: { role: RoleType, count?: number | null }): BagAdjustmentSetRoleCount => {
		return {
			type: BagAdjustmentType.SetRoleCount,
			data: {
				role: data.role,
				count: data.count ?? null
			}
		};
	};

	static createBagAdjustmentAddCharacter = (data: { characterID: string, copies?: number[] | 'majority' }): BagAdjustmentAddCharacter => {
		return {
			type: BagAdjustmentType.AddCharacter,
			data: {
				characterID: data.characterID,
				copies: data.copies || [ 1 ]
			}
		};
	};

	static createBagAdjustmentReplaceRole = (data: { role: RoleType, characterID: string }): BagAdjustmentReplaceRole => {
		return {
			type: BagAdjustmentType.ReplaceRole,
			data: {
				role: data.role,
				characterID: data.characterID
			}
		};
	};

	static createBagAdjustmentAllowDuplicates = (data: { replace: RoleType[], copy: RoleType[] }): BagAdjustmentAllowDuplicates => {
		return {
			type: BagAdjustmentType.AllowDuplicates,
			data: {
				replace: data.replace,
				copy: data.copy
			}
		};
	};

	static createSeatingModifier = (data: { id: string, label: string, text: string, requirements?: SeatingRequirement[] }): SeatingModifier => {
		return {
			type: ModifierType.SeatingModifier,
			id: data.id,
			label: data.label,
			data: {
				text: data.text,
				requirements: data.requirements || []
			}
		};
	};

	static createSeatingRequirementNeighbours = (data: { types: (AlignmentType | RoleType)[] }): SeatingRequirementNeighbours => {
		return {
			type: SeatingRequirementType.Neighbours,
			data: {
				types: data.types
			}
		};
	};

	static createSeatingRequirementInLine = (data: { types: (AlignmentType | RoleType)[], ownerInMiddle?: boolean }): SeatingRequirementInLine => {
		return {
			type: SeatingRequirementType.InLine,
			data: {
				types: data.types,
				ownerInMiddle: data.ownerInMiddle ?? false
			}
		};
	};

	static createSeatingRequirementNeighboursSameAlignment = (data?: { modifierID?: string }): SeatingRequirementNeighboursSameAlignment => {
		return {
			type: SeatingRequirementType.NeighboursSameAlignment,
			data: {
				modifierID: data?.modifierID ?? null
			}
		};
	};

	static createPlayerModifier = (data: { id: string, label: string, type: 'self' | 'assigned', setup?: 'yes' | 'no' | 'optional', expires?: 'never' | 'dawn' | 'dusk', text: string, max?: number | null, restrictions?: (RoleType | AlignmentType | 'not_self')[], effects?: Effect[] }): PlayerModifier => {
		return {
			type: ModifierType.PlayerModifier,
			id: data.id,
			label: data.label,
			data: {
				type: data.type,
				setup: data.setup || 'no',
				expires: data.expires || 'never',
				text: data.text,
				max: data.max === undefined ? 1 : data.max,
				restrictions: data.restrictions || [],
				effects: data.effects || [],
				playerIDs: []
			}
		};
	};

	static createEffectBelievesTheyAre = (data: { id: string, types?: (AlignmentType | RoleType)[], inPlay?: boolean | null }): EffectBelievesTheyAre => {
		return {
			id: data.id,
			type: EffectType.BelievesTheyAre,
			data: {
				restrictions: {
					types: data.types || [],
					inPlay: data.inPlay ?? null
				},
				characterID: ''
			}
		};
	};

	static createEffectCanRegisterAs = (data: { id: string, registerAs?: (AlignmentType | RoleType)[], onlyToOwner?: boolean }): EffectCanRegisterAs => {
		return {
			id: data.id,
			type: EffectType.CanRegisterAs,
			data: {
				registerAs: data.registerAs || [],
				onlyToOwner: data.onlyToOwner ?? false
			}
		};
	};

	static createEffectHasTheAbilityOf = (data: { id: string, types?: (AlignmentType | RoleType)[], inPlay?: boolean | null }): EffectHasTheAbilityOf => {
		return {
			id: data.id,
			type: EffectType.HasTheAbilityOf,
			data: {
				characterID: '',
				restrictions: {
					types: data.types || [],
					inPlay: data.inPlay ?? null
				}
			}
		};
	};

	static createEffectIsDrunk = (data: { id: string }): EffectIsDrunk => {
		return {
			id: data.id,
			type: EffectType.IsDrunk,
			data: null
		};
	};

	static createEffectIsPoisoned = (data: { id: string }): EffectIsPoisoned => {
		return {
			id: data.id,
			type: EffectType.IsPoisoned,
			data: null
		};
	};

	static createEffectIsProtected = (data: { id: string, fromExecution?: boolean, fromMurder?: boolean }): EffectIsProtected => {
		return {
			id: data.id,
			type: EffectType.IsProtected,
			data: {
				fromExecution: data.fromExecution ?? false,
				fromMurder: data.fromMurder ?? false
			}
		};
	};

	static createEffectHasVoteModified = (data: { id: string, text: string }): EffectHasVoteModified => {
		return {
			id: data.id,
			type: EffectType.HasVoteModified,
			data: {
				text: data.text
			}
		};
	};

	static createEffectHasWinCondition = (data: { id: string, text: string }): EffectHasWinCondition => {
		return {
			id: data.id,
			type: EffectType.HasWinCondition,
			data: {
				text: data.text
			}
		};
	};

	static createEffectIsWoken = (data: { id: string, nights: 'first' | 'other' | 'all', show?: ShowPlayer[] }): EffectIsWoken => {
		return {
			id: data.id,
			type: EffectType.IsWoken,
			data: {
				nights: data.nights,
				show: data.show || []
			}
		};
	};

	static createShowPlayerPrompt = (data: { id: string, text: string, note?: string }): ShowPlayerPrompt => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.Prompt,
			data: null
		};
	};

	static createShowPlayerYouAre = (data: { id: string, text?: string, note?: string, includeAlignment?: boolean }): ShowPlayerYouAre => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.YouAre,
			data: {
				includeAlignment: data.includeAlignment ?? false
			}
		};
	};

	static createShowPlayerCharacter = (data: { id: string, text?: string, note?: string, fromReminder?: string, answer?: AnswerRule }): ShowPlayerCharacter => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.Character,
			data: {
				fromReminder: data.fromReminder ?? null,
				answer: data.answer ?? null
			}
		};
	};

	static createShowPlayerPlayer = (data: { id: string, text?: string, note?: string, fromReminders?: string[], index?: number }): ShowPlayerPlayer => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.Player,
			data: {
				fromReminders: data.fromReminders ?? [],
				index: data.index ?? 0
			}
		};
	};

	static createShowPlayerRole = (data: { id: string, text?: string, note?: string }): ShowPlayerRole => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.Role,
			data: null
		};
	};

	static createShowPlayerAlignment = (data: { id: string, text?: string, note?: string }): ShowPlayerAlignment => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.Alignment,
			data: null
		};
	};

	static createShowPlayerGrimoire = (data: { id: string, text?: string, note?: string }): ShowPlayerGrimoire => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.Grimoire,
			data: null
		};
	};

	static createShowPlayerYesNo = (data: { id: string, text?: string, note?: string, answer?: AnswerRule }): ShowPlayerYesNo => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.YesNo,
			data: data.answer ? { answer: data.answer } : null
		};
	};

	static createShowPlayerNumber = (data: { id: string, text?: string, note?: string, answer?: AnswerRule }): ShowPlayerNumber => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.Number,
			data: data.answer ? { answer: data.answer } : null
		};
	};

	static createShowPlayerDemonIs = (data: { id: string, text?: string, note?: string }): ShowPlayerDemonIs => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.DemonIs,
			data: null
		};
	};

	static createShowPlayerMinionsAre = (data: { id: string, text?: string, note?: string }): ShowPlayerMinionsAre => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.MinionsAre,
			data: null
		};
	};

	static createShowPlayerBluffsAre = (data: { id: string, text?: string, note?: string }): ShowPlayerBluffsAre => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.BluffsAre,
			data: null
		};
	};

	static createShowPlayerChoosePlayers = (data: { id: string, text?: string, note?: string, min?: number, max?: number, restrictions?: ('not_self' | 'alive' | 'dead')[], outcome?: { modifierID: string, action: 'place' | 'kill' | 'revive' } }): ShowPlayerChoosePlayers => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.ChoosePlayers,
			data: {
				min: data.min ?? 1,
				max: data.max ?? 1,
				restrictions: data.restrictions || [],
				outcome: data.outcome ?? null
			}
		};
	};

	static createShowPlayerChooseCharacters = (data: { id: string, text?: string, note?: string, min?: number, max?: number, types?: (AlignmentType | RoleType)[], inPlay?: boolean | null }): ShowPlayerChooseCharacters => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.ChooseCharacters,
			data: {
				min: data.min ?? 1,
				max: data.max ?? 1,
				types: data.types || [],
				inPlay: data.inPlay ?? null
			}
		};
	};

	static createShowPlayerStorytellerAction = (data: { id: string, text?: string, note?: string, action: string }): ShowPlayerStorytellerAction => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.StorytellerAction,
			data: {
				action: data.action
			}
		};
	};

	static createShowPlayerChooseYesNo = (data: { id: string, text: string, note?: string }): ShowPlayerChooseYesNo => {
		return {
			id: data.id,
			text: data.text || '',
			note: data.note || '',
			type: ShowPlayerType.ChooseYesNo,
			data: null
		};
	};

	static createGame = (data: { players: number, script: Script, bag: Character[], bluffs: Character[], otherCharacters?: Character[] }): Game => {
		const players = [];
		for (let n = 0; n < data.players; ++n) {
			const p = Factory.createPlayer({ name: `Seat ${n + 1}` });
			players.push(p);
		}

		return {
			id: Utility.guid(),
			script: Utility.copy(data.script),
			players: players,
			bag: Utility.copy(data.bag),
			bluffs: Utility.copy(data.bluffs),
			otherCharacters: Utility.copy(data.otherCharacters ?? []),
			modifiers: [],
			phase: Factory.createPhase({ type: PhaseType.Setup }),
			history: {
				nights: [],
				days: [],
				log: []
			},
			notes: ''
		};
	};

	static createPlayer = (data: { name: string, alignment?: AlignmentType }): Player => {
		return {
			id: Utility.guid(),
			name: data.name,
			character: null,
			alignment: data.alignment || AlignmentType.Good,
			state: PlayerState.Alive,
			death: null
		};
	};

	static createPhase = (data: { type: PhaseType, number?: number }): Phase => {
		return {
			type: data.type,
			number: data.number ?? 0
		};
	};

	static createNight = (data: { number: number }): Night => {
		return {
			number: data.number,
			steps: []
		};
	};

	static createNightStepRecord = (data: { stepID: string, playerID?: string | null }): NightStepRecord => {
		return {
			stepID: data.stepID,
			playerID: data.playerID ?? null,
			playerIDs: [],
			characterIDs: [],
			number: null,
			yesNo: null,
			alignment: null
		};
	};

	static createDay = (data: { number: number }): Day => {
		return {
			number: data.number,
			nominations: [],
			executedPlayerID: null,
			exiledPlayerIDs: []
		};
	};

	static createNomination = (data: { nominatorID: string, nomineeID: string, isExile?: boolean }): Nomination => {
		return {
			id: Utility.guid(),
			nominatorID: data.nominatorID,
			nomineeID: data.nomineeID,
			voterIDs: [],
			votes: 0,
			isExile: data.isExile ?? false
		};
	};

	static createLogEntry = (data: { phase: Phase, text: string }): LogEntry => {
		return {
			id: Utility.guid(),
			timestamp: Date.now(),
			phase: data.phase,
			text: data.text
		};
	};
}
