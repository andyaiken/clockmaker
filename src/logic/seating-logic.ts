import type { SeatingRequirement, SeatingRequirementNeighboursSameAlignment } from '../models/seating-requirement';
import { AlignmentType } from '../enums/alignment-type';
import type { Character } from '../models/character';
import { CharacterLogic } from './character-logic';
import type { Game } from '../models/game';
import { ModifierType } from '../enums/modifier-type';
import type { RoleType } from '../enums/role-type';
import type { SeatingModifier } from '../models/modifier';
import { SeatingRequirementType } from '../enums/seating-requirement-type';
import { Utility } from '../utils/utility';

// A seat during setup; a seat with no character yet could take anything still in the bag
interface Seat {
	playerID: string;
	character: Character | null;
	alignment: AlignmentType;
}

interface Layout {
	seats: Seat[];
	bag: Character[];
}

// Where the character with a seating modifier is: in a seat, still in the bag, or not seated at all (eg a Fabled)
type Owner = { type: 'seat', index: number } | { type: 'bag' } | { type: 'none' };

interface Entry {
	character: Character;
	owner: Owner;
	modifier: SeatingModifier;
}

export interface SeatingProblem {
	character: Character;
	text: string;
}

export class SeatingLogic {
	// Seating modifiers that can no longer be met, given the characters placed so far and those left in the bag
	static getProblems = (game: Game): SeatingProblem[] => {
		const layout = SeatingLogic.getLayout(game);
		return SeatingLogic.getEntries(game, layout)
			.filter(entry => !SeatingLogic.isEntryPossible(layout, entry))
			.map(entry => ({ character: entry.character, text: entry.modifier.data.text }));
	};

	// The seats where placing this bag character keeps every seating modifier achievable
	// Returns null when that gives no guidance: every seat works, or none does
	static getSuggestedPlayerIDs = (game: Game, characterID: string): string[] | null => {
		const layout = SeatingLogic.getLayout(game);
		const character = layout.bag.find(c => c.id === characterID);
		if (!character) {
			return null;
		}

		// Requirements that are already broken can't be helped by this placement, so they're ignored
		const possible = SeatingLogic.getEntries(game, layout).filter(entry => SeatingLogic.isEntryPossible(layout, entry));
		if (possible.length === 0) {
			return null;
		}

		const suggested = game.players.filter((_, index) => {
			const placed = SeatingLogic.place(layout, character, index);
			// The placed character's own modifiers now belong to its seat
			return possible
				.map(entry => (entry.owner.type === 'bag') && (entry.character === character) ? { ...entry, owner: { type: 'seat', index: index } as Owner } : entry)
				.every(entry => SeatingLogic.isEntryPossible(placed, entry));
		});

		if ((suggested.length === 0) || (suggested.length === game.players.length)) {
			return null;
		}

		return suggested.map(p => p.id);
	};

