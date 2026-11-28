import type { Modifier, PlayerModifier } from '../models/modifier';
import type { AlignmentType } from '../enums/alignment-type';
import type { BagAdjustment } from '../models/bag-adjustment';
import { BagAdjustmentType } from '../enums/bag-adjustment-type';
import { CharacterLogic } from './character-logic';
import type { Effect } from '../models/effect';
import { EffectType } from '../enums/effect-type';
import { ModifierType } from '../enums/modifier-type';
import type { RoleType } from '../enums/role-type';
import type { SeatingRequirement } from '../models/seating-requirement';
import { SeatingRequirementType } from '../enums/seating-requirement-type';

// Plain-English wording for modifiers and their effects
export class DescriptionLogic {
	// eg [ Townsfolk, Outsider ] to 'Townsfolk or Outsider'
	static describeTypes = (types: (AlignmentType | RoleType)[], join: 'or' | 'and' = 'or') => {
		if (types.length === 0) {
			return 'anyone';
		}
		if (types.length === 1) {
			return types[ 0 ];
		}
		return `${types.slice(0, -1).join(', ')} ${join} ${types[ types.length - 1 ]}`;
	};

	// eg [ Townsfolk, Minion ] to 'Townsfolk and Minions'
	static describeRoles = (roles: RoleType[]) => {
		return DescriptionLogic.describeTypes(roles.map(r => CharacterLogic.getPlural(r) as RoleType), 'and');
	};

	static describeCharacter = (characterID: string) => {
		return CharacterLogic.getCharacters().find(c => c.id === characterID)?.name ?? characterID;
	};

	// eg 'the Chef', or 'a Good character not in play (chosen by the Storyteller)' when the Storyteller hasn't picked one yet
	static describeChoice = (characterID: string, restrictions: { types: (AlignmentType | RoleType)[], inPlay: boolean | null }) => {
		if (characterID) {
			return `the ${DescriptionLogic.describeCharacter(characterID)}`;
		}

		const kind = restrictions.types.length > 0 ? `a ${DescriptionLogic.describeTypes(restrictions.types)} character` : 'a character';
		const where = restrictions.inPlay === null ? 'on the script' : restrictions.inPlay ? 'in play' : 'not in play';
		return `${kind} ${where} (chosen by the Storyteller)`;
	};

	// A modifier's name, eg 'Poisoner: Poisoned'; bag and seating modifiers have no label, so their text is used
	static getModifierName = (modifier: Modifier, owner?: string) => {
		const label = modifier.label || modifier.data.text;
		return owner ? `${owner}: ${label}` : label;
	};

	// Whether a player modifier is placed during setup, as a short tag
	static getSetupLabel = (modifier: Modifier): string | null => {
		if (modifier.type !== ModifierType.PlayerModifier) {
			return null;
		}
		switch (modifier.data.setup) {
			case 'yes':
				return 'Setup';
			case 'optional':
				return 'Optional setup';
			default:
				return null;
		}
	};

	// Who a player modifier can go on, how many, whether it's placed in setup, and when it's removed
	static describePlayerModifier = (modifier: PlayerModifier): string[] => {
		const data = modifier.data;
		const restrictions = data.restrictions.filter(r => r !== 'not_self');

		const placement = data.type === 'self'
			? 'On this character\'s own player'
			: `On ${restrictions.length > 0 ? `a ${DescriptionLogic.describeTypes(restrictions)} player` : 'a player'}${data.restrictions.includes('not_self') ? ' other than this character' : ''}`;
		const limit = (data.type === 'self') || (data.max === 1) ? null : data.max === null ? 'On any number of players' : `On up to ${data.max} players`;
		const setup = data.setup === 'yes' ? 'Placed during setup' : data.setup === 'optional' ? 'May be placed during setup' : null;
		const expires = data.expires === 'dawn' ? 'Removed at dawn' : data.expires === 'dusk' ? 'Removed at dusk' : null;

		return [ placement, limit, setup, expires ].filter(line => line !== null);
	};

