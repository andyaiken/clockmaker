import { Factory } from '../logic/factory';
import type { Script } from '../models/script';

export const scripts: Script[] = [
	Factory.createScript({
		id: 'tb',
		name: 'Trouble Brewing',
		author: 'The Pandemonium Institute',
		almanac: 'https://wiki.bloodontheclocktower.com/Trouble_Brewing',
		characterIDs: [
			// Townsfolk
			'washerwoman',
			'librarian',
			'investigator',
			'chef',
			'empath',
			'fortuneteller',
			'undertaker',
			'monk',
			'ravenkeeper',
			'virgin',
			'slayer',
			'soldier',
			'mayor',
			// Outsiders
			'butler',
			'drunk',
			'recluse',
			'saint',
			// Minions
			'poisoner',
			'spy',
			'scarletwoman',
			'baron',
			// Demons
			'imp',
			// Travellers
			'bureaucrat',
			'thief',
			'gunslinger',
			'scapegoat',
			'beggar'
		]
	}),
	Factory.createScript({
		id: 'bmr',
		name: 'Bad Moon Rising',
		author: 'The Pandemonium Institute',
		almanac: 'https://wiki.bloodontheclocktower.com/Bad_Moon_Rising',
		characterIDs: [
			// Townsfolk
			'grandmother',
			'sailor',
			'chambermaid',
			'exorcist',
			'innkeeper',
			'gambler',
			'gossip',
			'courtier',
			'professor',
			'minstrel',
			'tealady',
			'pacifist',
			'fool',
			// Outsiders
			'tinker',
			'moonchild',
			'goon',
			'lunatic',
			// Minions
			'godfather',
			'devilsadvocate',
			'assassin',
			'mastermind',
			// Demons
			'zombuul',
			'pukka',
			'shabaloth',
			'po',
			// Travellers
			'apprentice',
			'matron',
			'judge',
			'bishop',
			'voudon'
		]
	}),
	Factory.createScript({
		id: 'snv',
		name: 'Sects & Violets',
		author: 'The Pandemonium Institute',
		almanac: 'https://wiki.bloodontheclocktower.com/Sects_%26_Violets',
		characterIDs: [
			// Townsfolk
			'clockmaker',
			'dreamer',
			'snakecharmer',
			'mathematician',
			'flowergirl',
			'towncrier',
			'oracle',
			'savant',
			'seamstress',
			'philosopher',
			'artist',
			'juggler',
			'sage',
			// Outsiders
			'mutant',
			'sweetheart',
			'barber',
			'klutz',
			// Minions
			'eviltwin',
			'witch',
			'cerenovus',
			'pithag',
			// Demons
			'fanggu',
			'vigormortis',
			'nodashii',
			'vortox',
			// Travellers
			'barista',
			'harlot',
			'butcher',
			'bonecollector',
			'deviant'
		]
	})
];
