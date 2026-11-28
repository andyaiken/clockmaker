import { AlignmentType } from '../../enums/alignment-type';
import type { Character } from '../../models/character';
import { Factory } from '../../logic/factory';
import { RoleType } from '../../enums/role-type';

export const Townsfolk: Character[] = [
	Factory.createCharacter({
		id: 'acrobat',
		name: 'Acrobat',
		role: RoleType.Townsfolk,
		ability: 'Each night*, choose a player: if they are or become drunk or poisoned tonight, you die.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'acrobat_other_1',
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'acrobat_dead',
				label: 'Dead',
				type: 'self',
				text: 'The Acrobat\'s chosen player was drunk or poisoned, so the Acrobat died.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'alchemist',
		name: 'Alchemist',
		role: RoleType.Townsfolk,
		ability: 'You have the ability of a Minion that is not in play.',
		jinxes: [
			Factory.createJinx({
				characterID: 'boffin',
				text: 'If the Alchemist has the Boffin ability, the Alchemist does not learn what ability the Demon has.'
			}),
			Factory.createJinx({
				characterID: 'marionette',
				text: 'An Alchemist-Marionette has no Marionette ability & the Marionette is in play.'
			}),
			Factory.createJinx({
				characterID: 'mastermind',
				text: 'An Alchemist-Mastermind has no Mastermind ability & the Mastermind is not-in-play.'
			}),
			Factory.createJinx({
				characterID: 'organgrinder',
				text: 'If the Alchemist has the Organ Grinder ability, the Organ Grinder is in play. If both are sober, both are drunk.'
			}),
			Factory.createJinx({
				characterID: 'spy',
				text: 'An Alchemist-Spy has no Spy ability & a Spy is in play. After each execution, a living Alchemist-Spy may publicly guess a living player as the Spy. If correct, the Demon must choose the Spy tonight.'
			}),
			Factory.createJinx({
				characterID: 'summoner',
				text: 'The Alchemist-Summoner does not get bluffs, and chooses which Demon but not which player. If they die before this happens, evil wins. [No Demon]'
			}),
			Factory.createJinx({
				characterID: 'widow',
				text: 'An Alchemist-Widow has no Widow ability & a Widow is in play. After each execution, a living Alchemist-Widow may publicly guess a living player as the Widow. If correct, the Demon must choose the Widow tonight.'
			}),
			Factory.createJinx({
				characterID: 'wraith',
				text: 'An Alchemist-Wraith has no Wraith ability & a Wraith is in play. After each execution, a living Alchemist-Wraith may publicly guess a living player as the Wraith. If correct, the Demon must choose the Wraith tonight.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerCharacter({
				id: 'alchemist_first_1',
				text: 'You have the ability of the',
				note: 'The Minion whose ability the Alchemist has'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'alchemist_setup',
				label: 'Is the Alchemist',
				type: 'self',
				setup: 'yes',
				text: 'Choose a Minion that is not in play: the Alchemist has its ability.',
				effects: [
					Factory.createEffectHasTheAbilityOf({
						id: 'alchemist_ability',
						types: [ RoleType.Minion ],
						inPlay: false
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'alsaahir',
		name: 'Alsaahir',
		role: RoleType.Townsfolk,
		ability: 'Each day, if you publicly guess which players are Minions and which are Demons, good wins.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'alsaahir_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If the Alsaahir publicly guesses which players are Minions and which are Demons, good wins.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'alsaahir_win_condition_win',
						text: 'If the Alsaahir publicly guesses which players are Minions and which are Demons, good wins.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'amnesiac',
		name: 'Amnesiac',
		role: RoleType.Townsfolk,
		ability: 'You do not know what your ability is. Each day, privately guess what it is: you learn how accurate you are.',
		wakesFirstNight: [
			Factory.createShowPlayerStorytellerAction({
				id: 'amnesiac_first_1',
				action: 'If the Amnesiac\'s ability acts at night, wake them and resolve it.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'amnesiac_other_1',
				action: 'If the Amnesiac\'s ability acts at night, wake them and resolve it.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'amnesiac_unknown',
				label: '?',
				type: 'self',
				text: 'The Amnesiac\'s hidden ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'artist',
		name: 'Artist',
		role: RoleType.Townsfolk,
		ability: 'Once per game, during the day, privately ask the Storyteller any yes/no question.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'artist_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Artist has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'atheist',
		name: 'Atheist',
		role: RoleType.Townsfolk,
		ability: 'The Storyteller can break the game rules. If the Storyteller is executed, good wins, even if you are dead.',
		modifiers: [
			Factory.createBagModifier({
				id: 'atheist_mod',
				label: '',
				text: 'No evil characters',
				adjustments: [
					Factory.createBagAdjustmentSetRoleCount({
						role: RoleType.Minion,
						count: 0
					}),
					Factory.createBagAdjustmentSetRoleCount({
						role: RoleType.Demon,
						count: 0
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'atheist_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If the Storyteller is executed, good wins, even if the Atheist is dead.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'atheist_win_condition_win',
						text: 'If the Storyteller is executed, good wins, even if the Atheist is dead.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'balloonist',
		name: 'Balloonist',
		role: RoleType.Townsfolk,
		ability: 'Each night, you learn a player of a different character type than the player you learned last night.',
		wakesFirstNight: [
			Factory.createShowPlayerPlayer({
				id: 'balloonist_first_1',
				text: 'This player'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerPlayer({
				id: 'balloonist_other_1',
				text: 'This player',
				note: 'A different character type from last night'
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'balloonist_mod',
				label: '',
				text: '+0 or +1 Outsider',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: [ 0, 1 ]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'balloonist_seen_townsfolk',
				label: 'Seen Townsfolk',
				type: 'assigned',
				text: 'Shown to the Balloonist as a Townsfolk.'
			}),
			Factory.createPlayerModifier({
				id: 'balloonist_seen_outsider',
				label: 'Seen Outsider',
				type: 'assigned',
				text: 'Shown to the Balloonist as an Outsider.'
			}),
			Factory.createPlayerModifier({
				id: 'balloonist_seen_minion',
				label: 'Seen Minion',
				type: 'assigned',
				text: 'Shown to the Balloonist as a Minion.'
			}),
			Factory.createPlayerModifier({
				id: 'balloonist_seen_demon',
				label: 'Seen Demon',
				type: 'assigned',
				text: 'Shown to the Balloonist as a Demon.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'banshee',
		name: 'Banshee',
		role: RoleType.Townsfolk,
		ability: 'If the Demon kills you, everyone learns this. From then on, you may nominate twice a day and vote twice per nomination.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'banshee_other_1',
				action: 'If the Demon killed the Banshee tonight, announce it at dawn.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'banshee_has_ability',
				label: 'Has ability',
				type: 'self',
				text: 'The Demon killed the Banshee: they may nominate twice a day and vote twice per nomination.',
				effects: [
					Factory.createEffectHasVoteModified({
						id: 'banshee_has_ability_vote',
						text: 'May vote twice per nomination.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'bountyhunter',
		name: 'Bounty Hunter',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing an evil player. If the player you know dies, you learn another evil player tonight.',
		jinxes: [
			Factory.createJinx({
				characterID: 'kazali',
				text: 'If the Kazali turns the Bounty Hunter into a Minion, an evil Townsfolk is not created.'
			}),
			Factory.createJinx({
				characterID: 'philosopher',
				text: 'If the Philosopher gains the Bounty Hunter ability, a Townsfolk might turn evil.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerPlayer({
				id: 'bounty_hunter_first_1',
				fromReminders: [ 'bounty_hunter_known' ],
				text: 'This player is evil',
				note: 'An evil player'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerPlayer({
				id: 'bounty_hunter_other_1',
				text: 'This player is also evil',
				note: 'Another evil player; only if the known player died'
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'bounty_hunter_mod',
				label: '',
				text: '1 Townsfolk is evil'
			}),
			Factory.createPlayerModifier({
				id: 'bounty_hunter_known',
				label: 'Known',
				type: 'assigned',
				setup: 'yes',
				text: 'The evil player the Bounty Hunter knows.',
				restrictions: [ 'not_self', AlignmentType.Evil ]
			}),
			Factory.createPlayerModifier({
				id: 'bounty_hunter_evil_townsfolk',
				label: 'Evil Townsfolk',
				type: 'assigned',
				setup: 'yes',
				text: 'The Townsfolk who is evil: learns they are evil.',
				restrictions: [ RoleType.Townsfolk ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'bounty_hunter_evil_townsfolk_woken',
						nights: 'first',
						show: [
							Factory.createShowPlayerYouAre({
								id: 'bounty_hunter_evil_townsfolk_woken_youare',
								text: 'You are',
								includeAlignment: true
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'cannibal',
		name: 'Cannibal',
		role: RoleType.Townsfolk,
		ability: 'You have the ability of the most recently executed player. If they are evil, you are poisoned until a good player is executed.',
		jinxes: [
			Factory.createJinx({
				characterID: 'butler',
				text: 'If the Cannibal gains the Butler ability, the Cannibal learns this.'
			}),
			Factory.createJinx({
				characterID: 'juggler',
				text: 'If the Juggler guesses on their first day and dies by execution, tonight the living Cannibal learns how many guesses the Juggler got correct.'
			}),
			Factory.createJinx({
				characterID: 'princess',
				text: 'If the Cannibal nominated, executed, & killed the Princess today, the Demon doesn’t kill tonight.'
			}),
			Factory.createJinx({
				characterID: 'zealot',
				text: 'If the Cannibal gains the Zealot ability, the Cannibal learns this.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'cannibal_has_ability',
				label: 'Has ability',
				type: 'self',
				text: 'The Cannibal has the ability of the most recently executed player.',
				effects: [
					Factory.createEffectHasTheAbilityOf({
						id: 'cannibal_has_ability_ability',
						types: [ ],
						inPlay: true
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'cannibal_poisoned',
				label: 'Poisoned',
				type: 'self',
				text: 'The Cannibal ate an evil player: poisoned until a good player is executed.',
				effects: [
					Factory.createEffectIsPoisoned({
						id: 'cannibal_poisoned_poisoned'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'cannibal_died_today',
				label: 'Died today',
				type: 'assigned',
				text: 'The most recently executed player.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'chambermaid',
		name: 'Chambermaid',
		role: RoleType.Townsfolk,
		ability: 'Each night, choose two living players other than yourself: you learn how many of them woke tonight because of their ability.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'chambermaid_first_1',
				text: 'Choose two living players other than yourself',
				min: 2,
				max: 2,
				restrictions: [ 'not_self', 'alive' ]
			}),
			Factory.createShowPlayerNumber({
				id: 'chambermaid_first_2',
				text: 'How many of them woke tonight',
				note: 'How many of them woke tonight because of their ability'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'chambermaid_other_1',
				text: 'Choose two living players other than yourself',
				min: 2,
				max: 2,
				restrictions: [ 'not_self', 'alive' ]
			}),
			Factory.createShowPlayerNumber({
				id: 'chambermaid_other_2',
				text: 'How many of them woke tonight',
				note: 'How many of them woke tonight because of their ability'
			})
		]
	}),
	Factory.createCharacter({
		id: 'chef',
		name: 'Chef',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing how many pairs of evil players are sitting next to each other.',
		wakesFirstNight: [
			Factory.createShowPlayerNumber({
				id: 'chef_first_1',
				text: 'Pairs of evil players sitting next to each other',
				note: 'Pairs of evil players sitting next to each other',
				answer: { type: 'evil_pairs' }
			})
		]
	}),
	Factory.createCharacter({
		id: 'choirboy',
		name: 'Choirboy',
		role: RoleType.Townsfolk,
		ability: 'If the Demon kills the King, you learn which player is the Demon.',
		wakesOtherNights: [
			Factory.createShowPlayerPlayer({
				id: 'choirboy_other_1',
				text: 'The Demon is',
				note: 'The Demon; only if the Demon killed the King tonight'
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'choirboy_mod',
				label: '',
				text: '+the King',
				adjustments: [
					Factory.createBagAdjustmentAddCharacter({
						characterID: 'king',
						copies: [ 1 ]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'clockmaker',
		name: 'Clockmaker',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing how many steps it is from the Demon to its nearest Minion.',
		wakesFirstNight: [
			Factory.createShowPlayerNumber({
				id: 'clockmaker_first_1',
				text: 'Steps from the Demon to its nearest Minion',
				note: 'Steps from the Demon to its nearest Minion',
				answer: { type: 'demon_to_minion' }
			})
		]
	}),
	Factory.createCharacter({
		id: 'courtier',
		name: 'Courtier',
		role: RoleType.Townsfolk,
		ability: 'Once per game, at night, choose a character: they are drunk for three nights and three days.',
		wakesFirstNight: [
			Factory.createShowPlayerChooseCharacters({
				id: 'courtier_first_1',
				text: 'You may choose a character',
				note: 'Once per game',
				min: 0,
				max: 1
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChooseCharacters({
				id: 'courtier_other_1',
				text: 'You may choose a character',
				note: 'Once per game',
				min: 0,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'courtier_drunk',
				label: 'Drunk',
				type: 'assigned',
				text: 'Drunk for three nights and three days.',
				effects: [
					Factory.createEffectIsDrunk({
						id: 'courtier_drunk_drunk'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'courtier_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Courtier has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'cultleader',
		name: 'Cult Leader',
		role: RoleType.Townsfolk,
		ability: 'Each night, you take the alignment of one of your living neighbours. If every good player joins your cult, your team wins.',
		wakesFirstNight: [
			Factory.createShowPlayerAlignment({
				id: 'cult_leader_first_1',
				text: 'You are now',
				note: 'Their new alignment, matching a living neighbour'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerAlignment({
				id: 'cult_leader_other_1',
				text: 'You are now',
				note: 'Their new alignment, matching a living neighbour'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'cult_leader_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If every good player joins the cult, the Cult Leader\'s team wins.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'cult_leader_win_condition_win',
						text: 'If every good player joins the cult, the Cult Leader\'s team wins.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'dreamer',
		name: 'Dreamer',
		role: RoleType.Townsfolk,
		ability: 'Each night, choose a player other than yourself or a Traveller: you learn one good and one evil character, one of which is theirs.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'dreamer_first_1',
				text: 'Choose a player other than yourself',
				note: 'Not a Traveller',
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			}),
			Factory.createShowPlayerCharacter({
				id: 'dreamer_first_2',
				text: 'They are one of these characters',
				note: 'A good character'
			}),
			Factory.createShowPlayerCharacter({
				id: 'dreamer_first_3',
				text: 'or',
				note: 'An evil character'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'dreamer_other_1',
				text: 'Choose a player other than yourself',
				note: 'Not a Traveller',
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			}),
			Factory.createShowPlayerCharacter({
				id: 'dreamer_other_2',
				text: 'They are one of these characters',
				note: 'A good character'
			}),
			Factory.createShowPlayerCharacter({
				id: 'dreamer_other_3',
				text: 'or',
				note: 'An evil character'
			})
		]
	}),
	Factory.createCharacter({
		id: 'empath',
		name: 'Empath',
		role: RoleType.Townsfolk,
		ability: 'Each night, you learn how many of your two nearest living neighbours are evil.',
		wakesFirstNight: [
			Factory.createShowPlayerNumber({
				id: 'empath_first_1',
				text: 'Your living neighbours who are evil',
				note: 'Evil living neighbours',
				answer: { type: 'evil_living_neighbours' }
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerNumber({
				id: 'empath_other_1',
				text: 'Your living neighbours who are evil',
				note: 'Evil living neighbours',
				answer: { type: 'evil_living_neighbours' }
			})
		]
	}),
	Factory.createCharacter({
		id: 'engineer',
		name: 'Engineer',
		role: RoleType.Townsfolk,
		ability: 'Once per game, at night, choose which Minions or which Demon are in play.',
		wakesFirstNight: [
			Factory.createShowPlayerChooseCharacters({
				id: 'engineer_first_1',
				text: 'You may choose new Minion characters, or a new Demon character',
				note: 'Once per game: either the Minions or the Demon',
				min: 0,
				max: 3,
				types: [ RoleType.Minion, RoleType.Demon ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChooseCharacters({
				id: 'engineer_other_1',
				text: 'You may choose new Minion characters, or a new Demon character',
				note: 'Once per game: either the Minions or the Demon',
				min: 0,
				max: 3,
				types: [ RoleType.Minion, RoleType.Demon ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'engineer_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Engineer has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'exorcist',
		name: 'Exorcist',
		role: RoleType.Townsfolk,
		ability: 'Each night*, choose a player (not the one you chose last night): if they are the Demon, they learn who you are and do not wake tonight.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'exorcist_other_1',
				text: 'Choose a player',
				outcome: { modifierID: 'exorcist_chosen', action: 'place' },
				note: 'Not the player chosen last night',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'exorcist_chosen',
				label: 'Chosen',
				type: 'assigned',
				text: 'Chosen by the Exorcist tonight.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'exorcist_chosen_woken',
						nights: 'other',
						show: [
							Factory.createShowPlayerPlayer({
								id: 'exorcist_chosen_woken_player',
								text: 'The Exorcist chose you. They are',
								note: 'The Exorcist; only if they are the Demon, and they do not wake to act tonight'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'farmer',
		name: 'Farmer',
		role: RoleType.Townsfolk,
		ability: 'When you die at night, a living good player becomes a Farmer.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'farmer_other_1',
				action: 'If the Farmer died tonight, wake a living good player and show them the Farmer token.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'fisherman',
		name: 'Fisherman',
		role: RoleType.Townsfolk,
		ability: 'Once per game, during the day, visit the Storyteller for advice that helps your team win.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'fisherman_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Fisherman has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'flowergirl',
		name: 'Flowergirl',
		role: RoleType.Townsfolk,
		ability: 'Each night*, you learn whether a Demon voted today.',
		wakesOtherNights: [
			Factory.createShowPlayerYesNo({
				id: 'flowergirl_other_1',
				text: 'Did a Demon vote today?',
				note: 'Yes if a Demon voted today'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'flowergirl_demon_voted',
				label: 'Demon voted',
				type: 'self',
				text: 'A Demon voted today.'
			}),
			Factory.createPlayerModifier({
				id: 'flowergirl_demon_not_voted',
				label: 'Demon not voted',
				type: 'self',
				text: 'No Demon voted today.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'fool',
		name: 'Fool',
		role: RoleType.Townsfolk,
		ability: 'The first time you die, you don’t.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'fool_cannot_die',
				label: 'Cannot die',
				type: 'self',
				text: 'The first time the Fool dies, they don\'t.',
				effects: [
					Factory.createEffectIsProtected({
						id: 'fool_cannot_die_protected',
						fromExecution: true,
						fromMurder: true
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'fool_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Fool has survived their first death.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'fortuneteller',
		name: 'Fortune Teller',
		role: RoleType.Townsfolk,
		ability: 'Each night, choose two players: you learn whether either is a Demon. One good player always registers to you as a Demon.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'fortune_teller_first_1',
				text: 'Choose two players',
				min: 2,
				max: 2
			}),
			Factory.createShowPlayerYesNo({
				id: 'fortune_teller_first_2',
				text: 'Is one of them the Demon?',
				note: 'Yes if either is the Demon or the red herring',
				answer: { type: 'chosen_include', role: RoleType.Demon }
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'fortune_teller_other_1',
				text: 'Choose two players',
				min: 2,
				max: 2
			}),
			Factory.createShowPlayerYesNo({
				id: 'fortune_teller_other_2',
				text: 'Is one of them the Demon?',
				note: 'Yes if either is the Demon or the red herring',
				answer: { type: 'chosen_include', role: RoleType.Demon }
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'fortune_teller_setup',
				label: 'Red herring',
				type: 'assigned',
				setup: 'yes',
				text: 'Choose a good player: they register as a Demon to the Fortune Teller.',
				restrictions: [ AlignmentType.Good ],
				effects: [
					Factory.createEffectCanRegisterAs({
						id: 'fortune_teller_red_herring',
						registerAs: [ RoleType.Demon ],
						onlyToOwner: true
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'gambler',
		name: 'Gambler',
		role: RoleType.Townsfolk,
		ability: 'Each night*, choose a player and guess their character: if you are wrong, you die.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'gambler_other_1',
				text: 'Choose a player',
				min: 1,
				max: 1
			}),
			Factory.createShowPlayerChooseCharacters({
				id: 'gambler_other_2',
				text: 'Guess their character',
				note: 'Their guess at that player\'s character',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'gambler_dead',
				label: 'Dead',
				type: 'self',
				text: 'The Gambler guessed wrong and died.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'general',
		name: 'General',
		role: RoleType.Townsfolk,
		ability: 'Each night, you learn which alignment the Storyteller thinks is winning: good, evil, or neither.',
		wakesFirstNight: [
			Factory.createShowPlayerAlignment({
				id: 'general_first_1',
				text: 'Winning, according to the Storyteller',
				note: 'Which alignment is winning, or neither'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerAlignment({
				id: 'general_other_1',
				text: 'Winning, according to the Storyteller',
				note: 'Which alignment is winning, or neither'
			})
		]
	}),
	Factory.createCharacter({
		id: 'gossip',
		name: 'Gossip',
		role: RoleType.Townsfolk,
		ability: 'Each day, you may make a public statement. Tonight, if it was true, a player dies.',
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'gossip_other_1',
				action: 'If the Gossip\'s public statement today was true, choose a player: they die.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'gossip_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Gossip.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'grandmother',
		name: 'Grandmother',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing a good player and their character. If the Demon kills them, you die too.',
		wakesFirstNight: [
			Factory.createShowPlayerPlayer({
				id: 'grandmother_first_1',
				fromReminders: [ 'grandmother_grandchild' ],
				text: 'Your grandchild is',
				note: 'The grandchild'
			}),
			Factory.createShowPlayerCharacter({
				id: 'grandmother_first_2',
				fromReminder: 'grandmother_grandchild',
				text: 'They are the',
				note: 'The grandchild\'s character'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'grandmother_other_1',
				action: 'If the Demon killed the grandchild tonight, the Grandmother dies too.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'grandmother_grandchild',
				label: 'Grandchild',
				type: 'assigned',
				setup: 'yes',
				text: 'The Grandmother\'s grandchild: if the Demon kills them, the Grandmother dies too.',
				restrictions: [ 'not_self', AlignmentType.Good ]
			})
		]
	}),
	Factory.createCharacter({
		id: 'highpriestess',
		name: 'High Priestess',
		role: RoleType.Townsfolk,
		ability: 'Each night, you learn which player the Storyteller thinks you should talk to most.',
		wakesFirstNight: [
			Factory.createShowPlayerPlayer({
				id: 'high_priestess_first_1',
				text: 'Talk to this player'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerPlayer({
				id: 'high_priestess_other_1',
				text: 'Talk to this player'
			})
		]
	}),
	Factory.createCharacter({
		id: 'huntsman',
		name: 'Huntsman',
		role: RoleType.Townsfolk,
		ability: 'Once per game, at night, choose a living player: if they are the Damsel, they become a Townsfolk that is not in play.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'huntsman_first_1',
				text: 'You may choose a living player',
				note: 'Once per game',
				min: 0,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'huntsman_other_1',
				text: 'You may choose a living player',
				note: 'Once per game',
				min: 0,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'huntsman_mod',
				label: '',
				text: '+the Damsel',
				adjustments: [
					Factory.createBagAdjustmentAddCharacter({
						characterID: 'damsel',
						copies: [ 1 ]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'huntsman_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Huntsman has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'innkeeper',
		name: 'Innkeeper',
		role: RoleType.Townsfolk,
		ability: 'Each night*, choose two players: they cannot die tonight, but one of them is drunk until dusk.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'innkeeper_other_1',
				text: 'Choose two players',
				outcome: { modifierID: 'innkeeper_protected', action: 'place' },
				min: 2,
				max: 2
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'innkeeper_protected',
				label: 'Protected',
				type: 'assigned',
				expires: 'dawn',
				text: 'Cannot die tonight.',
				max: 2,
				effects: [
					Factory.createEffectIsProtected({
						id: 'innkeeper_protected_protected',
						fromExecution: false,
						fromMurder: true
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'innkeeper_drunk',
				label: 'Drunk',
				type: 'assigned',
				text: 'Drunk until dusk.',
				effects: [
					Factory.createEffectIsDrunk({
						id: 'innkeeper_drunk_drunk'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'investigator',
		name: 'Investigator',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing that one of two players is a particular Minion.',
		wakesFirstNight: [
			Factory.createShowPlayerCharacter({
				id: 'investigator_first_1',
				fromReminder: 'investigator_minion',
				text: 'One of these players is the',
				note: 'The Minion'
			}),
			Factory.createShowPlayerPlayer({
				id: 'investigator_first_2',
				fromReminders: [ 'investigator_minion', 'investigator_wrong' ],
				index: 0,
				text: 'This player',
				note: 'One of the two players'
			}),
			Factory.createShowPlayerPlayer({
				id: 'investigator_first_3',
				fromReminders: [ 'investigator_minion', 'investigator_wrong' ],
				index: 1,
				text: 'or this player',
				note: 'The other player'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'investigator_minion',
				label: 'Minion',
				type: 'assigned',
				setup: 'yes',
				text: 'The Minion shown to the Investigator.',
				restrictions: [ 'not_self', RoleType.Minion ]
			}),
			Factory.createPlayerModifier({
				id: 'investigator_wrong',
				label: 'Wrong',
				type: 'assigned',
				setup: 'yes',
				text: 'The other player shown to the Investigator.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'juggler',
		name: 'Juggler',
		role: RoleType.Townsfolk,
		ability: 'On your first day, publicly guess the characters of up to five players. That night, you learn how many guesses were right.',
		wakesOtherNights: [
			Factory.createShowPlayerNumber({
				id: 'juggler_other_1',
				text: 'Your correct guesses',
				note: 'Correct guesses; only after the Juggler\'s first day'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'juggler_correct',
				label: 'Correct',
				type: 'assigned',
				text: 'A correct Juggler guess.',
				max: 5,
				restrictions: [ 'not_self' ]
			})
		]
	}),
	Factory.createCharacter({
		id: 'king',
		name: 'King',
		role: RoleType.Townsfolk,
		ability: 'Each night, if the dead equal or outnumber the living, you learn a living character. The Demon knows you are the King.',
		wakesOtherNights: [
			Factory.createShowPlayerCharacter({
				id: 'king_other_1',
				text: 'This character is alive',
				note: 'A living character; only if the dead equal or outnumber the living'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'king_demon',
				label: 'Knows the King',
				type: 'assigned',
				setup: 'yes',
				text: 'The Demon: knows who the King is.',
				restrictions: [ RoleType.Demon ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'king_demon_woken',
						nights: 'first',
						show: [
							Factory.createShowPlayerPlayer({
								id: 'king_demon_woken_player',
								text: 'The King is',
								note: 'The King'
							}),
							Factory.createShowPlayerCharacter({
								id: 'king_demon_woken_character',
								text: 'They are the',
								note: 'The King character'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'knight',
		name: 'Knight',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing two players who are not the Demon.',
		wakesFirstNight: [
			Factory.createShowPlayerPlayer({
				id: 'knight_first_1',
				fromReminders: [ 'knight_know' ],
				index: 0,
				text: 'These players are not the Demon',
				note: 'Not the Demon'
			}),
			Factory.createShowPlayerPlayer({
				id: 'knight_first_2',
				fromReminders: [ 'knight_know' ],
				index: 1,
				text: 'and',
				note: 'Not the Demon'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'knight_know',
				label: 'Know',
				type: 'assigned',
				setup: 'yes',
				text: 'A player the Knight knows is not the Demon.',
				max: 2,
				restrictions: [ 'not_self' ]
			})
		]
	}),
	Factory.createCharacter({
		id: 'librarian',
		name: 'Librarian',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing that one of two players is a particular Outsider, or that no Outsiders are in play.',
		wakesFirstNight: [
			Factory.createShowPlayerCharacter({
				id: 'librarian_first_1',
				fromReminder: 'librarian_outsider',
				text: 'One of these players is the',
				note: 'The Outsider, or zero if there are no Outsiders'
			}),
			Factory.createShowPlayerPlayer({
				id: 'librarian_first_2',
				fromReminders: [ 'librarian_outsider', 'librarian_wrong' ],
				index: 0,
				text: 'This player',
				note: 'One of the two players'
			}),
			Factory.createShowPlayerPlayer({
				id: 'librarian_first_3',
				fromReminders: [ 'librarian_outsider', 'librarian_wrong' ],
				index: 1,
				text: 'or this player',
				note: 'The other player'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'librarian_outsider',
				label: 'Outsider',
				type: 'assigned',
				setup: 'optional',
				text: 'The Outsider shown to the Librarian.',
				restrictions: [ 'not_self', RoleType.Outsider ]
			}),
			Factory.createPlayerModifier({
				id: 'librarian_wrong',
				label: 'Wrong',
				type: 'assigned',
				setup: 'optional',
				text: 'The other player shown to the Librarian.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'lycanthrope',
		name: 'Lycanthrope',
		role: RoleType.Townsfolk,
		ability: 'Each night*, choose a living player: if they are good, they die and the Demon does not kill tonight. One good player registers as evil.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'lycanthrope_other_1',
				outcome: { modifierID: 'lycanthrope_dead', action: 'kill' },
				text: 'Choose a living player',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'lycanthrope_setup',
				label: 'Faux paw',
				type: 'assigned',
				setup: 'yes',
				text: 'Choose a good player: they register as evil.',
				restrictions: [ AlignmentType.Good ],
				effects: [
					Factory.createEffectCanRegisterAs({
						id: 'lycanthrope_faux_paw',
						registerAs: [ AlignmentType.Evil ],
						onlyToOwner: false
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'lycanthrope_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Lycanthrope.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'magician',
		name: 'Magician',
		role: RoleType.Townsfolk,
		ability: 'The Demon thinks you are a Minion. Minions think you are a Demon.',
		jinxes: [
			Factory.createJinx({
				characterID: 'legion',
				text: 'If the Magician is in play, during the Demon info step, Legion wake in separate groups. Each group learns which players are good, but does not learn the Magician.'
			}),
			Factory.createJinx({
				characterID: 'marionette',
				text: 'If the Magician is alive, the Demon doesn\'t know which neighbor is the Marionette.'
			}),
			Factory.createJinx({
				characterID: 'spy',
				text: 'When the Spy sees the Grimoire, the Demon and Magician\'s character tokens are removed.'
			}),
			Factory.createJinx({
				characterID: 'vizier',
				text: 'If the Vizier is in play, the Magician has no ability but is immune to the Vizier\'s ability.'
			}),
			Factory.createJinx({
				characterID: 'widow',
				text: 'When the Widow sees the Grimoire, the Demon and Magician\'s character tokens are removed.'
			}),
			Factory.createJinx({
				characterID: 'wraith',
				text: 'After each execution, the living Magician may publicly guess a living player as the Wraith. If correct, the Demon must choose the Wraith tonight.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerStorytellerAction({
				id: 'magician_first_1',
				action: 'During Minion and Demon info, show the Magician as a Minion to the Demon and as a Demon to the Minions.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'mathematician',
		name: 'Mathematician',
		role: RoleType.Townsfolk,
		ability: 'Each night, you learn how many players’ abilities worked abnormally since dawn because of another character’s ability.',
		jinxes: [
			Factory.createJinx({
				characterID: 'chambermaid',
				text: 'The Chambermaid can detect if the Mathematician will wake tonight.'
			}),
			Factory.createJinx({
				characterID: 'drunk',
				text: 'The Mathematician learns if the Drunk’s ability yielded false info or failed to work properly.'
			}),
			Factory.createJinx({
				characterID: 'lunatic',
				text: 'The Mathematician learns if the Lunatic attacks a different player than the real Demon attacked.'
			}),
			Factory.createJinx({
				characterID: 'marionette',
				text: 'The Mathematician learns if the Marionette’s ability yielded false info or failed to work properly.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerNumber({
				id: 'mathematician_first_1',
				text: 'Abilities that worked abnormally since dawn',
				note: 'Abilities that worked abnormally since dawn'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerNumber({
				id: 'mathematician_other_1',
				text: 'Abilities that worked abnormally since dawn',
				note: 'Abilities that worked abnormally since dawn'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'mathematician_abnormal',
				label: 'Abnormal',
				type: 'assigned',
				text: 'This player\'s ability worked abnormally because of another character.',
				max: null
			})
		]
	}),
	Factory.createCharacter({
		id: 'mayor',
		name: 'Mayor',
		role: RoleType.Townsfolk,
		ability: 'If only three players are alive and there is no execution, your team wins. If you die at night, another player might die in your place.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'mayor_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If only three players are alive and there is no execution, the Mayor\'s team wins.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'mayor_win_condition_win',
						text: 'If only three players are alive and there is no execution, the Mayor\'s team wins.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'minstrel',
		name: 'Minstrel',
		role: RoleType.Townsfolk,
		ability: 'When a Minion dies by execution, all other players (except Travellers) are drunk until dusk tomorrow.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'minstrel_everyone_drunk',
				label: 'Everyone drunk',
				type: 'self',
				text: 'A Minion was executed: all other players (except Travellers) are drunk until dusk tomorrow.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'monk',
		name: 'Monk',
		role: RoleType.Townsfolk,
		ability: 'Each night*, choose a player other than yourself: the Demon cannot kill them tonight.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'monk_other_1',
				text: 'Choose a player other than yourself',
				outcome: { modifierID: 'monk_protected', action: 'place' },
				min: 1,
				max: 1,
				restrictions: [ 'not_self' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'monk_protected',
				label: 'Protected',
				type: 'assigned',
				expires: 'dawn',
				text: 'The Demon cannot kill this player tonight.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectIsProtected({
						id: 'monk_protected_protected',
						fromExecution: false,
						fromMurder: true
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'nightwatchman',
		name: 'Nightwatchman',
		role: RoleType.Townsfolk,
		ability: 'Once per game, at night, choose a player: they learn you are the Nightwatchman.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'nightwatchman_first_1',
				text: 'You may choose a player',
				outcome: { modifierID: 'nightwatchman_chosen', action: 'place' },
				note: 'Once per game',
				min: 0,
				max: 1
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'nightwatchman_other_1',
				text: 'You may choose a player',
				outcome: { modifierID: 'nightwatchman_chosen', action: 'place' },
				note: 'Once per game',
				min: 0,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'nightwatchman_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Nightwatchman has used their ability.'
			}),
			Factory.createPlayerModifier({
				id: 'nightwatchman_chosen',
				label: 'Chosen',
				type: 'assigned',
				text: 'Chosen by the Nightwatchman: learns who the Nightwatchman is.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'nightwatchman_chosen_woken',
						nights: 'all',
						show: [
							Factory.createShowPlayerPlayer({
								id: 'nightwatchman_chosen_woken_player',
								text: 'This player chose you',
								note: 'The Nightwatchman'
							}),
							Factory.createShowPlayerCharacter({
								id: 'nightwatchman_chosen_woken_character',
								text: 'They are the',
								note: 'The Nightwatchman character'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'noble',
		name: 'Noble',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing three players, exactly one of whom is evil.',
		wakesFirstNight: [
			Factory.createShowPlayerPlayer({
				id: 'noble_first_1',
				fromReminders: [ 'noble_seen' ],
				index: 0,
				text: 'One of these players is evil'
			}),
			Factory.createShowPlayerPlayer({
				id: 'noble_first_2',
				fromReminders: [ 'noble_seen' ],
				index: 1,
				text: 'and'
			}),
			Factory.createShowPlayerPlayer({
				id: 'noble_first_3',
				fromReminders: [ 'noble_seen' ],
				index: 2,
				text: 'and'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'noble_seen',
				label: 'Seen',
				type: 'assigned',
				setup: 'yes',
				text: 'One of the three players shown to the Noble.',
				max: 3,
				restrictions: [ 'not_self' ]
			})
		]
	}),
	Factory.createCharacter({
		id: 'oracle',
		name: 'Oracle',
		role: RoleType.Townsfolk,
		ability: 'Each night*, you learn how many dead players are evil.',
		wakesOtherNights: [
			Factory.createShowPlayerNumber({
				id: 'oracle_other_1',
				text: 'Dead players who are evil',
				note: 'Dead players who are evil',
				answer: { type: 'dead_evil' }
			})
		]
	}),
	Factory.createCharacter({
		id: 'pacifist',
		name: 'Pacifist',
		role: RoleType.Townsfolk,
		ability: 'Executed good players might not die.'
	}),
	Factory.createCharacter({
		id: 'philosopher',
		name: 'Philosopher',
		role: RoleType.Townsfolk,
		ability: 'Once per game, at night, choose a good character: you gain its ability. If that character is in play, they are drunk.',
		wakesFirstNight: [
			Factory.createShowPlayerChooseCharacters({
				id: 'philosopher_first_1',
				text: 'You may choose a good character',
				note: 'Once per game',
				min: 0,
				max: 1,
				types: [ AlignmentType.Good ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChooseCharacters({
				id: 'philosopher_other_1',
				text: 'You may choose a good character',
				note: 'Once per game',
				min: 0,
				max: 1,
				types: [ AlignmentType.Good ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'philosopher_is_the_philosopher',
				label: 'Is the Philosopher',
				type: 'self',
				text: 'The Philosopher has the ability of the good character they chose.',
				effects: [
					Factory.createEffectHasTheAbilityOf({
						id: 'philosopher_is_the_philosopher_ability',
						types: [ AlignmentType.Good ],
						inPlay: null
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'philosopher_drunk',
				label: 'Drunk',
				type: 'assigned',
				text: 'The in-play character the Philosopher chose: drunk.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectIsDrunk({
						id: 'philosopher_drunk_drunk'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'pixie',
		name: 'Pixie',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing an in-play Townsfolk. If you were “mad” that you were that character, you gain its ability when they die.',
		wakesFirstNight: [
			Factory.createShowPlayerCharacter({
				id: 'pixie_first_1',
				text: 'This Townsfolk is in play',
				note: 'An in-play Townsfolk'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'pixie_mad',
				label: 'Mad',
				type: 'assigned',
				text: 'The in-play Townsfolk shown to the Pixie.',
				restrictions: [ 'not_self', RoleType.Townsfolk ]
			}),
			Factory.createPlayerModifier({
				id: 'pixie_has_ability',
				label: 'Has ability',
				type: 'self',
				text: 'The Pixie has gained the ability of the Townsfolk they were “mad” as.',
				effects: [
					Factory.createEffectHasTheAbilityOf({
						id: 'pixie_has_ability_ability',
						types: [ RoleType.Townsfolk ],
						inPlay: true
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'poppygrower',
		name: 'Poppy Grower',
		role: RoleType.Townsfolk,
		ability: 'Minions and Demons do not know each other. If you die, they learn who each other are that night.',
		wakesFirstNight: [
			Factory.createShowPlayerStorytellerAction({
				id: 'poppy_grower_first_1',
				action: 'While the Poppy Grower has their ability, there is no Minion or Demon info. When they die, evil learns each other the next night.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'preacher',
		name: 'Preacher',
		role: RoleType.Townsfolk,
		ability: 'Each night, choose a player: if they are a Minion, they learn this. Chosen Minions have no ability.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'preacher_first_1',
				outcome: { modifierID: 'preacher_at_a_sermon', action: 'place' },
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'preacher_other_1',
				outcome: { modifierID: 'preacher_at_a_sermon', action: 'place' },
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'preacher_at_a_sermon',
				label: 'At a sermon',
				type: 'assigned',
				text: 'Chosen by the Preacher: if a Minion, they have no ability.',
				max: null,
				effects: [
					Factory.createEffectIsWoken({
						id: 'preacher_at_a_sermon_woken',
						nights: 'all',
						show: [
							Factory.createShowPlayerPrompt({
								id: 'preacher_at_a_sermon_woken_prompt',
								note: 'Only if they are a Minion',
								text: 'You are at a sermon: you have no ability.'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'princess',
		name: 'Princess',
		role: RoleType.Townsfolk,
		ability: 'On your first day, if you nominated and executed a player, the Demon does not kill tonight.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'princess_safe',
				label: 'Safe',
				type: 'self',
				text: 'The Princess nominated and executed a player on their first day: the Demon does not kill tonight.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'professor',
		name: 'Professor',
		role: RoleType.Townsfolk,
		ability: 'Once per game, at night*, choose a dead player: if they are a Townsfolk, they are brought back to life.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'professor_other_1',
				outcome: { modifierID: 'professor_alive', action: 'revive' },
				text: 'You may choose a dead player',
				note: 'Once per game',
				min: 0,
				max: 1,
				restrictions: [ 'dead' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'professor_alive',
				label: 'Alive',
				type: 'assigned',
				text: 'Brought back to life by the Professor.'
			}),
			Factory.createPlayerModifier({
				id: 'professor_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Professor has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'ravenkeeper',
		name: 'Ravenkeeper',
		role: RoleType.Townsfolk,
		ability: 'If you die at night, you are woken to choose a player: you learn their character.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'ravenkeeper_other_1',
				text: 'You died tonight. Choose a player',
				note: 'Only if the Ravenkeeper died tonight',
				min: 1,
				max: 1
			}),
			Factory.createShowPlayerCharacter({
				id: 'ravenkeeper_other_2',
				text: 'They are the',
				note: 'That player\'s character',
				answer: { type: 'chosen_character' }
			})
		]
	}),
	Factory.createCharacter({
		id: 'sage',
		name: 'Sage',
		role: RoleType.Townsfolk,
		ability: 'If the Demon kills you, you learn that it is one of two players.',
		wakesOtherNights: [
			Factory.createShowPlayerPlayer({
				id: 'sage_other_1',
				text: 'The Demon is one of these players',
				note: 'One of two players, one of whom is the Demon; only if the Demon killed the Sage'
			}),
			Factory.createShowPlayerPlayer({
				id: 'sage_other_2',
				text: 'or',
				note: 'The other player'
			})
		]
	}),
	Factory.createCharacter({
		id: 'sailor',
		name: 'Sailor',
		role: RoleType.Townsfolk,
		ability: 'Each night, choose a living player: either you or they are drunk until dusk. You cannot die.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'sailor_first_1',
				text: 'Choose a living player',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'sailor_other_1',
				text: 'Choose a living player',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'sailor_drunk',
				label: 'Drunk',
				type: 'assigned',
				text: 'Drunk until dusk.',
				effects: [
					Factory.createEffectIsDrunk({
						id: 'sailor_drunk_drunk'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'sailor_cannot_die',
				label: 'Cannot die',
				type: 'self',
				text: 'The Sailor cannot die.',
				effects: [
					Factory.createEffectIsProtected({
						id: 'sailor_cannot_die_protected',
						fromExecution: true,
						fromMurder: true
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'savant',
		name: 'Savant',
		role: RoleType.Townsfolk,
		ability: 'Each day, you may visit the Storyteller to learn two things in private: one is true and one is false.'
	}),
	Factory.createCharacter({
		id: 'seamstress',
		name: 'Seamstress',
		role: RoleType.Townsfolk,
		ability: 'Once per game, at night, choose two players other than yourself: you learn whether they are the same alignment.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'seamstress_first_1',
				text: 'You may choose two players other than yourself',
				note: 'Once per game',
				min: 0,
				max: 2,
				restrictions: [ 'not_self' ]
			}),
			Factory.createShowPlayerYesNo({
				id: 'seamstress_first_2',
				text: 'Are they the same alignment?',
				note: 'Yes if they are the same alignment',
				answer: { type: 'chosen_same_alignment' }
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'seamstress_other_1',
				text: 'You may choose two players other than yourself',
				note: 'Once per game',
				min: 0,
				max: 2,
				restrictions: [ 'not_self' ]
			}),
			Factory.createShowPlayerYesNo({
				id: 'seamstress_other_2',
				text: 'Are they the same alignment?',
				note: 'Yes if they are the same alignment',
				answer: { type: 'chosen_same_alignment' }
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'seamstress_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Seamstress has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'shugenja',
		name: 'Shugenja',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing whether your nearest evil player is clockwise or anticlockwise. If they are equally close both ways, this is arbitrary.',
		wakesFirstNight: [
			Factory.createShowPlayerPrompt({
				id: 'shugenja_first_1',
				note: 'The direction of the nearest evil player',
				text: 'Your nearest evil player is this way'
			})
		]
	}),
	Factory.createCharacter({
		id: 'slayer',
		name: 'Slayer',
		role: RoleType.Townsfolk,
		ability: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'slayer_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Slayer has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'snakecharmer',
		name: 'Snake Charmer',
		role: RoleType.Townsfolk,
		ability: 'Each night, choose a living player: if they are the Demon, you swap characters and alignments with them, and they are poisoned.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'snake_charmer_first_1',
				text: 'Choose a living player',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'snake_charmer_other_1',
				text: 'Choose a living player',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'snake_charmer_poisoned',
				label: 'Poisoned',
				type: 'assigned',
				text: 'The old Demon, now the Snake Charmer, is poisoned.',
				effects: [
					Factory.createEffectIsPoisoned({
						id: 'snake_charmer_poisoned_poisoned'
					}),
					Factory.createEffectIsWoken({
						id: 'snake_charmer_poisoned_woken',
						nights: 'all',
						show: [
							Factory.createShowPlayerYouAre({
								id: 'snake_charmer_poisoned_woken_youare',
								text: 'You are now',
								note: 'The old Demon is now the Snake Charmer, and good',
								includeAlignment: true
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'soldier',
		name: 'Soldier',
		role: RoleType.Townsfolk,
		ability: 'The Demon cannot kill you.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'soldier_protected',
				label: 'Protected',
				type: 'self',
				text: 'The Demon cannot kill the Soldier.',
				effects: [
					Factory.createEffectIsProtected({
						id: 'soldier_protected_protected',
						fromExecution: false,
						fromMurder: true
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'steward',
		name: 'Steward',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing a good player.',
		wakesFirstNight: [
			Factory.createShowPlayerPlayer({
				id: 'steward_first_1',
				fromReminders: [ 'steward_know' ],
				text: 'This player is good',
				note: 'A good player'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'steward_know',
				label: 'Know',
				type: 'assigned',
				setup: 'yes',
				text: 'The good player the Steward knows.',
				restrictions: [ 'not_self', AlignmentType.Good ]
			})
		]
	}),
	Factory.createCharacter({
		id: 'tealady',
		name: 'Tea Lady',
		role: RoleType.Townsfolk,
		ability: 'If both of your living neighbours are good, they cannot die.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'tea_lady_cannot_die',
				label: 'Cannot die',
				type: 'assigned',
				text: 'While both of the Tea Lady\'s living neighbours are good, they cannot die.',
				max: 2,
				restrictions: [ 'not_self', AlignmentType.Good ],
				effects: [
					Factory.createEffectIsProtected({
						id: 'tea_lady_cannot_die_protected',
						fromExecution: true,
						fromMurder: true
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'towncrier',
		name: 'Town Crier',
		role: RoleType.Townsfolk,
		ability: 'Each night*, you learn whether a Minion nominated today.',
		wakesOtherNights: [
			Factory.createShowPlayerYesNo({
				id: 'town_crier_other_1',
				text: 'Did a Minion nominate today?',
				note: 'Yes if a Minion nominated today'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'town_crier_minion_nominated',
				label: 'Minion nominated',
				type: 'self',
				text: 'A Minion nominated today.'
			}),
			Factory.createPlayerModifier({
				id: 'town_crier_minion_not_nominated',
				label: 'Minion not nominated',
				type: 'self',
				text: 'No Minion nominated today.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'undertaker',
		name: 'Undertaker',
		role: RoleType.Townsfolk,
		ability: 'Each night*, you learn which character was executed today.',
		wakesOtherNights: [
			Factory.createShowPlayerCharacter({
				id: 'undertaker_other_1',
				text: 'The player executed today was the',
				note: 'The character executed today; skip if nobody was executed',
				answer: { type: 'executed_character' }
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'undertaker_executed',
				label: 'Executed',
				type: 'assigned',
				text: 'The player executed today.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'villageidiot',
		name: 'Village Idiot',
		role: RoleType.Townsfolk,
		ability: 'Each night, choose a player: you learn their alignment.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'village_idiot_first_1',
				text: 'Choose a player',
				min: 1,
				max: 1
			}),
			Factory.createShowPlayerAlignment({
				id: 'village_idiot_first_2',
				text: 'They are',
				note: 'That player\'s alignment'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'village_idiot_other_1',
				text: 'Choose a player',
				min: 1,
				max: 1
			}),
			Factory.createShowPlayerAlignment({
				id: 'village_idiot_other_2',
				text: 'They are',
				note: 'That player\'s alignment'
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'village_idiot_mod',
				label: '',
				text: '+0 to +2 Village Idiots. 1 of the extras is drunk',
				adjustments: [
					Factory.createBagAdjustmentAddCharacter({
						characterID: 'villageidiot',
						copies: [ 1, 2, 3 ]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'village_idiot_drunk',
				label: 'Drunk',
				type: 'assigned',
				setup: 'optional',
				text: 'If there are extra Village Idiots, one of them is drunk.',
				restrictions: [ RoleType.Townsfolk ],
				effects: [
					Factory.createEffectIsDrunk({
						id: 'village_idiot_drunk_drunk'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'virgin',
		name: 'Virgin',
		role: RoleType.Townsfolk,
		ability: 'The first time you are nominated, if the nominator is a Townsfolk, they are executed immediately.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'virgin_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Virgin has been nominated.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'washerwoman',
		name: 'Washerwoman',
		role: RoleType.Townsfolk,
		ability: 'You start the game knowing that one of two players is a particular Townsfolk.',
		wakesFirstNight: [
			Factory.createShowPlayerCharacter({
				id: 'washerwoman_first_1',
				fromReminder: 'washerwoman_townsfolk',
				text: 'One of these players is the',
				note: 'The Townsfolk'
			}),
			Factory.createShowPlayerPlayer({
				id: 'washerwoman_first_2',
				fromReminders: [ 'washerwoman_townsfolk', 'washerwoman_wrong' ],
				index: 0,
				text: 'This player',
				note: 'One of the two players'
			}),
			Factory.createShowPlayerPlayer({
				id: 'washerwoman_first_3',
				fromReminders: [ 'washerwoman_townsfolk', 'washerwoman_wrong' ],
				index: 1,
				text: 'or this player',
				note: 'The other player'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'washerwoman_townsfolk',
				label: 'Townsfolk',
				type: 'assigned',
				setup: 'yes',
				text: 'The Townsfolk shown to the Washerwoman.',
				restrictions: [ 'not_self', RoleType.Townsfolk ]
			}),
			Factory.createPlayerModifier({
				id: 'washerwoman_wrong',
				label: 'Wrong',
				type: 'assigned',
				setup: 'yes',
				text: 'The other player shown to the Washerwoman.'
			})
		]
	})
];