	// What an effect does to the player it's on
	static describeEffect = (effect: Effect): string => {
		switch (effect.type) {
			case EffectType.BelievesTheyAre:
				return `Believes they are ${DescriptionLogic.describeChoice(effect.data.characterID, effect.data.restrictions)}`;
			case EffectType.CanRegisterAs:
				return `Might register as ${DescriptionLogic.describeTypes(effect.data.registerAs)}${effect.data.onlyToOwner ? ', to this character only' : ''}`;
			case EffectType.HasTheAbilityOf:
				return `Has the ability of ${DescriptionLogic.describeChoice(effect.data.characterID, effect.data.restrictions)}`;
			case EffectType.IsDrunk:
				return 'Drunk: their ability doesn\'t work, and they may be given false information';
			case EffectType.IsPoisoned:
				return 'Poisoned: their ability doesn\'t work, and they may be given false information';
			case EffectType.IsProtected: {
				const from = [ effect.data.fromExecution ? 'execution' : null, effect.data.fromMurder ? 'dying at night' : null ].filter(f => f !== null);
				return from.length > 0 ? `Protected from ${from.join(' and ')}` : 'Protected';
			}
			case EffectType.HasVoteModified:
				return `Vote: ${effect.data.text}`;
			case EffectType.HasWinCondition:
				return `Win condition: ${effect.data.text}`;
			case EffectType.IsWoken: {
				const nights = effect.data.nights === 'first' ? 'the first night' : effect.data.nights === 'other' ? 'each night after the first' : 'every night';
				return `Woken ${nights}, just after this character`;
			}
		}
	};

	// How a bag modifier changes the bag, eg '+2 Outsiders' for the Baron
	static describeAdjustment = (adjustment: BagAdjustment): string => {
		const signed = (n: number) => n > 0 ? `+${n}` : `${n}`;

		switch (adjustment.type) {
			case BagAdjustmentType.ChangeRoleCount: {
				const plural = CharacterLogic.getPlural(adjustment.data.role);
				return adjustment.data.options === null
					? `Any change to the number of ${plural}`
					: `${adjustment.data.options.map(signed).join(' or ')} ${plural}`;
			}
			case BagAdjustmentType.SetRoleCount: {
				const plural = CharacterLogic.getPlural(adjustment.data.role);
				return adjustment.data.count === null ? `Any number of ${plural}` : `Exactly ${adjustment.data.count} ${plural}`;
			}
			case BagAdjustmentType.AddCharacter: {
				const name = DescriptionLogic.describeCharacter(adjustment.data.characterID);
				const copies = adjustment.data.copies;
				if (copies === 'majority') {
					return `The ${name} is in the bag, as more than half the players`;
				}
				if ((copies.length === 1) && (copies[ 0 ] === 1)) {
					return `The ${name} is in the bag`;
				}
				const counts = copies.length === 1 ? `${copies[ 0 ]}` : `${copies.slice(0, -1).join(', ')} or ${copies[ copies.length - 1 ]}`;
				return `The ${name} is in the bag (${counts} copies)`;
			}
			case BagAdjustmentType.ReplaceRole:
				return `Every ${adjustment.data.role} is replaced by the ${DescriptionLogic.describeCharacter(adjustment.data.characterID)}`;
			case BagAdjustmentType.AllowDuplicates:
				return `${DescriptionLogic.describeRoles(adjustment.data.replace)} may be swapped for duplicates of in-play ${DescriptionLogic.describeRoles(adjustment.data.copy)}`;
		}
	};

	// Where players must sit, eg 'Sits next to a Demon player' for the Marionette
	static describeRequirement = (requirement: SeatingRequirement): string => {
		switch (requirement.type) {
			case SeatingRequirementType.Neighbours:
				return `Sits next to a ${DescriptionLogic.describeTypes(requirement.data.types)} player`;
			case SeatingRequirementType.InLine:
				return `Every ${DescriptionLogic.describeTypes(requirement.data.types)} player sits in one unbroken line${requirement.data.ownerInMiddle ? ', with this character not at either end' : ''}`;
			case SeatingRequirementType.NeighboursSameAlignment:
				// Games saved before the marker was added have no data here
				return requirement.data?.modifierID
					? 'The two players marked by its reminder are neighbours of the same alignment'
					: 'Two neighbouring players share an alignment';
		}
	};
}