	// Puts the bag's characters into the empty seats at random, keeping every seating modifier that is still achievable
	// If no arrangement can be found, the characters are placed at random anyway and the problems show as warnings
	static assignRandomly = (game: Game): Game => {
		const start = SeatingLogic.getLayout(game);
		const key = (entry: Entry) => `${entry.character.id}:${entry.modifier.id}`;
		const keep = new Set(SeatingLogic.getEntries(game, start).filter(e => SeatingLogic.isEntryPossible(start, e)).map(key));
		const isValid = (layout: Layout) => SeatingLogic.getEntries(game, layout)
			.filter(e => keep.has(key(e)))
			.every(e => SeatingLogic.isEntryPossible(layout, e));
		const getEmpty = (layout: Layout) => layout.seats.map((seat, index) => ({ seat, index })).filter(s => !s.seat.character).map(s => s.index);

		// A depth-first search over random choices, with a limit so a large impossible setup can't hang the app
		let budget = 5000;
		const solve = (layout: Layout): Layout | null => {
			const empty = getEmpty(layout);
			if ((layout.bag.length === 0) || (empty.length === 0)) {
				return layout;
			}

			const character = layout.bag[ 0 ];
			for (const index of Utility.shuffle(empty)) {
				if (--budget < 0) {
					return null;
				}
				const next = SeatingLogic.place(layout, character, index);
				if (isValid(next)) {
					const solved = solve(next);
					if (solved) {
						return solved;
					}
				}
			}
			return null;
		};

		// Characters the seating modifiers care about are placed first, while there's still room to arrange them
		const types = SeatingLogic.getEntries(game, start)
			.flatMap(e => e.modifier.data.requirements)
			.flatMap(r => r.type === SeatingRequirementType.NeighboursSameAlignment ? [] : r.data.types);
		const isInvolved = (c: Character) => c.modifiers.some(m => m.type === ModifierType.SeatingModifier)
			|| SeatingLogic.characterMatches(c, CharacterLogic.getAlignment(c.role), types);
		const bag = Utility.shuffle(start.bag);
		const shuffled = { ...start, bag: [ ...bag.filter(isInvolved), ...bag.filter(c => !isInvolved(c)) ] };
		const result = solve(shuffled)
			?? Utility.shuffle(getEmpty(shuffled)).reduce((layout, index) => layout.bag.length > 0 ? SeatingLogic.place(layout, layout.bag[ 0 ], index) : layout, shuffled);

		return {
			...game,
			players: game.players.map((p, index) => ({ ...p, character: result.seats[ index ].character, alignment: result.seats[ index ].alignment })),
			bag: result.bag
		};
	};

	private static getLayout = (game: Game): Layout => {
		return {
			seats: game.players.map(p => ({ playerID: p.id, character: p.character, alignment: p.alignment })),
			bag: game.bag
		};
	};

	private static getEntries = (game: Game, layout: Layout): Entry[] => {
		const entries: Entry[] = [];
		const add = (character: Character, owner: Owner) => {
			character.modifiers
				.filter(m => m.type === ModifierType.SeatingModifier)
				.forEach(m => entries.push({ character, owner, modifier: m }));
		};

		layout.seats.forEach((seat, index) => {
			if (seat.character) {
				add(seat.character, { type: 'seat', index });
			}
		});
		layout.bag.forEach(c => add(c, { type: 'bag' }));
		game.otherCharacters.forEach(c => add(c, { type: 'none' }));

		return entries;
	};

	// Puts a bag character in a seat; whoever was there goes back into the bag
	private static place = (layout: Layout, character: Character, index: number): Layout => {
		const previous = layout.seats[ index ];
		const bagIndex = layout.bag.indexOf(character);
		const bag = layout.bag.filter((_, n) => n !== bagIndex);
		if (previous.character) {
			bag.push(previous.character);
		}

		return {
			seats: layout.seats.map((seat, n) =>
				n === index
					? { ...seat, character, alignment: CharacterLogic.getAlignment(character.role) ?? seat.alignment }
					: seat),
			bag
		};
	};

	private static isEntryPossible = (layout: Layout, entry: Entry): boolean => {
		const requirements = entry.modifier.data.requirements;
		switch (entry.owner.type) {
			case 'seat': {
				const index = entry.owner.index;
				return requirements.every(r => SeatingLogic.isPossible(layout, index, entry.character, r));
			}
			case 'bag':
				// It's still to be placed, so it needs at least one empty seat that would work
				return layout.seats.some((seat, index) => {
					if (seat.character) {
						return false;
					}
					const placed = SeatingLogic.place(layout, entry.character, index);
					return requirements.every(r => SeatingLogic.isPossible(placed, index, entry.character, r));
				});
			case 'none':
				return requirements.every(r => SeatingLogic.isPossible(layout, null, entry.character, r));
		}
	};

	private static characterMatches = (character: Character, alignment: AlignmentType | null, types: (AlignmentType | RoleType)[]) => {
		return types.some(t => (t === character.role) || (t === alignment));
	};

