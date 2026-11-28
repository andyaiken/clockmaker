import { AlignmentType } from '../../enums/alignment-type';
import type { Character } from '../../models/character';
import { Factory } from '../../logic/factory';
import { RoleType } from '../../enums/role-type';

export const Outsiders: Character[] = [
	Factory.createCharacter({
		id: 'barber',
		name: 'Barber',
		role: RoleType.Outsider,
		ability: 'If you died today or tonight, the Demon may choose two players (not another Demon) to swap characters.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'barber_other_1',
				action: 'If the Barber died today or tonight, wake the Demon: they may choose two players (not another Demon) to swap characters.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'barber_haircuts_tonight',
				label: 'Haircuts tonight',
				type: 'self',
				text: 'The Barber died: the Demon may swap two players\' characters tonight.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'butler',
		name: 'Butler',
		role: RoleType.Outsider,
		ability: 'Each night, choose a player other than yourself: tomorrow, you may only vote if they are voting too.',
		jinxes: [
			Factory.createJinx({
				characterID: 'organgrinder',
				text: 'If the Organ Grinder is causing eyes closed voting, the Butler may raise their hand to vote but their vote is only counted if their master voted too.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'butler_first_1',
				text: 'Choose a player other than yourself',
				outcome: { modifierID: 'butler_master', action: 'place' },
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'butler_other_1',
				text: 'Choose a player other than yourself',
				outcome: { modifierID: 'butler_master', action: 'place' },
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'butler_master',
				label: 'Master',
				type: 'assigned',
				text: 'The Butler\'s master.',
				restrictions: [ 'not_self' ]
			}),
			Factory.createPlayerModifier({
				id: 'butler_vote_restricted',
				label: 'Vote restricted',
				type: 'self',
				text: 'The Butler may only vote if their master is voting too.',
				effects: [
					Factory.createEffectHasVoteModified({
						id: 'butler_vote_restricted_vote',
						text: 'May only vote if their master is voting too.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'damsel',
		name: 'Damsel',
		role: RoleType.Outsider,
		ability: 'All Minions know a Damsel is in play. If a Minion publicly guesses you (once), your team loses.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'damsel_guess_used',
				label: 'Guess used',
				type: 'self',
				text: 'A Minion has guessed the Damsel.'
			}),
			Factory.createPlayerModifier({
				id: 'damsel_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If a Minion publicly guesses the Damsel, their team loses.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'damsel_win_condition_win',
						text: 'If a Minion publicly guesses the Damsel, their team loses.'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'damsel_minion',
				label: 'Knows the Damsel',
				type: 'assigned',
				setup: 'yes',
				text: 'A Minion: knows that a Damsel is in play.',
				max: null,
				restrictions: [ RoleType.Minion ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'damsel_minion_woken',
						nights: 'first',
						show: [
							Factory.createShowPlayerCharacter({
								id: 'damsel_minion_woken_character',
								text: 'This character is in play',
								note: 'The Damsel'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'drunk',
		name: 'Drunk',
		role: RoleType.Outsider,
		ability: 'You do not know you are the Drunk. You think you are a Townsfolk, but you are not.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'drunk_setup',
				label: 'Is the Drunk',
				type: 'self',
				setup: 'yes',
				text: 'Choose a Townsfolk that is not in play: the Drunk believes they are this character.',
				effects: [
					Factory.createEffectBelievesTheyAre({
						id: 'drunk_believes',
						types: [ RoleType.Townsfolk ],
						inPlay: false
					}),
					Factory.createEffectIsDrunk({
						id: 'drunk_is_drunk'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'golem',
		name: 'Golem',
		role: RoleType.Outsider,
		ability: 'You may only nominate once per game. When you do, if the nominee is not the Demon, they die.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'golem_may_not_nominate',
				label: 'May not nominate',
				type: 'self',
				text: 'The Golem has nominated.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'goon',
		name: 'Goon',
		role: RoleType.Outsider,
		ability: 'Each night, the first player to choose you with their ability is drunk until dusk. You become their alignment.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'goon_drunk',
				label: 'Drunk',
				type: 'assigned',
				text: 'The first player to choose the Goon tonight: drunk until dusk.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectIsDrunk({
						id: 'goon_drunk_drunk'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'hatter',
		name: 'Hatter',
		role: RoleType.Outsider,
		ability: 'If you died today or tonight, the Minion and Demon players may choose new Minion and Demon characters to be.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'hatter_other_1',
				action: 'If the Hatter died today or tonight, wake the Minions and Demon: each may choose a new Minion or Demon character.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'hatter_tea_party_tonight',
				label: 'Tea party tonight',
				type: 'self',
				text: 'The Hatter died: the Minions and Demon may choose new characters tonight.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'heretic',
		name: 'Heretic',
		role: RoleType.Outsider,
		ability: 'Whoever wins, loses, and whoever loses, wins, even if you are dead.',
		jinxes: [
			Factory.createJinx({
				characterID: 'baron',
				text: 'Only 1 jinxed character can be in play.'
			}),
			Factory.createJinx({
				characterID: 'godfather',
				text: 'Only 1 jinxed character can be in play.'
			}),
			Factory.createJinx({
				characterID: 'lleech',
				text: 'Only 1 jinxed character can be in play.'
			}),
			Factory.createJinx({
				characterID: 'pithag',
				text: 'Only 1 jinxed character can be in play.'
			}),
			Factory.createJinx({
				characterID: 'spy',
				text: 'Only 1 jinxed character can be in play.'
			}),
			Factory.createJinx({
				characterID: 'widow',
				text: 'Only 1 jinxed character can be in play.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'heretic_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'Whoever wins, loses, and whoever loses, wins, even if the Heretic is dead.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'heretic_win_condition_win',
						text: 'Whoever wins, loses, and whoever loses, wins, even if the Heretic is dead.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'hermit',
		name: 'Hermit',
		role: RoleType.Outsider,
		ability: 'You have every Outsider ability that is in play.',
		modifiers: [
			Factory.createBagModifier({
				id: 'hermit_mod',
				label: '',
				text: '-0 or -1 Outsider',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: [ -1, 0 ]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'klutz',
		name: 'Klutz',
		role: RoleType.Outsider,
		ability: 'When you learn that you died, publicly choose a living player: if they are evil, your team loses.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'klutz_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'When the Klutz learns they died, they choose a living player: if evil, their team loses.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'klutz_win_condition_win',
						text: 'When the Klutz learns they died, they choose a living player: if evil, their team loses.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'lunatic',
		name: 'Lunatic',
		role: RoleType.Outsider,
		ability: 'You think you are a Demon, but you are not. The Demon knows who you are and whom you choose at night.',
		wakesFirstNight: [
			Factory.createShowPlayerYouAre({
				id: 'lunatic_first_1',
				text: 'You are',
				note: 'Show a Demon token',
				includeAlignment: false
			}),
			Factory.createShowPlayerMinionsAre({
				id: 'lunatic_first_2',
				text: 'These are your Minions',
				note: 'Fake Minions'
			}),
			Factory.createShowPlayerBluffsAre({
				id: 'lunatic_first_3',
				text: 'These characters are not in play',
				note: 'Bluffs'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'lunatic_other_1',
				text: 'Choose a player',
				outcome: { modifierID: 'lunatic_chosen', action: 'place' },
				note: 'As if they were the Demon',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'lunatic_setup',
				label: 'Is the Lunatic',
				type: 'self',
				setup: 'yes',
				text: 'Choose a Demon: the Lunatic believes they are this character.',
				effects: [
					Factory.createEffectBelievesTheyAre({
						id: 'lunatic_believes',
						types: [ RoleType.Demon ],
						inPlay: null
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'lunatic_chosen',
				label: 'Chosen',
				type: 'assigned',
				expires: 'dawn',
				text: 'Chosen by the Lunatic tonight.',
				max: 3
			}),
			Factory.createPlayerModifier({
				id: 'lunatic_demon',
				label: 'Demon',
				type: 'assigned',
				setup: 'yes',
				text: 'The real Demon: learns who the Lunatic is, and whom they choose at night.',
				restrictions: [ RoleType.Demon ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'lunatic_demon_woken',
						nights: 'all',
						show: [
							Factory.createShowPlayerPlayer({
								id: 'lunatic_demon_woken_player_1',
								text: 'This player is the Lunatic',
								note: 'The Lunatic'
							}),
							Factory.createShowPlayerPlayer({
								id: 'lunatic_demon_woken_player_2',
								text: 'The Lunatic chose',
								note: 'The players the Lunatic chose tonight'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'moonchild',
		name: 'Moonchild',
		role: RoleType.Outsider,
		ability: 'When you learn that you died, publicly choose a living player. Tonight, if they are good, they die.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'moonchild_other_1',
				action: 'If the Moonchild chose a good player today, that player dies.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'moonchild_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Moonchild.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'mutant',
		name: 'Mutant',
		role: RoleType.Outsider,
		ability: 'If you are “mad” about being an Outsider, you might be executed.'
	}),
	Factory.createCharacter({
		id: 'ogre',
		name: 'Ogre',
		role: RoleType.Outsider,
		ability: 'On your first night, choose a player other than yourself: you become their alignment without knowing which, even if drunk or poisoned.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'ogre_first_1',
				text: 'Choose a player other than yourself',
				outcome: { modifierID: 'ogre_friend', action: 'place' },
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'ogre_friend',
				label: 'Friend',
				type: 'assigned',
				text: 'The player the Ogre chose: the Ogre has their alignment.',
				restrictions: [ 'not_self' ]
			})
		]
	}),
	Factory.createCharacter({
		id: 'plaguedoctor',
		name: 'Plague Doctor',
		role: RoleType.Outsider,
		ability: 'When you die, the Storyteller gains a Minion ability.',
		jinxes: [
			Factory.createJinx({
				characterID: 'baron',
				text: 'If the Storyteller would gain the Baron ability, up to two players become Outsiders.'
			}),
			Factory.createJinx({
				characterID: 'boomdandy',
				text: 'If the Storyteller would gain the Boomdandy ability, a player becomes the Boomdandy.'
			}),
			Factory.createJinx({
				characterID: 'eviltwin',
				text: 'If the Storyteller would gain the Evil Twin ability, a player becomes the Evil Twin.'
			}),
			Factory.createJinx({
				characterID: 'fearmonger',
				text: 'If the Storyteller would gain the Fearmonger ability, a Minion gains it, and learns this.'
			}),
			Factory.createJinx({
				characterID: 'goblin',
				text: 'If the Storyteller would gain the Goblin ability, a Minion gains it, and learns this.'
			}),
			Factory.createJinx({
				characterID: 'marionette',
				text: 'If the Storyteller would gain the Marionette ability, one of the Demon\'s good neighbors becomes the Marionette.'
			}),
			Factory.createJinx({
				characterID: 'scarletwoman',
				text: 'If the Storyteller would gain the Scarlet Woman ability, a Minion gains it, and learns this.'
			}),
			Factory.createJinx({
				characterID: 'spy',
				text: 'If the Storyteller would gain the Spy ability, a Minion gains it, and learns this.'
			}),
			Factory.createJinx({
				characterID: 'wraith',
				text: 'If the Storyteller would gain the Wraith ability, a Minion gains it, and learns this.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'plague_doctor_storyteller_ability',
				label: 'Storyteller ability',
				type: 'self',
				text: 'The Plague Doctor died: the Storyteller has a Minion ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'politician',
		name: 'Politician',
		role: RoleType.Outsider,
		ability: 'If you were the player most responsible for your team losing, you change alignment and win, even if dead.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'politician_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If the Politician was most responsible for their team losing, they change alignment and win, even if dead.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'politician_win_condition_win',
						text: 'If the Politician was most responsible for their team losing, they change alignment and win, even if dead.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'puzzlemaster',
		name: 'Puzzlemaster',
		role: RoleType.Outsider,
		ability: 'One player is drunk, even if you die. If you guess (once) who it is, you learn the Demon player; guess wrong and you get false information.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'puzzlemaster_setup',
				label: 'Drunk',
				type: 'assigned',
				setup: 'yes',
				text: 'Choose a player: they are drunk, even if the Puzzlemaster dies.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectIsDrunk({
						id: 'puzzlemaster_drunk'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'puzzlemaster_guess_used',
				label: 'Guess used',
				type: 'self',
				text: 'The Puzzlemaster has guessed.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'recluse',
		name: 'Recluse',
		role: RoleType.Outsider,
		ability: 'You might register as evil, and as a Minion or Demon, even if dead.',
		jinxes: [
			Factory.createJinx({
				characterID: 'ogre',
				text: 'If the Recluse registers as evil to the Ogre, the Ogre learns that they are evil.'
			}),
			Factory.createJinx({
				characterID: 'sage',
				text: 'The Recluse might register as the Demon to the Sage.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'recluse_misregisters',
				label: 'Misregisters',
				type: 'self',
				text: 'The Recluse might register as evil, and as a Minion or Demon, even if dead.',
				effects: [
					Factory.createEffectCanRegisterAs({
						id: 'recluse_misregisters_registers',
						registerAs: [ AlignmentType.Evil, RoleType.Minion, RoleType.Demon ],
						onlyToOwner: false
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'saint',
		name: 'Saint',
		role: RoleType.Outsider,
		ability: 'If you are executed, your team loses.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'saint_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If the Saint is executed, their team loses.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'saint_win_condition_win',
						text: 'If the Saint is executed, their team loses.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'snitch',
		name: 'Snitch',
		role: RoleType.Outsider,
		ability: 'Each Minion gets three bluffs.',
		wakesFirstNight: [
			// Shown to each Minion, not the Snitch
			Factory.createShowPlayerBluffsAre({
				id: 'snitch_first_1',
				text: 'These characters are not in play',
				note: 'Three bluffs for this Minion'
			})
		]
	}),
	Factory.createCharacter({
		id: 'sweetheart',
		name: 'Sweetheart',
		role: RoleType.Outsider,
		ability: 'When you die, one player is drunk from then on.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'sweetheart_other_1',
				action: 'If the Sweetheart died today or tonight, choose a player: they are drunk from now on.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'sweetheart_drunk',
				label: 'Drunk',
				type: 'assigned',
				text: 'Drunk because the Sweetheart died.',
				effects: [
					Factory.createEffectIsDrunk({
						id: 'sweetheart_drunk_drunk'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'tinker',
		name: 'Tinker',
		role: RoleType.Outsider,
		ability: 'You might die at any time.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'tinker_other_1',
				action: 'The Tinker might die.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'tinker_dead',
				label: 'Dead',
				type: 'self',
				text: 'The Tinker died.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'zealot',
		name: 'Zealot',
		role: RoleType.Outsider,
		ability: 'If five or more players are alive, you must vote on every nomination.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'zealot_must_vote',
				label: 'Must vote',
				type: 'self',
				text: 'If five or more players are alive, the Zealot must vote on every nomination.',
				effects: [
					Factory.createEffectHasVoteModified({
						id: 'zealot_must_vote_vote',
						text: 'If five or more players are alive, must vote on every nomination.'
					})
				]
			})
		]
	})
];
