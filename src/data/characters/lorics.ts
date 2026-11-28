import { AlignmentType } from '../../enums/alignment-type';
import type { Character } from '../../models/character';
import { Factory } from '../../logic/factory';
import { RoleType } from '../../enums/role-type';

export const Lorics: Character[] = [
	Factory.createCharacter({
		id: 'bigwig',
		name: 'Big Wig',
		role: RoleType.Loric,
		ability: 'Each nominee chooses a player to speak for them, and only that player may speak until the vote. If the speaker is “mad” that an evil nominee is good, or not “mad” enough that a good nominee is good, they might die.'
	}),
	Factory.createCharacter({
		id: 'bootlegger',
		name: 'Bootlegger',
		role: RoleType.Loric,
		ability: 'This script has homebrew characters or rules, which the Storyteller explains at the start.'
	}),
	Factory.createCharacter({
		id: 'gardener',
		name: 'Gardener',
		role: RoleType.Loric,
		ability: 'The Storyteller chooses which player gets which character, rather than leaving it to chance.'
	}),
	Factory.createCharacter({
		id: 'godofug',
		name: 'God of Ug',
		role: RoleType.Loric,
		ability: 'The player wearing the Ug hat may only say one-syllable words, and their vote counts twice. If they slip, the Storyteller gives the hat to someone else.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'god_of_ug_ug_hat',
				label: 'Ug hat',
				type: 'assigned',
				text: 'Wears the Ug hat: may only say one-syllable words, and their vote counts twice.',
				effects: [
					Factory.createEffectHasVoteModified({
						id: 'god_of_ug_ug_hat_vote',
						text: 'Vote counts twice.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'hindu',
		name: 'Hindu',
		role: RoleType.Loric,
		ability: 'The first four players to die come back as Travellers of the same alignment, chosen by the Storyteller. If the Demon is one of the first four to die, good wins.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'hindu_reincarnated',
				label: 'Reincarnated',
				type: 'assigned',
				text: 'One of the first four players to die, back as a Traveller.',
				max: 4
			})
		]
	}),
	Factory.createCharacter({
		id: 'knaves',
		name: 'Knaves',
		role: RoleType.Loric,
		ability: 'There are two Storytellers: one always tells the truth about characters and the other always lies. Players choose which one answers them. Once per game, at dusk, they may swap.'
	}),
	Factory.createCharacter({
		id: 'pope',
		name: 'Pope',
		role: RoleType.Loric,
		ability: 'During setup, Townsfolk may be swapped for duplicates of Townsfolk or Outsiders already in play, more than once. The Demon may be given some of these duplicates as bluffs.',
		modifiers: [
			Factory.createBagModifier({
				id: 'pope_mod',
				label: '',
				text: 'Townsfolk may be duplicates of in-play Townsfolk or Outsiders',
				adjustments: [
					Factory.createBagAdjustmentAllowDuplicates({
						replace: [ RoleType.Townsfolk ],
						copy: [ RoleType.Townsfolk, RoleType.Outsider ]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'stormcatcher',
		name: 'Storm Catcher',
		role: RoleType.Loric,
		ability: 'Name a good character. If it is in play, that player can only die by execution, and evil players learn who it is. If not, evil players learn that it is safe to bluff.',
		wakesFirstNight: [
			Factory.createShowPlayerStorytellerAction({
				id: 'storm_catcher_first_1',
				action: 'Wake each evil player in turn: show the favoured character and point to its player, or show that it is not in play.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'storm_catcher_safe',
				label: 'Safe',
				type: 'assigned',
				text: 'Has the Storm Catcher\'s named character: can only die by execution.',
				restrictions: [ AlignmentType.Good ],
				effects: [
					Factory.createEffectIsProtected({
						id: 'storm_catcher_safe_protected',
						fromExecution: false,
						fromMurder: true
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'tor',
		name: 'Tor',
		role: RoleType.Loric,
		ability: 'Players don’t know their own character or alignment until they die, but their abilities still work and they still wake to use them. Minions and the Demon don’t know each other.'
	}),
	Factory.createCharacter({
		id: 'ventriloquist',
		name: 'Ventriloquist',
		role: RoleType.Loric,
		ability: 'A nominee about to die who is “mad” as a character they haven’t claimed before might survive their execution that day.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'ventriloquist_mad',
				label: 'Mad',
				type: 'assigned',
				text: 'A nominee “mad” as a new character: might survive execution.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'zenomancer',
		name: 'Zenomancer',
		role: RoleType.Loric,
		ability: 'Some players are given secret goals. When a player achieves theirs, they learn something true, even if drunk or poisoned.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'zenomancer_goal',
				label: 'Goal',
				type: 'assigned',
				text: 'Has a secret Zenomancer goal.',
				max: null
			})
		]
	})
];
