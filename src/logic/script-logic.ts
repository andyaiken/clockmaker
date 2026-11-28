import type { Character } from '../models/character';
import { CharacterLogic } from './character-logic';
import { Factory } from './factory';
import { RoleType } from '../enums/role-type';
import type { Script } from '../models/script';
import { ScriptType } from '../enums/script-type';
import { Utility } from '../utils/utility';
import { scripts } from '../data/scripts';

interface OfficialScriptMeta {
	id: '_meta';
	name: string;
	author?: string;
	almanac?: string;
}

export class ScriptLogic {
	// The roles a script can contain; Fabled and Loric are chosen per game
	static scriptRoles = [ RoleType.Townsfolk, RoleType.Outsider, RoleType.Minion, RoleType.Demon, RoleType.Traveller ];

	static getScriptTypeForPlayerCount = (count: number): ScriptType | null => {
		if ((count === 5) || (count === 6)) {
			return ScriptType.Teensy;
		}

		if (count > 6) {
			return ScriptType.RavenswoodBluff;
		}

		return null;
	};

	// How many of each role a script usually has
	static getSuggestedCounts = (type: ScriptType): Partial<Record<RoleType, { min: number, max: number }>> => {
		switch (type) {
			case ScriptType.Teensy:
				return {
					[ RoleType.Townsfolk ]: { min: 6, max: 6 },
					[ RoleType.Outsider ]: { min: 2, max: 2 },
					[ RoleType.Minion ]: { min: 2, max: 2 },
					[ RoleType.Demon ]: { min: 1, max: 2 }
				};
			case ScriptType.RavenswoodBluff:
				return {
					[ RoleType.Townsfolk ]: { min: 13, max: 13 },
					[ RoleType.Outsider ]: { min: 4, max: 4 },
					[ RoleType.Minion ]: { min: 4, max: 4 },
					[ RoleType.Demon ]: { min: 4, max: 4 }
				};
		}
	};

	static getBuiltInScripts = (): Script[] => {
		return scripts;
	};

	static getScripts = (homebrew: Script[]): Script[] => {
		return [ ...scripts, ...homebrew ];
	};

	// The script's characters, in the order they're listed. Any ID we no longer know is skipped rather than failing.
	static getCharacters = (script: Script): Character[] => {
		const known = CharacterLogic.getCharacters();
		return script.characterIDs.map(id => known.find(c => c.id === id)).filter(c => c !== undefined);
	};

	static createHomebrew = (): Script => {
		return Factory.createScript({
			id: Utility.guid(),
			name: 'New Script',
			type: ScriptType.RavenswoodBluff,
			isHomebrew: true
		});
	};

	static copyAsHomebrew = (script: Script): Script => {
		return Factory.createScript({
			id: Utility.guid(),
			name: `${script.name} (copy)`,
			type: script.type,
			isHomebrew: true,
			author: script.author,
			almanac: script.almanac,
			characterIDs: [ ...script.characterIDs ]
		});
	};

	// Only web links are opened, so a pasted 'javascript:' URL can't run anything
	static getAlmanacLink = (script: Script): string | null => {
		const url = script.almanac?.trim() ?? '';
		return /^https?:\/\//i.test(url) ? url : null;
	};

	// The official script JSON format (script-schema.json in ThePandemoniumInstitute/botc-release):
	// a _meta object, then each official character as a bare ID string
	static toOfficialJSON = (script: Script): (OfficialScriptMeta | string)[] => {
		const meta: OfficialScriptMeta = { id: '_meta', name: script.name.trim().slice(0, 50) || 'Untitled script' };
		const author = script.author?.trim().slice(0, 50);
		if (author) {
			meta.author = author;
		}
		const almanac = ScriptLogic.getAlmanacLink(script);
		if (almanac && almanac.length <= 250) {
			meta.almanac = almanac;
		}
		return [ meta, ...ScriptLogic.getCharacters(script).map(c => c.id) ];
	};