	private static seatMatches = (seat: Seat, types: (AlignmentType | RoleType)[]) => {
		return (seat.character !== null) && SeatingLogic.characterMatches(seat.character, seat.alignment, types);
	};

	private static countBagMatches = (layout: Layout, types: (AlignmentType | RoleType)[]) => {
		return layout.bag.filter(c => SeatingLogic.characterMatches(c, CharacterLogic.getAlignment(c.role), types)).length;
	};

	// Whether the requirement is met, or could still be met by filling the empty seats from the bag
	private static isPossible = (layout: Layout, ownerIndex: number | null, owner: Character, requirement: SeatingRequirement): boolean => {
		const count = layout.seats.length;
		const at = (index: number) => layout.seats[ ((index % count) + count) % count ];

		switch (requirement.type) {
			case SeatingRequirementType.Neighbours: {
				if ((ownerIndex === null) || (count < 2)) {
					return ownerIndex === null;
				}
				const inBag = SeatingLogic.countBagMatches(layout, requirement.data.types) > 0;
				return [ at(ownerIndex - 1), at(ownerIndex + 1) ]
					.some(seat => SeatingLogic.seatMatches(seat, requirement.data.types) || (!seat.character && inBag));
			}
			case SeatingRequirementType.InLine: {
				const types = requirement.data.types;
				const matching = layout.seats.map((seat, index) => ({ seat, index })).filter(s => SeatingLogic.seatMatches(s.seat, types)).map(s => s.index);
				const blocked = layout.seats.map((seat, index) => ({ seat, index })).filter(s => s.seat.character && !SeatingLogic.seatMatches(s.seat, types)).map(s => s.index);
				// The line must be long enough for everyone of these types, both seated and still in the bag
				const length = matching.length + SeatingLogic.countBagMatches(layout, types);
				const middle = requirement.data.ownerInMiddle && (ownerIndex !== null);

				if (length >= count) {
					return blocked.length === 0;
				}
				if (middle && (length < 3)) {
					return false;
				}

				// Try every arc of that length: it must hold every matching player and nobody else
				for (let start = 0; start < count; ++start) {
					const arc = Array.from({ length }, (_, n) => (start + n) % count);
					if (blocked.some(i => arc.includes(i)) || !matching.every(i => arc.includes(i))) {
						continue;
					}
					if (middle && !arc.slice(1, -1).includes(ownerIndex)) {
						continue;
					}
					return true;
				}
				return false;
			}
			case SeatingRequirementType.NeighboursSameAlignment: {
				if (count < 2) {
					return false;
				}
				const canBe = (seat: Seat, alignment: AlignmentType) => seat.character
					? seat.alignment === alignment
					: layout.bag.some(c => CharacterLogic.getAlignment(c.role) === alignment);
				const sameAlignment = (a: Seat, b: Seat) => [ AlignmentType.Good, AlignmentType.Evil ].some(al => canBe(a, al) && canBe(b, al));

				// Once the pair has been marked, it's those two players that must be neighbours of the same alignment
				// Games saved before the marker was added have no data here, so it's read defensively
				const markerID = (requirement.data as SeatingRequirementNeighboursSameAlignment[ 'data' ] | null)?.modifierID ?? null;
				const marker = owner.modifiers.find(m => (m.type === ModifierType.PlayerModifier) && (m.id === markerID));
				const pairIDs = marker?.type === ModifierType.PlayerModifier ? marker.data.playerIDs : [];
				if (pairIDs.length === 2) {
					const [ a, b ] = pairIDs.map(id => layout.seats.findIndex(seat => seat.playerID === id));
					if ((a === -1) || (b === -1)) {
						return false;
					}
					const neighbours = ((a + 1) % count === b) || ((b + 1) % count === a);
					return neighbours && sameAlignment(layout.seats[ a ], layout.seats[ b ]);
				}

				return layout.seats.some((seat, index) => sameAlignment(seat, at(index + 1)));
			}
		}
	};
}
