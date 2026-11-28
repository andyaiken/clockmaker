import { AlignmentType } from '../enums/alignment-type';
import type { Character } from '../models/character';
import { RoleType } from '../enums/role-type';

import { Demons } from '../data/characters/demons';
import { Fabled } from '../data/characters/fabled';
import { Lorics } from '../data/characters/lorics';
import { Minions } from '../data/characters/minions';
import { Outsiders } from '../data/characters/outsiders';
import { Townsfolk } from '../data/characters/townsfolk';
import { Travellers } from '../data/characters/travellers';

export class CharacterLogic {
	static getCharacters = () => {
		return [ ...Townsfolk, ...Outsiders, ...Minions, ...Demons, ...Travellers, ...Fabled, ...Lorics ];
	};

	static getCharacter = (id: string): Character => {
		const character = CharacterLogic.getCharacters().find(c => c.id === id);
		if (!character) {
			throw new Error(`Unknown character: ${id}`);
		}
		return character;
	};

	static getAlignment = (role: RoleType): AlignmentType | null => {
		switch (role) {
			case RoleType.Townsfolk:
			case RoleType.Outsider:
				return AlignmentType.Good;
			case RoleType.Minion:
			case RoleType.Demon:
				return AlignmentType.Evil;
		}

		return null;
	};

	// The jinxes between characters in this set, each listed once (on the character that holds it)
	static getJinxes = (characters: Character[]) => {
		const jinxes: { character: Character, other: Character, text: string }[] = [];
		characters.forEach(character => {
			// Characters copied into games saved before jinxes existed don't have them, so fall back to the built-in data
			const list = character.jinxes ?? CharacterLogic.getCharacters().find(c => c.id === character.id)?.jinxes ?? [];
			list.forEach(jinx => {
				const other = characters.find(c => c.id === jinx.characterID);
				if (other && !jinxes.some(j => (j.character.id === character.id) && (j.other.id === other.id))) {
					jinxes.push({ character: character, other: other, text: jinx.text });
				}
			});
		});
		return jinxes;
	};

	static filterByRole = (characters: Character[], role: RoleType) => {
		return characters.filter(c => c.role === role);
	};

	// Fabled and Loric can be added by the Storyteller at any time
	static getFabledAndLoric = () => {
		return CharacterLogic.getCharacters().filter(c => (c.role === RoleType.Fabled) || (c.role === RoleType.Loric));
	};

	// Two-word names take their initials (FT); one-word names take their first two letters (Oj). A hyphen splits words.
	static getMonogram = (name: string): string => {
		const words = CharacterLogic.getMonogramWords(name);
		if (words.length === 0) {
			return '?';
		}
		if (words.length > 1) {
			return (words[ 0 ][ 0 ] + words[ 1 ][ 0 ]).toUpperCase();
		}
		const word = words[ 0 ];
		return word[ 0 ].toUpperCase() + (word[ 1 ] ?? '').toLowerCase();
	};

	// A monogram for each of these characters, keyed by ID. When two would match, the later one keeps its
	// first letter and takes the next letter of its name that gives a monogram nobody has (eg Butler Bu, Bureaucrat Br).
	static getMonograms = (characters: Character[]): Map<string, string> => {
		const monograms = new Map<string, string>();
		const used = new Set<string>();

		characters.forEach(c => {
			if (monograms.has(c.id)) {
				return;
			}

			let monogram = CharacterLogic.getMonogram(c.name);
			if (used.has(monogram)) {
				const letters = CharacterLogic.getMonogramWords(c.name).join('');
				const first = letters[ 0 ].toUpperCase();
				const free = letters.slice(1).split('')
					.map(l => first + l.toLowerCase())
					.find(m => !used.has(m));
				monogram = free ?? monogram;
			}

			monograms.set(c.id, monogram);
			used.add(monogram);
		});

		return monograms;
	};

	static getMonogramWords = (name: string) => {
		return name.replace(/[^A-Za-z\s-]/g, '').split(/[\s-]+/).filter(w => w.length > 0);
	};

	static getPlural = (role: RoleType): string => {
		switch (role) {
			case RoleType.Townsfolk:
			case RoleType.Fabled:
				return `${role}`;
		}

		return `${role}s`;
	};
}
