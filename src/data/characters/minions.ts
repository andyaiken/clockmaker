import { AlignmentType } from '../../enums/alignment-type';
import type { Character } from '../../models/character';
import { Factory } from '../../logic/factory';
import { RoleType } from '../../enums/role-type';

export const Minions: Character[] = [
	Factory.createCharacter({
		id: 'assassin',
		name: 'Assassin',
		role: RoleType.Minion,
		ability: 'Once per game, at night*, choose a player: they die, even if something would normally prevent it.',
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'assassin_other_1',
				outcome: { modifierID: 'assassin_dead', action: 'kill' },
				text: 'You may choose a player',
				note: 'Once per game',
				min: 0,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'assassin_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Assassin.'
			}),
			Factory.createPlayerModifier({
				id: 'assassin_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Assassin has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'baron',
		name: 'Baron',
		role: RoleType.Minion,
		ability: 'There are extra Outsiders in play.',
		modifiers: [
			Factory.createBagModifier({
				id: 'baron-mod',
				label: '',
				text: '+2 Outsiders',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: [ 2 ]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'boffin',
		name: 'Boffin',
		role: RoleType.Minion,
		ability: 'The Demon, even if drunk or poisoned, has the ability of a good character that is not in play. You both know which.',
		jinxes: [
			Factory.createJinx({
				characterID: 'cultleader',
				text: 'If the Demon has the Cult Leader ability, they can’t turn good due to this ability.'
			}),
			Factory.createJinx({
				characterID: 'drunk',
				text: 'The Demon cannot have the Drunk ability.'
			}),
			Factory.createJinx({
				characterID: 'goon',
				text: 'If the Demon has the Goon ability, they can’t turn good due to this ability.'
			}),
			Factory.createJinx({
				characterID: 'heretic',
				text: 'The Demon cannot have the Heretic ability.'
			}),
			Factory.createJinx({
				characterID: 'ogre',
				text: 'The Demon cannot have the Ogre ability.'
			}),
			Factory.createJinx({
				characterID: 'politician',
				text: 'The Demon cannot have the Politician ability.'
			}),
			Factory.createJinx({
				characterID: 'villageidiot',
				text: 'If there is a spare token, the Boffin can give the Demon the Village Idiot ability.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerCharacter({
				id: 'boffin_first_1',
				text: 'The Demon has the ability of the',
				note: 'The good character whose ability the Demon has'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'boffin_setup',
				label: 'Demon ability',
				type: 'assigned',
				setup: 'yes',
				text: 'Choose a good character that is not in play: the Demon has its ability.',
				restrictions: [ RoleType.Demon ],
				effects: [
					Factory.createEffectHasTheAbilityOf({
						id: 'boffin_ability',
						types: [ AlignmentType.Good ],
						inPlay: false
					}),
					Factory.createEffectIsWoken({
						id: 'boffin_setup_woken',
						nights: 'first',
						show: [
							Factory.createShowPlayerCharacter({
								id: 'boffin_setup_woken_character',
								text: 'You have the ability of the',
								note: 'The good character whose ability the Demon has'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'boomdandy',
		name: 'Boomdandy',
		role: RoleType.Minion,
		ability: 'If you are executed, all but three players die. After a countdown from ten, the player most pointed at dies.'
	}),
	Factory.createCharacter({
		id: 'cerenovus',
		name: 'Cerenovus',
		role: RoleType.Minion,
		ability: 'Each night, choose a player and a good character: tomorrow, they are “mad” that they are that character, or might be executed.',
		jinxes: [
			Factory.createJinx({
				characterID: 'goblin',
				text: 'The Cerenovus may choose to make a player mad that they are the Goblin.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'cerenovus_first_1',
				text: 'Choose a player',
				outcome: { modifierID: 'cerenovus_mad', action: 'place' },
				min: 1,
				max: 1
			}),
			Factory.createShowPlayerChooseCharacters({
				id: 'cerenovus_first_2',
				text: 'Choose a good character',
				note: 'The character they must be “mad” about',
				min: 1,
				max: 1,
				types: [ AlignmentType.Good ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'cerenovus_other_1',
				text: 'Choose a player',
				outcome: { modifierID: 'cerenovus_mad', action: 'place' },
				min: 1,
				max: 1
			}),
			Factory.createShowPlayerChooseCharacters({
				id: 'cerenovus_other_2',
				text: 'Choose a good character',
				note: 'The character they must be “mad” about',
				min: 1,
				max: 1,
				types: [ AlignmentType.Good ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'cerenovus_mad',
				label: 'Mad',
				type: 'assigned',
				expires: 'dusk',
				text: 'Must be “mad” about being a character tomorrow, or might be executed.',
				effects: [
					Factory.createEffectIsWoken({
						id: 'cerenovus_mad_woken',
						nights: 'all',
						show: [
							Factory.createShowPlayerCharacter({
								id: 'cerenovus_mad_woken_character',
								text: 'You must be “mad” that you are the',
								note: 'The character they must be “mad” about'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'devilsadvocate',
		name: 'Devil’s Advocate',
		role: RoleType.Minion,
		ability: 'Each night, choose a living player (not the one you chose last night): if they are executed tomorrow, they do not die.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'devils_advocate_first_1',
				text: 'Choose a living player',
				outcome: { modifierID: 'devils_advocate_survives_execution', action: 'place' },
				note: 'Not the player chosen last night',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'devils_advocate_other_1',
				text: 'Choose a living player',
				outcome: { modifierID: 'devils_advocate_survives_execution', action: 'place' },
				note: 'Not the player chosen last night',
				min: 1,
				max: 1,
				restrictions: [ 'alive' ]
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'devils_advocate_survives_execution',
				label: 'Survives execution',
				type: 'assigned',
				expires: 'dusk',
				text: 'If executed tomorrow, they do not die.',
				effects: [
					Factory.createEffectIsProtected({
						id: 'devils_advocate_survives_execution_protected',
						fromExecution: true,
						fromMurder: false
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'eviltwin',
		name: 'Evil Twin',
		role: RoleType.Minion,
		ability: 'You and a player of the opposite alignment know each other. If the good twin is executed, evil wins. Good cannot win while you both live.',
		wakesFirstNight: [
			Factory.createShowPlayerPlayer({
				id: 'evil_twin_first_1',
				fromReminders: [ 'evil_twin_twin' ],
				text: 'Your twin is',
				note: 'The good twin'
			}),
			Factory.createShowPlayerCharacter({
				id: 'evil_twin_first_2',
				fromReminder: 'evil_twin_twin',
				text: 'They are the',
				note: 'The good twin\'s character'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'evil_twin_twin',
				label: 'Twin',
				type: 'assigned',
				setup: 'yes',
				text: 'The Evil Twin\'s good twin.',
				restrictions: [ 'not_self' ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'evil_twin_twin_woken',
						nights: 'first',
						show: [
							Factory.createShowPlayerPlayer({
								id: 'evil_twin_twin_woken_player',
								text: 'Your twin is',
								note: 'The Evil Twin'
							}),
							Factory.createShowPlayerCharacter({
								id: 'evil_twin_twin_woken_character',
								text: 'They are the',
								note: 'The Evil Twin character'
							})
						]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'evil_twin_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If the good twin is executed, evil wins. Good cannot win while both twins live.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'evil_twin_win_condition_win',
						text: 'If the good twin is executed, evil wins. Good cannot win while both twins live.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'fearmonger',
		name: 'Fearmonger',
		role: RoleType.Minion,
		ability: 'Each night, choose a player: if you nominate and execute them, their team loses. Everyone learns when you choose a new player.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'fearmonger_first_1',
				text: 'Choose a player',
				outcome: { modifierID: 'fearmonger_fear', action: 'place' },
				min: 1,
				max: 1
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'fearmonger_other_1',
				text: 'Choose a player',
				outcome: { modifierID: 'fearmonger_fear', action: 'place' },
				note: 'If it is a new player, announce at dawn that the Fearmonger chose someone',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'fearmonger_fear',
				label: 'Fear',
				type: 'assigned',
				text: 'If the Fearmonger nominates and executes this player, their team loses.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'fearmonger_fear_win',
						text: 'If the Fearmonger nominates and executes this player, their team loses.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'goblin',
		name: 'Goblin',
		role: RoleType.Minion,
		ability: 'If you publicly claim to be the Goblin when nominated and are executed that day, your team wins.',
		modifiers: [
			Factory.createPlayerModifier({
				id: 'goblin_claimed',
				label: 'Claimed',
				type: 'self',
				text: 'The Goblin claimed to be the Goblin when nominated today.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'goblin_claimed_win',
						text: 'If executed today after claiming to be the Goblin, the Goblin\'s team wins.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'godfather',
		name: 'Godfather',
		role: RoleType.Minion,
		ability: 'You start the game knowing which Outsiders are in play. If an Outsider died today, choose a player tonight: they die.',
		wakesFirstNight: [
			Factory.createShowPlayerCharacter({
				id: 'godfather_first_1',
				text: 'These Outsiders are in play',
				note: 'The Outsiders in play'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'godfather_other_1',
				outcome: { modifierID: 'godfather_dead', action: 'kill' },
				text: 'Choose a player',
				note: 'Only if an Outsider died today',
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'godfather_mod',
				label: '',
				text: '-1 or +1 Outsider',
				adjustments: [
					Factory.createBagAdjustmentChangeRoleCount({
						role: RoleType.Outsider,
						options: [ -1, 1 ]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'godfather_died_today',
				label: 'Died today',
				type: 'assigned',
				text: 'An Outsider who died today.',
				restrictions: [ RoleType.Outsider ]
			}),
			Factory.createPlayerModifier({
				id: 'godfather_dead',
				label: 'Dead',
				type: 'assigned',
				text: 'Killed by the Godfather.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'harpy',
		name: 'Harpy',
		role: RoleType.Minion,
		ability: 'Each night, choose two players: tomorrow, the first is “mad” that the second is evil, or one or both of them might die.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'harpy_first_1',
				text: 'Choose two players',
				min: 2,
				max: 2
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'harpy_other_1',
				text: 'Choose two players',
				min: 2,
				max: 2
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'harpy_mad',
				label: 'Mad',
				type: 'assigned',
				text: 'Must be “mad” that the second player is evil, or one or both might die.',
				effects: [
					Factory.createEffectIsWoken({
						id: 'harpy_mad_woken',
						nights: 'all',
						show: [
							Factory.createShowPlayerPlayer({
								id: 'harpy_mad_woken_player',
								text: 'You must be “mad” that this player is evil',
								note: 'The second player, who they must be “mad” is evil'
							})
						]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'harpy_2nd',
				label: '2nd',
				type: 'assigned',
				text: 'The second player the Harpy chose.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'marionette',
		name: 'Marionette',
		role: RoleType.Minion,
		ability: 'You think you are a good character, but you are not. The Demon knows who you are.',
		jinxes: [
			Factory.createJinx({
				characterID: 'balloonist',
				text: 'If the Marionette thinks that they are the Balloonist, an Outsider might have been added during setup.'
			}),
			Factory.createJinx({
				characterID: 'huntsman',
				text: 'If the Marionette thinks that they are the Huntsman, the Damsel was added during setup.'
			}),
			Factory.createJinx({
				characterID: 'kazali',
				text: 'If there would be a Marionette in play, they enter play after the Demon & must start as their neighbor.'
			}),
			Factory.createJinx({
				characterID: 'lilmonsta',
				text: 'If there would be a Marionette in play, they enter play after the Demon & must start as their neighbor.'
			}),
			Factory.createJinx({
				characterID: 'summoner',
				text: 'If there would be a Marionette in play, they enter play after the Demon & must start as their neighbor.'
			})
		],
		modifiers: [
			Factory.createSeatingModifier({
				id: 'marionette_seating',
				label: '',
				text: 'You neighbour the Demon',
				requirements: [
					Factory.createSeatingRequirementNeighbours({
						types: [ RoleType.Demon ]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'marionette_setup',
				label: 'Is the Marionette',
				type: 'self',
				setup: 'yes',
				text: 'Choose a good character that is not in play: the Marionette believes they are this character.',
				effects: [
					Factory.createEffectBelievesTheyAre({
						id: 'marionette_believes',
						types: [ AlignmentType.Good ],
						inPlay: false
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'marionette_demon',
				label: 'Knows the Marionette',
				type: 'assigned',
				setup: 'yes',
				text: 'The Demon: knows who the Marionette is.',
				restrictions: [ RoleType.Demon ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'marionette_demon_woken',
						nights: 'first',
						show: [
							Factory.createShowPlayerPlayer({
								id: 'marionette_demon_woken_player',
								text: 'Your Marionette is',
								note: 'The Marionette'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'mastermind',
		name: 'Mastermind',
		role: RoleType.Minion,
		ability: 'If the Demon is executed (ending the game), play one more day. If a player is then executed, their team loses.',
		jinxes: [
			Factory.createJinx({
				characterID: 'vigormortis',
				text: 'A Mastermind that has their ability keeps it if the Vigormortis dies.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'mastermind_win_condition',
				label: 'Win condition',
				type: 'self',
				text: 'If the Demon is executed, play one more day: if a player is then executed, their team loses.',
				effects: [
					Factory.createEffectHasWinCondition({
						id: 'mastermind_win_condition_win',
						text: 'If the Demon is executed, play one more day: if a player is then executed, their team loses.'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'mezepheles',
		name: 'Mezepheles',
		role: RoleType.Minion,
		ability: 'You start the game knowing a secret word. The first good player to say it becomes evil that night.',
		wakesFirstNight: [
			Factory.createShowPlayerPrompt({
				id: 'mezepheles_first_1',
				text: 'Your secret word is…'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'mezepheles_other_1',
				action: 'If a good player said the word today, they become evil tonight.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'mezepheles_turns_evil',
				label: 'Turns evil',
				type: 'assigned',
				text: 'Said the secret word: becomes evil tonight.',
				restrictions: [ AlignmentType.Good ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'mezepheles_turns_evil_woken',
						nights: 'other',
						show: [
							Factory.createShowPlayerYouAre({
								id: 'mezepheles_turns_evil_woken_youare',
								text: 'You are now',
								note: 'They are now evil',
								includeAlignment: true
							})
						]
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'mezepheles_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Mezepheles has used their ability.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'organgrinder',
		name: 'Organ Grinder',
		role: RoleType.Minion,
		ability: 'Everyone keeps their eyes closed when voting, and the vote count is secret. Each night, choose whether you are drunk until dusk.',
		wakesFirstNight: [
			Factory.createShowPlayerChooseYesNo({
				id: 'organ_grinder_first_1',
				text: 'Do you choose to be drunk until dusk?'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChooseYesNo({
				id: 'organ_grinder_other_1',
				text: 'Do you choose to be drunk until dusk?'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'organ_grinder_about_to_die',
				label: 'About to die',
				type: 'assigned',
				text: 'Being voted on in secret.'
			}),
			Factory.createPlayerModifier({
				id: 'organ_grinder_drunk',
				label: 'Drunk',
				type: 'self',
				text: 'The Organ Grinder chose to be drunk until dusk.',
				effects: [
					Factory.createEffectIsDrunk({
						id: 'organ_grinder_drunk_drunk'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'pithag',
		name: 'Pit-Hag',
		role: RoleType.Minion,
		ability: 'Each night*, choose a player and a character that is not in play: they become that character. If a Demon is made, deaths tonight are arbitrary.',
		jinxes: [
			Factory.createJinx({
				characterID: 'cultleader',
				text: 'If the Pit-Hag turns an evil player into the Cult Leader, they can\'t turn good due to their own ability.'
			}),
			Factory.createJinx({
				characterID: 'damsel',
				text: 'If a Pit-Hag creates a Damsel, the Storyteller chooses which player it is.'
			}),
			Factory.createJinx({
				characterID: 'goon',
				text: 'If the Pit-Hag turns an evil player into the Goon, they can\'t turn good due to their own ability.'
			}),
			Factory.createJinx({
				characterID: 'ogre',
				text: 'If the Pit-Hag turns an evil player into the Ogre, they can\'t turn good due to their own ability.'
			}),
			Factory.createJinx({
				characterID: 'politician',
				text: 'If the Pit-Hag turns an evil player into the Politician, they can\'t turn good due to their own ability.'
			}),
			Factory.createJinx({
				characterID: 'villageidiot',
				text: 'If there is a spare token, the Pit-Hag can create an extra Village Idiot. If so, the drunk Village Idiot might change.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'pit_hag_other_1',
				text: 'Choose a player',
				min: 1,
				max: 1
			}),
			Factory.createShowPlayerChooseCharacters({
				id: 'pit_hag_other_2',
				text: 'Choose a character that is not in play',
				min: 1,
				max: 1,
				inPlay: false
			})
		]
	}),
	Factory.createCharacter({
		id: 'poisoner',
		name: 'Poisoner',
		role: RoleType.Minion,
		ability: 'Each night, choose a player: they are poisoned tonight and tomorrow.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'poisoner_first_1',
				text: 'Choose a player',
				outcome: { modifierID: 'poisoner_poisoned', action: 'place' },
				min: 1,
				max: 1
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'poisoner_other_1',
				text: 'Choose a player',
				outcome: { modifierID: 'poisoner_poisoned', action: 'place' },
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'poisoner_poisoned',
				label: 'Poisoned',
				type: 'assigned',
				expires: 'dusk',
				text: 'Poisoned tonight and tomorrow day.',
				effects: [
					Factory.createEffectIsPoisoned({
						id: 'poisoner_poisoned_poisoned'
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'psychopath',
		name: 'Psychopath',
		role: RoleType.Minion,
		ability: 'Each day, before nominations, you may publicly choose a player: they die. If executed, you only die if you lose roshambo.'
	}),
	Factory.createCharacter({
		id: 'scarletwoman',
		name: 'Scarlet Woman',
		role: RoleType.Minion,
		ability: 'If five or more players are alive (not counting Travellers) and the Demon dies, you become the Demon.',
		jinxes: [
			Factory.createJinx({
				characterID: 'alhadikhia',
				text: 'If there would be two Demons, one of which was the Scarlet Woman, the Scarlet Woman becomes the Scarlet Woman again.'
			}),
			Factory.createJinx({
				characterID: 'fanggu',
				text: 'If there would be two Demons, one of which was the Scarlet Woman, the Scarlet Woman remains the Scarlet Woman.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerYouAre({
				id: 'scarlet_woman_other_1',
				text: 'You are now',
				note: 'Only if the Scarlet Woman became the Demon today',
				includeAlignment: false
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'scarlet_woman_demon',
				label: 'Demon',
				type: 'self',
				text: 'The Scarlet Woman has become the Demon.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'spy',
		name: 'Spy',
		role: RoleType.Minion,
		ability: 'Each night, you see the Grimoire. You might register as good, and as a Townsfolk or Outsider, even if dead.',
		jinxes: [
			Factory.createJinx({
				characterID: 'damsel',
				text: 'If the Spy is (or has been) in play, the Damsel is poisoned.'
			}),
			Factory.createJinx({
				characterID: 'ogre',
				text: 'The Spy registers as evil to the Ogre.'
			}),
			Factory.createJinx({
				characterID: 'poppygrower',
				text: 'If the Poppy Grower has their ability, the Spy does not see the Grimoire.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerGrimoire({
				id: 'spy_first_1',
				text: 'This is the Grimoire'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerGrimoire({
				id: 'spy_other_1',
				text: 'This is the Grimoire'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'spy_misregisters',
				label: 'Misregisters',
				type: 'self',
				text: 'The Spy might register as good, and as a Townsfolk or Outsider, even if dead.',
				effects: [
					Factory.createEffectCanRegisterAs({
						id: 'spy_misregisters_registers',
						registerAs: [ AlignmentType.Good, RoleType.Townsfolk, RoleType.Outsider ],
						onlyToOwner: false
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'summoner',
		name: 'Summoner',
		role: RoleType.Minion,
		ability: 'You get three bluffs. On the third night, choose a player: they become an evil Demon of your choice.',
		jinxes: [
			Factory.createJinx({
				characterID: 'clockmaker',
				text: 'The Summoner registers as the Demon to the Clockmaker.'
			}),
			Factory.createJinx({
				characterID: 'courtier',
				text: 'If the living Summoner has no ability, the Storyteller has the Summoner ability.'
			}),
			Factory.createJinx({
				characterID: 'engineer',
				text: 'If the living Summoner is removed from play, the Storyteller has the Summoner ability.'
			}),
			Factory.createJinx({
				characterID: 'hatter',
				text: 'If the Summoner creates a second living Demon, deaths tonight are arbitrary.'
			}),
			Factory.createJinx({
				characterID: 'kazali',
				text: 'If the Summoner creates a second living Demon, deaths tonight are arbitrary.'
			}),
			Factory.createJinx({
				characterID: 'lordoftyphon',
				text: 'If a Lord of Typhon is summoned, they must neighbor a Minion & their other neighbor becomes an evil Minion.'
			}),
			Factory.createJinx({
				characterID: 'pithag',
				text: 'If the Summoner creates a second living Demon, deaths tonight are arbitrary.'
			}),
			Factory.createJinx({
				characterID: 'poppygrower',
				text: 'If the Poppy Grower is alive on the 3rd night, the Summoner chooses which Demon but not which player.'
			}),
			Factory.createJinx({
				characterID: 'preacher',
				text: 'If the living Summoner has no ability, the Storyteller has the Summoner ability.'
			}),
			Factory.createJinx({
				characterID: 'pukka',
				text: 'The Summoner may summon a Pukka on the 2nd night instead of the 3rd.'
			}),
			Factory.createJinx({
				characterID: 'zombuul',
				text: 'If the Summoner summons a dead player into the Zombuul, the Zombuul has already "died once".'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerBluffsAre({
				id: 'summoner_first_1',
				text: 'These characters are not in play',
				note: 'Three bluffs'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'summoner_other_1',
				text: 'Choose a player to become a Demon',
				note: 'Only on the third night',
				min: 1,
				max: 1
			}),
			Factory.createShowPlayerChooseCharacters({
				id: 'summoner_other_2',
				text: 'Choose which Demon they become',
				min: 1,
				max: 1,
				types: [ RoleType.Demon ]
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'summoner_mod',
				label: '',
				text: 'No Demon',
				adjustments: [
					Factory.createBagAdjustmentSetRoleCount({
						role: RoleType.Demon,
						count: 0
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'summoner_night_1',
				label: 'Night 1',
				type: 'self',
				text: 'The Summoner\'s first night.'
			}),
			Factory.createPlayerModifier({
				id: 'summoner_night_2',
				label: 'Night 2',
				type: 'self',
				text: 'The Summoner\'s second night.'
			}),
			Factory.createPlayerModifier({
				id: 'summoner_night_3',
				label: 'Night 3',
				type: 'self',
				text: 'The Summoner\'s third night: they make a Demon.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'vizier',
		name: 'Vizier',
		role: RoleType.Minion,
		ability: 'Everyone knows you are the Vizier. You cannot die during the day. If good players voted, you may choose to execute immediately.',
		jinxes: [
			Factory.createJinx({
				characterID: 'alsaahir',
				text: 'The Storyteller doesn\'t declare the Vizier is in play.'
			}),
			Factory.createJinx({
				characterID: 'courtier',
				text: 'If the Vizier loses their ability, they learn this, and cannot die during the day.'
			}),
			Factory.createJinx({
				characterID: 'fearmonger',
				text: 'The Vizier wakes with the Fearmonger, learns who they choose and cannot choose to immediately execute that player.'
			}),
			Factory.createJinx({
				characterID: 'investigator',
				text: 'The Storyteller doesn\'t declare the Vizier is in play.'
			}),
			Factory.createJinx({
				characterID: 'politician',
				text: 'The Politician might register as evil to the Vizier.'
			}),
			Factory.createJinx({
				characterID: 'preacher',
				text: 'If the Vizier loses their ability, they learn this, and cannot die during the day.'
			}),
			Factory.createJinx({
				characterID: 'zealot',
				text: 'The Zealot might register as evil to the Vizier.'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'vizier_cannot_die',
				label: 'Cannot die',
				type: 'self',
				text: 'The Vizier cannot die during the day.',
				effects: [
					Factory.createEffectIsProtected({
						id: 'vizier_cannot_die_protected',
						fromExecution: true,
						fromMurder: false
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'widow',
		name: 'Widow',
		role: RoleType.Minion,
		ability: 'On your first night, look at the Grimoire and choose a player: they are poisoned. One good player knows a Widow is in play.',
		jinxes: [
			Factory.createJinx({
				characterID: 'damsel',
				text: 'If the Widow is (or has been) in play, the Damsel is poisoned.'
			}),
			Factory.createJinx({
				characterID: 'poppygrower',
				text: 'If the Poppy Grower has their ability, the Widow does not see the Grimoire.'
			})
		],
		wakesFirstNight: [
			Factory.createShowPlayerGrimoire({
				id: 'widow_first_1',
				text: 'This is the Grimoire'
			}),
			Factory.createShowPlayerChoosePlayers({
				id: 'widow_first_2',
				text: 'Choose a player',
				outcome: { modifierID: 'widow_poisoned', action: 'place' },
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'widow_poisoned',
				label: 'Poisoned',
				type: 'assigned',
				text: 'Poisoned by the Widow.',
				effects: [
					Factory.createEffectIsPoisoned({
						id: 'widow_poisoned_poisoned'
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'widow_knows',
				label: 'Knows',
				type: 'assigned',
				text: 'The good player who knows a Widow is in play.',
				restrictions: [ AlignmentType.Good ],
				effects: [
					Factory.createEffectIsWoken({
						id: 'widow_knows_woken',
						nights: 'first',
						show: [
							Factory.createShowPlayerCharacter({
								id: 'widow_knows_woken_character',
								text: 'This character is in play',
								note: 'The Widow'
							})
						]
					})
				]
			})
		]
	}),
	Factory.createCharacter({
		id: 'witch',
		name: 'Witch',
		role: RoleType.Minion,
		ability: 'Each night, choose a player: if they nominate tomorrow, they die. If only three players are alive, you lose this ability.',
		wakesFirstNight: [
			Factory.createShowPlayerChoosePlayers({
				id: 'witch_first_1',
				text: 'Choose a player',
				outcome: { modifierID: 'witch_cursed', action: 'place' },
				min: 1,
				max: 1
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChoosePlayers({
				id: 'witch_other_1',
				text: 'Choose a player',
				outcome: { modifierID: 'witch_cursed', action: 'place' },
				min: 1,
				max: 1
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'witch_cursed',
				label: 'Cursed',
				type: 'assigned',
				expires: 'dusk',
				text: 'If they nominate tomorrow, they die.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'wizard',
		name: 'Wizard',
		role: RoleType.Minion,
		ability: 'Once per game, choose to make a wish. If it is granted, it might come at a price and leave a clue to what it was.',
		wakesFirstNight: [
			Factory.createShowPlayerChooseYesNo({
				id: 'wizard_first_1',
				note: 'Once per game',
				text: 'Do you make a wish?'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerChooseYesNo({
				id: 'wizard_other_1',
				note: 'Once per game',
				text: 'Do you make a wish?'
			})
		],
		modifiers: [
			Factory.createPlayerModifier({
				id: 'wizard_no_ability',
				label: 'No ability',
				type: 'self',
				text: 'The Wizard has used their ability.'
			}),
			Factory.createPlayerModifier({
				id: 'wizard_clue',
				label: 'Clue',
				type: 'assigned',
				text: 'A clue to the Wizard\'s wish.'
			})
		]
	}),
	Factory.createCharacter({
		id: 'wraith',
		name: 'Wraith',
		role: RoleType.Minion,
		ability: 'You may open your eyes at night. You wake whenever other evil players do.'
	}),
	Factory.createCharacter({
		id: 'xaan',
		name: 'Xaan',
		role: RoleType.Minion,
		ability: 'On night X, every Townsfolk is poisoned until dusk.',
		wakesFirstNight: [
			Factory.createShowPlayerStorytellerAction({
				id: 'xaan_first_1',
				action: 'If tonight is night X, all Townsfolk are poisoned until dusk.'
			})
		],
		wakesOtherNights: [
			Factory.createShowPlayerStorytellerAction({
				id: 'xaan_other_1',
				action: 'If tonight is night X, all Townsfolk are poisoned until dusk.'
			})
		],
		modifiers: [
			Factory.createBagModifier({
				id: 'xaan_mod',
				label: '',
				text: 'X Outsiders',
				adjustments: [
					Factory.createBagAdjustmentSetRoleCount({
						role: RoleType.Outsider,
						count: null
					})
				]
			}),
			Factory.createPlayerModifier({
				id: 'xaan_night_1',
				label: 'Night 1',
				type: 'self',
				text: 'Night 1.'
			}),
			Factory.createPlayerModifier({
				id: 'xaan_night_2',
				label: 'Night 2',
				type: 'self',
				text: 'Night 2.'
			}),
			Factory.createPlayerModifier({
				id: 'xaan_night_3',
				label: 'Night 3',
				type: 'self',
				text: 'Night 3.'
			}),
			Factory.createPlayerModifier({
				id: 'xaan_x',
				label: 'X',
				type: 'self',
				text: 'On night X, every Townsfolk is poisoned until dusk.'
			})
		]
	})
];
