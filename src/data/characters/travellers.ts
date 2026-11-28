import { AlignmentType } from '../../enums/alignment-type';
import type { Character } from '../../models/character';
import { Factory } from '../../logic/factory';
import { RoleType } from '../../enums/role-type';

export const Travellers: Character[] = [
	Factory.createCharacter({
		id: 'apprentice',
		name: 'Apprentice',
		role: RoleType.Traveller,
		ability: 'On your first night, you gain a Townsfolk ability if you are good, or a Minion ability if you are evil.',
		wakesFirstNight: [
			Factory.createShowPlayerCharacter({
				id: 'apprentice_first_1',
				text: 'You have the ability of the',
				note: 'The character whose ability the Apprentice gains'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'apprentice_is_the_apprentice',
				label: 'Is the Apprentice',
				type: 'self',
				text: 'The Apprentice has a Townsfolk ability if good, or a Minion ability if evil.',
				effects: [
					Factory.createEffectHasTheAbilityOf({
						id: 'apprentice_is_the_apprentice_ability',
						types: [ RoleType.Townsfolk, RoleType.Minion ],
						inPlay: null
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'barista',
		name: 'Barista',
		role: RoleType.Traveller,
		ability: 'Each night, until dusk, a player either becomes sober, healthy and gets true information, or their ability works twice. They learn which.',
		wakesFirstNight: [
			Factory.createShowPlayerStorytellerAction({
				id: 'barista_first_1',
				action: 'Choose a player and one of the Barista\'s two effects.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'barista_other_1',
				action: 'Choose a player and one of the Barista\'s two effects.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'barista_sober_and_healthy',
				label: 'Sober & healthy',
				type: 'assigned',
				text: 'Sober, healthy and gets true information until dusk.',
				effects: [
					Factory.createEffectIsWoken({
						id: 'barista_sober_and_healthy_woken',
						nights: 'all',
						show: [
							Factory.createShowPlayerPrompt({
								id: 'barista_sober_and_healthy_woken_prompt',
								text: 'Until dusk, you are sober and healthy and get true information.'
							})
						]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'barista_ability_twice',
				label: 'Ability twice',
				type: 'assigned',
				text: 'Their ability works twice until dusk.',
				effects: [
					Factory.createEffectIsWoken({
						id: 'barista_ability_twice_woken',
						nights: 'all',
						show: [
							Factory.createShowPlayerPrompt({
								id: 'barista_ability_twice_woken_prompt',
								text: 'Until dusk, your ability works twice.'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'beggar',
		name: 'Beggar',
		role: RoleType.Traveller,
		ability: 'You need a vote token to vote. Dead players may give you theirs; if they do, you learn their alignment. You are sober and healthy.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'beggar_needs_vote_token',
				label: 'Needs vote token',
				type: 'self',
				text: 'The Beggar needs a vote token from a dead player to vote.',
				effects: [
					Factory.createEffectHasVoteModified({
						id: 'beggar_needs_vote_token_vote',
						text: 'Needs a vote token from a dead player to vote.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'bishop',
		name: 'Bishop',
		role: RoleType.Traveller,
		ability: 'Only the Storyteller can nominate. Each day, at least one player of the opposite alignment must be nominated.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'bishop_nominate_good',
				label: 'Nominate good',
				type: 'assigned',
				text: 'A good player who must be nominated today.',
				restrictions: [ AlignmentType.Good ]
			}),
			Factory.createPlayerModifier({
				id: 'bishop_nominate_evil',
				label: 'Nominate evil',
				type: 'assigned',
				text: 'An evil player who must be nominated today.',
				restrictions: [ AlignmentType.Evil ]
			})
		]
	}),
	Factory.createCharacter({
		id: 'bonecollector',
		name: 'Bone Collector',
		role: RoleType.Traveller,
		ability: 'Once per game, at night*, choose a dead player: they regain their ability until dusk.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'bone_collector_other_1',
				outcome: { modifierID: 'bone_collector_has_ability', action: 'place' },
				text: 'You may choose a dead player',
				note: 'Once per game',
				min: 0,
				max: 1,
				restrictions: [ 'dead' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'bone_collector_has_ability',
				label: 'Has ability',
				type: 'assigned',
				text: 'A dead player who has regained their ability until dusk.'
			}),
			Factory.createPlayerModifier({
				id: 'bone_collector_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Bone Collector has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'bureaucrat',
		name: 'Bureaucrat',
		role: RoleType.Traveller,
		ability: 'Each night, choose a player other than yourself: their vote counts as three votes tomorrow.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'bureaucrat_first_1',
				outcome: { modifierID: 'bureaucrat_3_votes', action: 'place' },
				text: 'Choose a player other than yourself',
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'bureaucrat_other_1',
				outcome: { modifierID: 'bureaucrat_3_votes', action: 'place' },
				text: 'Choose a player other than yourself',
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'bureaucrat_3_votes',
				label: '3 votes',
				type: 'assigned',
				text: 'Their vote counts as three votes tomorrow.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectHasVoteModified({
						id: 'bureaucrat_3_votes_vote',
						text: 'Vote counts as three votes.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'butcher',
		name: 'Butcher',
		role: RoleType.Traveller,
		ability: 'Each day, after the first execution, you may nominate again.'
	}),
	Factory.createCharacter({
		id: 'cacklejack',
		name: 'Cacklejack',
		role: RoleType.Traveller,
		ability: 'Each day, choose a player: a different player changes character tonight.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'cacklejack_other_1',
				action: 'Change the character of a player other than the one the Cacklejack chose; wake them and show their new character.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'cacklejack_chosen',
				label: 'Chosen',
				type: 'assigned',
				text: 'Chosen by the Cacklejack: a different player changes character tonight.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'deviant',
		name: 'Deviant',
		role: RoleType.Traveller,
		ability: 'If you were funny today, you cannot die by exile.'
	}),
	Factory.createCharacter({
		id: 'gangster',
		name: 'Gangster',
		role: RoleType.Traveller,
		ability: 'Once per day, you may choose to kill a living neighbour, if your other living neighbour agrees.'
	}),
	Factory.createCharacter({
		id: 'gunslinger',
		name: 'Gunslinger',
		role: RoleType.Traveller,
		ability: 'Each day, after the first vote has been counted, you may choose a player who voted: they die.'
	}),
	Factory.createCharacter({
		id: 'harlot',
		name: 'Harlot',
		role: RoleType.Traveller,
		ability: 'Each night*, choose a living player: if they agree, you learn their character, but you might both die.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'harlot_other_1',
				text: 'Choose a living player',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			}),
			Factory.createShowPlayerCharacter({
				id: 'harlot_other_2',
				text: 'They are the',
				note: 'That player\'s character, if they agree'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'harlot_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Harlot.',
				max: 2
			})
		]
	}),
	Factory.createCharacter({
		id: 'judge',
		name: 'Judge',
		role: RoleType.Traveller,
		ability: 'Once per game, if another player nominated, you may force the current execution to pass or fail.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'judge_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Judge has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'matron',
		name: 'Matron',
		role: RoleType.Traveller,
		ability: 'Each day, you may swap the seats of up to three pairs of players. Players may not leave their seats to talk privately.'
	}),
	Factory.createCharacter({
		id: 'scapegoat',
		name: 'Scapegoat',
		role: RoleType.Traveller,
		ability: 'If a player of your alignment is executed, you might be executed instead.'
	}),
	Factory.createCharacter({
		id: 'thief',
		name: 'Thief',
		role: RoleType.Traveller,
		ability: 'Each night, choose a player other than yourself: their vote counts negatively tomorrow.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'thief_first_1',
				text: 'Choose a player other than yourself',
				outcome: { modifierID: 'thief_negative_vote', action: 'place' },
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'thief_other_1',
				text: 'Choose a player other than yourself',
				outcome: { modifierID: 'thief_negative_vote', action: 'place' },
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'thief_negative_vote',
				label: 'Negative vote',
				type: 'assigned',
				expires: 'dusk',
				text: 'Their vote counts negatively tomorrow.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectHasVoteModified({
						id: 'thief_negative_vote_vote',
						text: 'Vote counts negatively.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'voudon',
		name: 'Voudon',
		role: RoleType.Traveller,
		ability: 'Only you and the dead can vote, and they don’t need a vote token to do so. A 50% majority is not required.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'voudon_voting',
				label: 'Voting',
				type: 'self',
				text: 'Only the Voudon and the dead can vote; they need no vote token, and no majority is needed.',
				effects: [
					Factory.createEffectHasVoteModified({
						id: 'voudon_voting_vote',
						text: 'Only the Voudon and the dead can vote, without vote tokens; no majority is needed.'
					})
				]
			})
		]
	})
];
