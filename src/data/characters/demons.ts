import { AlignmentType } from '../../enums/alignment-type';
import type { Character } from '../../models/character';
import { Factory } from '../../logic/factory';
import { RoleType } from '../../enums/role-type';

export const Demons: Character[] = [
	Factory.createCharacter({
		id: 'alhadikhia',
		name: 'Al-Hadikhia',
		role: RoleType.Demon,
		ability: 'Each night*, you may choose three players, and everyone learns who. Each secretly chooses to live or die, but if all three live, all three die.',
		jinxes: [
			Factory.createJinx({
				characterID: 'mastermind',
				text: 'If the Al-Hadikhia dies by execution, and the Mastermind is alive, the Al-Hadikhia chooses 3 good players tonight: if all 3 choose to live, evil wins. Otherwise, good wins.'
			}),
			Factory.createJinx({
				characterID: 'princess',
				text: 'If the Princess nominated & executed a player on their 1st day, no one dies to the Al-Hadikhia tonight.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'al_hadikhia_other_1',
				text: 'You may choose three players',
				note: 'Wake each in turn to choose whether to live or die',
				min: 0,
				max: 3
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'al_hadikhia_1',
				label: '1',
				type: 'assigned',
				text: 'The first player the Al-Hadikhia chose.'
			}),
			Factory.createPlayerModifier({
				id: 'al_hadikhia_2',
				label: '2',
				type: 'assigned',
				text: 'The second player the Al-Hadikhia chose.'
			}),
			Factory.createPlayerModifier({
				id: 'al_hadikhia_3',
				label: '3',
				type: 'assigned',
				text: 'The third player the Al-Hadikhia chose.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'fanggu',
		name: 'Fang Gu',
		role: RoleType.Demon,
		ability: 'Each night*, choose a player: they die. The first Outsider this kills becomes an evil Fang Gu instead, and you die.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'fang_gu_other_1',
				outcome: { modifierID: 'fang_gu_dead', action: 'kill' },
				text: 'Choose a player',
				note: 'If it is the first Outsider chosen, they become an evil Fang Gu instead, and the Fang Gu dies',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'fang_gu_mod',
				label: '',
				text: '+1 Outsider',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: [ 1 ]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'fang_gu_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Fang Gu.'
			}),
			Factory.createPlayerModifier({
				id: 'fang_gu_once',
				label: 'Once',
				type: 'self',
				text: 'The Fang Gu has already jumped to an Outsider.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'imp',
		name: 'Imp',
		role: RoleType.Demon,
		ability: 'Each night*, choose a player: they die. If you choose yourself, you die and a Minion becomes the Imp.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'imp_other_1',
				outcome: { modifierID: 'imp_dead', action: 'kill' },
				text: 'Choose a player',
				note: 'If the Imp chose themself, wake a Minion: they become the Imp',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'imp_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Imp.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'kazali',
		name: 'Kazali',
		role: RoleType.Demon,
		ability: 'Each night*, choose a player: they die. You choose which players are which Minions.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'kazali_first_1',
				text: 'Choose your Minions',
				min: 0,
				max: 3
			}),
			Factory.createShowPlayerChooseCharacters({
				id: 'kazali_first_2',
				text: 'Choose which Minion each becomes',
				note: 'Which Minion each chosen player becomes',
				min: 0,
				max: 3,
				types: [ RoleType.Minion ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'kazali_other_1',
				outcome: { modifierID: 'kazali_dead', action: 'kill' },
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'kazali_mod',
				label: '',
				text: 'No Minions. -? to +? Outsiders',
				adjustments: [
					Factory.createBagAdjustmentSetRoleCount({
						role: RoleType.Minion,
						count: 0
					}),
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: null
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'kazali_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Kazali.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'legion',
		name: 'Legion',
		role: RoleType.Demon,
		ability: 'Each night*, a player might die. Executions fail if only evil players voted. You also register as a Minion.',
		jinxes: [
			Factory.createJinx({
				characterID: 'engineer',
				text: 'If Legion is created, all evil players become Legion. If Legion is in play, the Engineer starts knowing this but has no ability.'
			}),
			Factory.createJinx({
				characterID: 'hatter',
				text: 'If Legion is created, all evil players become Legion. If Legion is in play, the Hatter has no ability.'
			}),
			Factory.createJinx({
				characterID: 'minstrel',
				text: 'If Legion died by execution today, Legion keeps their ability, but the Minstrel might learn they are Legion.'
			}),
			Factory.createJinx({
				characterID: 'politician',
				text: 'The Politician might register as evil to Legion.'
			}),
			Factory.createJinx({
				characterID: 'preacher',
				text: 'If the Preacher chooses Legion, Legion keeps their ability, but the Preacher might learn they are Legion.'
			}),
			Factory.createJinx({
				characterID: 'summoner',
				text: 'If Legion is summoned, all evil players become Legion. '
			}),
			Factory.createJinx({
				characterID: 'zealot',
				text: 'The Zealot might register as evil to Legion.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'legion_other_1',
				action: 'Choose a player, who might die.'
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'legion_mod',
				label: '',
				text: 'Most players are Legion',
				adjustments: [
					Factory.createBagAdjustmentSetRoleCount({
						role: RoleType.Minion,
						count: 0
					}),
					Factory.createBagAdjustmentAddCharacter({
						characterID: 'legion',
						copies: 'majority'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'legion_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Legion.'
			}),
			Factory.createPlayerModifier({
				id: 'legion_about_to_die',
				label: 'About to die',
				type: 'assigned',
				text: 'Being voted on: the execution fails if only evil players voted.'
			}),
			Factory.createPlayerModifier({
				id: 'legion_registers_as_minion',
				label: 'Registers as Minion',
				type: 'self',
				text: 'Legion also registers as a Minion.',
				effects: [
					Factory.createEffectCanRegisterAs({
						id: 'legion_registers_as_minion_registers',
						registerAs: [ RoleType.Minion ],
						onlyToOwner: false
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'leviathan',
		name: 'Leviathan',
		role: RoleType.Demon,
		ability: 'Everyone knows you are in play. If more than one good player is executed, evil wins. After day 5, evil wins.',
		jinxes: [
			Factory.createJinx({
				characterID: 'banshee',
				text: 'Each night*, the Leviathan chooses an alive good player (different to previous nights): a chosen Banshee dies & gains their ability.'
			}),
			Factory.createJinx({
				characterID: 'exorcist',
				text: 'If the Leviathan nominates and executes the Exorcist-chosen player, good wins.'
			}),
			Factory.createJinx({
				characterID: 'farmer',
				text: 'Each night*, the Leviathan chooses an alive good player (different to previous nights): a chosen Farmer uses their ability but does not die.'
			}),
			Factory.createJinx({
				characterID: 'grandmother',
				text: 'If the Leviathan is in play and the Grandchild dies by execution, evil wins.'
			}),
			Factory.createJinx({
				characterID: 'hatter',
				text: 'The Leviathan cannot enter play after day 5.'
			}),
			Factory.createJinx({
				characterID: 'innkeeper',
				text: 'If the Leviathan nominates and executes an Innkeeper-protected player, good wins.'
			}),
			Factory.createJinx({
				characterID: 'king',
				text: 'If the Leviathan is in play, and at least 1 player is dead, the King learns an alive character each night.'
			}),
			Factory.createJinx({
				characterID: 'mayor',
				text: 'If the Leviathan and the Mayor are alive on day 5 & no execution occurs, good wins.'
			}),
			Factory.createJinx({
				characterID: 'monk',
				text: 'If the Leviathan nominates and executes the Monk-protected player, good wins.'
			}),
			Factory.createJinx({
				characterID: 'pithag',
				text: 'The Leviathan cannot enter play after day 5.'
			}),
			Factory.createJinx({
				characterID: 'ravenkeeper',
				text: 'Each night*, the Leviathan chooses an alive player (different to previous nights): a chosen Ravenkeeper uses their ability but does not die.'
			}),
			Factory.createJinx({
				characterID: 'sage',
				text: 'Each night*, the Leviathan chooses an alive good player (different to previous nights): a chosen Sage uses their ability but does not die.'
			}),
			Factory.createJinx({
				characterID: 'soldier',
				text: 'If the Leviathan nominates and executes the Soldier, good wins.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerStorytellerAction({
				id: 'leviathan_first_1',
				action: 'Announce at dawn that the Leviathan is in play.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'leviathan_other_1',
				action: 'Advance the day marker.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'leviathan_day_1',
				label: 'Day 1',
				type: 'self',
				text: 'Day 1.'
			}),
			Factory.createPlayerModifier({
				id: 'leviathan_day_2',
				label: 'Day 2',
				type: 'self',
				text: 'Day 2.'
			}),
			Factory.createPlayerModifier({
				id: 'leviathan_day_3',
				label: 'Day 3',
				type: 'self',
				text: 'Day 3.'
			}),
			Factory.createPlayerModifier({
				id: 'leviathan_day_4',
				label: 'Day 4',
				type: 'self',
				text: 'Day 4.'
			}),
			Factory.createPlayerModifier({
				id: 'leviathan_day_5',
				label: 'Day 5',
				type: 'self',
				text: 'Day 5: after today, evil wins.'
			}),
			Factory.createPlayerModifier({
				id: 'leviathan_good_player_executed',
				label: 'Good player executed',
				type: 'self',
				text: 'A good player has been executed.'
			}),
			Factory.createPlayerModifier({
				id: 'leviathan_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If more than one good player is executed, evil wins. After day 5, evil wins.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'leviathan_win_condition_win',
						text: 'If more than one good player is executed, evil wins. After day 5, evil wins.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'lilmonsta',
		name: 'Lil’ Monsta',
		role: RoleType.Demon,
		ability: 'Each night, the Minions choose who babysits Lil’ Monsta and “is the Demon”. Each night*, a player might die.',
		jinxes: [
			Factory.createJinx({
				characterID: 'hatter',
				text: 'If the Hatter dies & the Demon chooses Lil\' Monsta, they also choose a Minion to become.'
			}),
			Factory.createJinx({
				characterID: 'magician',
				text: 'If the Magician is alive, the Storyteller chooses which Minion babysits Lil\' Monsta. '
			}),
			Factory.createJinx({
				characterID: 'poppygrower',
				text: 'If Lil\' Monsta & the Poppy Grower are alive, Minions wake one by one, until one of them chooses to take the Lil\' Monsta token.'
			}),
			Factory.createJinx({
				characterID: 'psychopath',
				text: 'If the Psychopath is babysitting Lil\' Monsta, they die when executed.'
			}),
			Factory.createJinx({
				characterID: 'scarletwoman',
				text: 'If Lil\' Monsta dies with 5 or more players alive, the Scarlet Woman babysits Lil\' Monsta for the rest of the game.'
			}),
			Factory.createJinx({
				characterID: 'vizier',
				text: 'If the Vizier is babysitting Lil\' Monsta, they die when executed.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerStorytellerAction({
				id: 'lil_monsta_first_1',
				action: 'Wake the Minions: they choose who babysits Lil\' Monsta.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'lil_monsta_other_1',
				action: 'Wake the Minions to choose a babysitter, then choose a player who might die.'
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'lil_monsta_mod',
				label: '',
				text: '+1 Minion',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Minion,
						options: [ 1 ]
					}),
					Factory.createBagAdjustmentSetRoleCount({
						role: RoleType.Demon,
						count: 0
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'lil_monsta_is_the_demon',
				label: 'Is the Demon',
				type: 'assigned',
				text: 'The Minion babysitting Lil\' Monsta.',
				restrictions: [ RoleType.Minion ],
				effects: [
					Factory.createEffectCanRegisterAs({
						id: 'lil_monsta_is_the_demon_registers',
						registerAs: [ RoleType.Demon ],
						onlyToOwner: false
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'lil_monsta_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Lil\' Monsta.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'lleech',
		name: 'Lleech',
		role: RoleType.Demon,
		ability: 'Each night*, choose a player: they die. You start by choosing a living player: they are poisoned, and you die if and only if they die.',
		jinxes: [
			Factory.createJinx({
				characterID: 'mastermind',
				text: 'If the Mastermind is alive and the Lleech host dies by execution, the Lleech lives but loses their ability.'
			}),
			Factory.createJinx({
				characterID: 'slayer',
				text: 'If the Slayer slays the Lleech host, the host dies.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'lleech_first_1',
				text: 'Choose a living player to be your host',
				outcome: { modifierID: 'lleech_poisoned', action: 'place' },
				note: 'Their host',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'lleech_other_1',
				outcome: { modifierID: 'lleech_dead', action: 'kill' },
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'lleech_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Lleech.'
			}),
			Factory.createPlayerModifier({
				id: 'lleech_poisoned',
				label: 'Poisoned',
				type: 'assigned',
				text: 'The Lleech\'s host: poisoned, and the Lleech dies if and only if they die.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectIsPoisoned({
						id: 'lleech_poisoned_poisoned'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'lordoftyphon',
		name: 'Lord of Typhon',
		role: RoleType.Demon,
		ability: 'Each night*, choose a player: they die.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'lord_of_typhon_other_1',
				outcome: { modifierID: 'lord_of_typhon_dead', action: 'kill' },
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'lord_of_typhon_mod',
				label: '',
				text: '+1 Minion. -? to +? Outsiders',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Minion,
						options: [ 1 ]
					}),
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: null
					})
				]
			}),
			Factory.createSeatingModifier({
				id: 'lord_of_typhon_seating',
				label: '',
				text: 'Evil characters are in a line. You are in the middle.',
				requirements: [
					Factory.createSeatingRequirementInLine({
						types: [ AlignmentType.Evil ],
						ownerInMiddle: true
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'lord_of_typhon_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Lord of Typhon.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'nodashii',
		name: 'No Dashii',
		role: RoleType.Demon,
		ability: 'Each night*, choose a player: they die. Your two nearest Townsfolk neighbours are poisoned.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'no_dashii_other_1',
				outcome: { modifierID: 'no_dashii_dead', action: 'kill' },
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'no_dashii_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the No Dashii.'
			}),
			Factory.createPlayerModifier({
				id: 'no_dashii_poisoned',
				label: 'Poisoned',
				type: 'assigned',
				text: 'One of the No Dashii\'s two nearest Townsfolk neighbours.',
				max: 2,
				restrictions: [ 'not_self', RoleType.Townsfolk ],
				effects: [
					Factory.createEffectIsPoisoned({
						id: 'no_dashii_poisoned_poisoned'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'ojo',
		name: 'Ojo',
		role: RoleType.Demon,
		ability: 'Each night*, choose a character: they die. If that character is not in play, the Storyteller chooses who dies.',
		wakesOtherNights: [
			Factory.createShowPlayerChooseCharacters({
				id: 'ojo_other_1',
				text: 'Choose a character',
				note: 'If that character is not in play, the Storyteller chooses who dies',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'ojo_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Ojo.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'po',
		name: 'Po',
		role: RoleType.Demon,
		ability: 'Each night*, you may choose a player: they die. If your last choice was nobody, choose three players tonight.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'po_other_1',
				outcome: { modifierID: 'po_dead', action: 'kill' },
				text: 'You may choose a player, or three if you chose nobody last time',
				note: 'Up to one player, or three if they chose nobody last time',
				min: 0,
				max: 3
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'po_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Po.',
				max: 3
			}),
			Factory.createPlayerModifier({
				id: 'po_3_attacks',
				label: '3 attacks',
				type: 'self',
				text: 'The Po chose nobody last night, so chooses three players tonight.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'pukka',
		name: 'Pukka',
		role: RoleType.Demon,
		ability: 'Each night, choose a player: they are poisoned. The player poisoned before them dies, then becomes healthy.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'pukka_first_1',
				text: 'Choose a player',
				outcome: { modifierID: 'pukka_poisoned', action: 'place' },
				min: 1,
				max: 1
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'pukka_other_1',
				text: 'Choose a player',
				outcome: { modifierID: 'pukka_poisoned', action: 'place' },
				note: 'The player poisoned last night dies',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'pukka_poisoned',
				label: 'Poisoned',
				type: 'assigned',
				text: 'Poisoned by the Pukka: dies when the Pukka chooses another player.',
				effects: [
					Factory.createEffectIsPoisoned({
						id: 'pukka_poisoned_poisoned'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'pukka_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Pukka.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'riot',
		name: 'Riot',
		role: RoleType.Demon,
		ability: 'On day 3, the Minions become Riot, and nominees die but must immediately nominate a living player. This must happen.',
		jinxes: [
			Factory.createJinx({
				characterID: 'atheist',
				text: 'During a riot, if the Storyteller is nominated, players vote. If they are "about to die", the game ends. If not, they nominate again.'
			}),
			Factory.createJinx({
				characterID: 'banshee',
				text: 'Each night*, Riot chooses an alive good player (different to previous nights): a chosen Banshee dies & gains their ability.'
			}),
			Factory.createJinx({
				characterID: 'exorcist',
				text: 'If Riot nominates and executes the Exorcist-chosen player, good wins.'
			}),
			Factory.createJinx({
				characterID: 'farmer',
				text: 'Each night*, Riot chooses an alive good player (different to previous nights): a chosen Farmer uses their ability but does not die.'
			}),
			Factory.createJinx({
				characterID: 'grandmother',
				text: 'If Riot is in play and the Grandchild dies by execution, evil wins.'
			}),
			Factory.createJinx({
				characterID: 'innkeeper',
				text: 'If Riot nominates and executes an Innkeeper-protected player, good wins.'
			}),
			Factory.createJinx({
				characterID: 'king',
				text: 'If Riot is in play, and at least 1 player is dead, the King learns an alive character each night.'
			}),
			Factory.createJinx({
				characterID: 'mayor',
				text: 'The Mayor may choose to stop the riot. If they do so when only 1 Riot is alive, good wins. Otherwise, evil wins.'
			}),
			Factory.createJinx({
				characterID: 'monk',
				text: 'If Riot nominates and executes the Monk-protected player, good wins.'
			}),
			Factory.createJinx({
				characterID: 'ravenkeeper',
				text: 'Each night*, Riot chooses an alive good player (different to previous nights): a chosen Ravenkeeper uses their ability but does not die.'
			}),
			Factory.createJinx({
				characterID: 'sage',
				text: 'Each night*, Riot chooses an alive good player (different to previous nights): a chosen Sage uses their ability but does not die.'
			}),
			Factory.createJinx({
				characterID: 'soldier',
				text: 'If Riot nominates and executes the Soldier, good wins.'
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'riot_mod',
				label: '',
				text: 'All Minions are Riot',
				adjustments: [
					Factory.createBagAdjustmentReplaceRole({
						role: RoleType.Minion,
						characterID: 'riot'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'riot_day_3',
				label: 'Day 3',
				type: 'self',
				text: 'Day 3: the Minions become Riot.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'shabaloth',
		name: 'Shabaloth',
		role: RoleType.Demon,
		ability: 'Each night*, choose two players: they die. A dead player you chose last night might come back to life.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'shabaloth_other_1',
				outcome: { modifierID: 'shabaloth_dead', action: 'kill' },
				text: 'Choose two players',
				note: 'One of last night\'s victims might return to life',
				min: 2,
				max: 2
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'shabaloth_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Shabaloth.',
				max: 2
			}),
			Factory.createPlayerModifier({
				id: 'shabaloth_alive',
				label: 'Alive',
				type: 'assigned',
				text: 'Brought back to life by the Shabaloth.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'vigormortis',
		name: 'Vigormortis',
		role: RoleType.Demon,
		ability: 'Each night*, choose a player: they die. Minions you kill keep their ability and poison one Townsfolk neighbour.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'vigormortis_other_1',
				outcome: { modifierID: 'vigormortis_dead', action: 'kill' },
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'vigormortis_mod',
				label: '',
				text: '-1 Outsider',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: [ -1 ]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'vigormortis_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Vigormortis.'
			}),
			Factory.createPlayerModifier({
				id: 'vigormortis_has_ability',
				label: 'Has ability',
				type: 'assigned',
				text: 'A Minion killed by the Vigormortis keeps their ability.',
				max: null,
				restrictions: [ RoleType.Minion ]
			}),
			Factory.createPlayerModifier({
				id: 'vigormortis_poisoned',
				label: 'Poisoned',
				type: 'assigned',
				text: 'A Townsfolk neighbour poisoned by a Minion the Vigormortis killed.',
				max: null,
				restrictions: [ RoleType.Townsfolk ],
				effects: [
					Factory.createEffectIsPoisoned({
						id: 'vigormortis_poisoned_poisoned'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'vortox',
		name: 'Vortox',
		role: RoleType.Demon,
		ability: 'Each night*, choose a player: they die. Townsfolk abilities give false information. Each day, if nobody is executed, evil wins.',
		jinxes: [
			Factory.createJinx({
				characterID: 'banshee',
				text: 'If the Vortox kills the Banshee, all players learn that the Banshee has died.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'vortox_other_1',
				outcome: { modifierID: 'vortox_dead', action: 'kill' },
				text: 'Choose a player',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'vortox_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Vortox.'
			}),
			Factory.createPlayerModifier({
				id: 'vortox_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'Each day, if nobody is executed, evil wins.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'vortox_win_condition_win',
						text: 'Each day, if nobody is executed, evil wins.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'yaggababble',
		name: 'Yaggababble',
		role: RoleType.Demon,
		ability: 'You start the game knowing a secret phrase. For each time you said it publicly today, a player might die.',
		jinxes: [
			Factory.createJinx({
				characterID: 'exorcist',
				text: 'If the Exorcist chooses the Yaggababble, the Yaggababble does not kill tonight.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerPrompt({
				id: 'yaggababble_first_1',
				text: 'Your secret phrase is…'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'yaggababble_other_1',
				action: 'For each time the phrase was said today, choose a player who might die.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'yaggababble_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Yaggababble.',
				max: null
			})
		]
	}),
	Factory.createCharacter({
		id: 'zombuul',
		name: 'Zombuul',
		role: RoleType.Demon,
		ability: 'Each night*, if nobody died today, choose a player: they die. The first time you die, you live on but register as dead.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'zombuul_other_1',
				outcome: { modifierID: 'zombuul_dead', action: 'kill' },
				text: 'Choose a player',
				note: 'Only if nobody died today',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'zombuul_died_today',
				label: 'Died today',
				type: 'assigned',
				text: 'A player died today, so the Zombuul does not kill tonight.'
			}),
			Factory.createPlayerModifier({
				id: 'zombuul_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Zombuul.'
			})
		]
	})
];