	// Reads a script in the official JSON format. Only characters we know are added; the rest are listed in 'skipped'.
	// Throws an Error with a readable message if the data isn't a script at all.
	static fromOfficialJSON = (data: unknown): { script: Script, skipped: string[] } => {
		if (!Array.isArray(data)) {
			throw new Error('This file isn\'t a script: it should be a list of characters.');
		}

		const known = CharacterLogic.getCharacters();
		const script = ScriptLogic.createHomebrew();
		const skipped: string[] = [];
		let hasMeta = false;

		data.forEach((entry: unknown) => {
			// Official characters are bare IDs; older scripts wrap them as { "id": "..." }
			const id = typeof entry === 'string'
				? entry
				: (typeof entry === 'object') && (entry !== null) && (typeof (entry as { id?: unknown }).id === 'string')
					? (entry as { id: string }).id
					: null;
			if (id === null) {
				skipped.push('An entry that isn\'t a character');
				return;
			}

			if (id === '_meta') {
				const meta = entry as { name?: unknown, author?: unknown, almanac?: unknown };
				hasMeta = true;
				script.name = typeof meta.name === 'string' && meta.name.trim() ? meta.name.trim().slice(0, 50) : script.name;
				script.author = typeof meta.author === 'string' ? meta.author.trim().slice(0, 50) : '';
				script.almanac = typeof meta.almanac === 'string' ? meta.almanac.trim().slice(0, 250) : '';
				return;
			}

			// A full character object (with an ability) is a homebrew character, which we can't add yet
			const name = (typeof entry === 'object') && (typeof (entry as { name?: unknown }).name === 'string') ? (entry as { name: string }).name : id;
			if ((typeof entry === 'object') && ('ability' in (entry as object))) {
				skipped.push(`${name} (homebrew character)`);
				return;
			}

			// Our IDs are the official ones; tidying the ID also accepts forms like 'Fortune_Teller'
			const officialID = id.toLowerCase().replace(/[^a-z0-9]/g, '');
			const character = known.find(c => c.id === officialID);
			if (!character) {
				skipped.push(`${name} (unknown character)`);
			} else if (!ScriptLogic.scriptRoles.includes(character.role)) {
				skipped.push(`${character.name} (${CharacterLogic.getPlural(character.role)} are chosen for each game)`);
			} else if (!script.characterIDs.includes(character.id)) {
				script.characterIDs.push(character.id);
			}
		});

		if (!hasMeta && (script.characterIDs.length === 0)) {
			throw new Error('This file doesn\'t contain any characters we know.');
		}

		script.characterIDs = ScriptLogic.sortCharacterIDs(script.characterIDs);
		return { script: script, skipped: skipped };
	};

	// Puts character IDs in the same order as the character data (so by role, then as listed)
	static getCharactersOfRole = (script: Script, role: RoleType): Character[] => {
		return ScriptLogic.getCharacters(script).filter(c => c.role === role);
	};

	// eg '13 of 13', against the suggested number for this script type; just the count when there's no suggestion
	static getCountLabel = (type: ScriptType, role: RoleType, count: number) => {
		const range = ScriptLogic.getSuggestedCounts(type)[ role ];
		if (!range) {
			return `${count}`;
		}
		return `${count} of ${range.min === range.max ? range.min : `${range.min}–${range.max}`}`;
	};

	// More characters of this role than this script type usually has
	static isOverSuggested = (type: ScriptType, role: RoleType, count: number) => {
		const range = ScriptLogic.getSuggestedCounts(type)[ role ];
		return range ? (count > range.max) : false;
	};

	// Characters that could be added to a homebrew script
	static getAddableCharacters = (script: Script): Character[] => {
		return CharacterLogic.getCharacters()
			.filter(c => ScriptLogic.scriptRoles.includes(c.role))
			.filter(c => !script.characterIDs.includes(c.id));
	};

	static addCharacter = (script: Script, characterID: string): Script => {
		return { ...script, characterIDs: ScriptLogic.sortCharacterIDs([ ...script.characterIDs, characterID ]) };
	};

	static removeCharacter = (script: Script, characterID: string): Script => {
		return { ...script, characterIDs: script.characterIDs.filter(id => id !== characterID) };
	};

	static findScript = (homebrew: Script[], id: string | null): Script | null => {
		return ScriptLogic.getScripts(homebrew).find(s => s.id === id) ?? null;
	};

	// Replaces a homebrew script with its edited version
	static updateHomebrew = (homebrew: Script[], script: Script): Script[] => {
		return homebrew.map(h => h.id === script.id ? script : h);
	};

	static removeHomebrew = (homebrew: Script[], id: string): Script[] => {
		return homebrew.filter(h => h.id !== id);
	};

	// A script as an official-format JSON file
	static getExport = (script: Script) => {
		return {
			filename: `${Utility.toFilename(script.name, 'script')}.json`,
			json: JSON.stringify(ScriptLogic.toOfficialJSON(script), null, '\t')
		};
	};

	// Reads an official-format JSON file; the message says what was left out, or why it couldn't be read
	static importJSON = (filename: string, text: string): { script: Script | null, message: { type: 'warning' | 'error', text: string } | null } => {
		try {
			const { script, skipped } = ScriptLogic.fromOfficialJSON(JSON.parse(text));
			return {
				script: script,
				message: skipped.length > 0
					? { type: 'warning', text: `Imported ${script.name}, but left out: ${skipped.join(', ')}. The script type is set to ${script.type}; change it if needed.` }
					: null
			};
		} catch (e) {
			const reason = e instanceof SyntaxError ? 'This file isn\'t valid JSON.' : e instanceof Error ? e.message : 'This file couldn\'t be imported.';
			return { script: null, message: { type: 'error', text: `Couldn't import ${filename}. ${reason}` } };
		}
	};

	static sortCharacterIDs = (ids: string[]): string[] => {
		const order = CharacterLogic.getCharacters().map(c => c.id);
		return [ ...ids ].sort((a, b) => order.indexOf(a) - order.indexOf(b));
	};
}
