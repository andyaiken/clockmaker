import type { Character } from '../../models/character';
import { Factory } from '../../logic/factory';
import { RoleType } from '../../enums/role-type';

export const Fabled: Character[] = [
	Factory.createCharacter({
		id: 'angel',
		name: 'Angel',
		role: RoleType.Fabled,
		ability: 'Something bad might happen to whoever is most responsible for the death of a new player.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'angel_protect',
				label: 'Protect',
				type: 'assigned',
				text: 'A new player the Angel protects.',
				max: null
			}),
			Factory.createPlayerModifier({
				id: 'angel_something_bad',
				label: 'Something bad',
				type: 'assigned',
				text: 'Most responsible for the death of a new player.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'buddhist',
		name: 'Buddhist',
		role: RoleType.Fabled,
		ability: 'For the first two minutes of each day, experienced players may not talk.'
	}),
	Factory.createCharacter({
		id: 'djinn',
		name: 'Djinn',
		role: RoleType.Fabled,
		ability: 'Use the Djinn’s special rule. Everyone knows what it is.'
	}),
	Factory.createCharacter({
		id: 'doomsayer',
		name: 'Doomsayer',
		role: RoleType.Fabled,
		ability: 'If four or more players are alive, each living player may publicly choose (once per game) that a player of their own alignment dies.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'doomsayer_used',
				label: 'Used',
				type: 'assigned',
				text: 'Has used their Doomsayer choice.',
				max: null
			})
		]
	}),
	Factory.createCharacter({
		id: 'duchess',
		name: 'Duchess',
		role: RoleType.Fabled,
		ability: 'Each day, three players may choose to visit you. At night*, each visitor learns how many visitors are evil, but one of them gets false information.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'duchess_visitor',
				label: 'Visitor',
				type: 'assigned',
				text: 'Visited the Duchess today.',
				max: 3,
				effects: [
					Factory.createEffectIsWoken({
						id: 'duchess_visitor_woken',
						nights: 'other',
						show: [
							Factory.createShowPlayerNumber({
								id: 'duchess_visitor_woken_number',
								text: 'Visitors who are evil',
								note: 'How many visitors are evil; the visitor with the False info token gets a false number'
							})
						]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'duchess_false_info',
				label: 'False info',
				type: 'assigned',
				text: 'The visitor who gets false information.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'ferryman',
		name: 'Ferryman',
		role: RoleType.Fabled,
		ability: 'On the final day, every dead player gets their vote token back.'
	}),
	Factory.createCharacter({
		id: 'fibbin',
		name: 'Fibbin',
		role: RoleType.Fabled,
		ability: 'Once per game, one good player might get incorrect information.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'fibbin_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Fibbin has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'fiddler',
		name: 'Fiddler',
		role: RoleType.Fabled,
		ability: 'Once per game, the Demon secretly chooses a player of the opposite alignment: everyone chooses which of those two players wins.'
	}),
	Factory.createCharacter({
		id: 'hellslibrarian',
		name: 'Hell’s Librarian',
		role: RoleType.Fabled,
		ability: 'Something bad might happen to whoever talks when the Storyteller has asked for silence.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'hells_librarian_something_bad',
				label: 'Something bad',
				type: 'assigned',
				text: 'Talked when the Storyteller asked for silence.',
				max: null
			})
		]
	}),
	Factory.createCharacter({
		id: 'revolutionary',
		name: 'Revolutionary',
		role: RoleType.Fabled,
		ability: 'Two neighbouring players are known to be the same alignment. Once per game, one of them registers falsely.',
		modifiers: [
			Factory.createSeatingModifier({
				id: 'revolutionary_seating',
				label: '',
				text: 'Two neighbouring players are the same alignment',
				requirements: [
					Factory.createSeatingRequirementNeighboursSameAlignment({ modifierID: 'revolutionary_setup' })
				]
			}),
			Factory.createPlayerModifier({
				id: 'revolutionary_setup',
				label: 'Same alignment',
				type: 'assigned',
				setup: 'yes',
				text: 'Two neighbouring players of the same alignment, announced to everyone.',
				max: 2
			}),
			Factory.createPlayerModifier({
				id: 'revolutionary_used',
				label: 'Used',
				type: 'assigned',
				text: 'The Revolutionary player who has registered falsely.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'sentinel',
		name: 'Sentinel',
		role: RoleType.Fabled,
		ability: 'There might be one more or one fewer Outsider in play.',
		modifiers: [
			Factory.createBagModifier({
				id: 'sentinel_mod',
				label: '',
				text: '+1 or -1 Outsider',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: [ -1, 0, 1 ]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'spiritofivory',
		name: 'Spirit of Ivory',
		role: RoleType.Fabled,
		ability: 'There can never be more than one extra evil player.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'spirit_of_ivory_no_extra_evil',
				label: 'No extra evil',
				type: 'self',
				text: 'There can be no more extra evil players.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'toymaker',
		name: 'Toymaker',
		role: RoleType.Fabled,
		ability: 'The Demon may choose not to attack, and must do so at least once per game. Evil players still get their usual starting information.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'toymaker_final_night_no_attack',
				label: 'Final night: no attack',
				type: 'self',
				text: 'The Demon must choose not to attack tonight.'
			})
		]
	})
];
