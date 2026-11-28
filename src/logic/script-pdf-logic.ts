import type { Character } from '../models/character';
import { CharacterLogic } from './character-logic';
import { NightOrder } from '../data/night-order';
import type { PDFColour } from '../utils/pdf-writer';
import { PDFWriter } from '../utils/pdf-writer';
import { RoleType } from '../enums/role-type';
import type { Script } from '../models/script';
import { ScriptLogic } from './script-logic';
import { Utility } from '../utils/utility';

// The light theme's role colours (src/themes.ts); paper is always light
const roleColours: Record<RoleType, PDFColour> = {
	[ RoleType.Townsfolk ]: '#2f6fe4',
	[ RoleType.Outsider ]: '#0e9aa7',
	[ RoleType.Minion ]: '#d97a00',
	[ RoleType.Demon ]: '#b81d36',
	[ RoleType.Traveller ]: '#8250df',
	[ RoleType.Fabled ]: '#b88a00',
	[ RoleType.Loric ]: '#1f9d63'
};

const ink = '#1c1c1f';
const dimmed = '#5c5c64';
const rule = '#c9c9d1';
const margin = 40;
const gutter = 20;

// A colour washed towards white, like the screen's disc fill
const tint = (colour: PDFColour, percent: number) => {
	const hex = colour.replace('#', '');
	return '#' + [ 0, 2, 4 ]
		.map(n => parseInt(hex.slice(n, n + 2), 16))
		.map(c => Math.round((c * percent / 100) + (255 * (100 - percent) / 100)).toString(16).padStart(2, '0'))
		.join('');
};

// Letter in the US and Canada, A4 everywhere else
const getPaperSize = () => {
	const region = typeof navigator === 'undefined' ? '' : (navigator.language.split('-')[ 1 ] ?? '').toUpperCase();
	return [ 'US', 'CA' ].includes(region) ? { width: 612, height: 792 } : { width: 595.28, height: 841.89 };
};

export class ScriptPDFLogic {
	// The script as a printable PDF: the characters sheet, then the night order
	static getExport = (script: Script) => {
		const characters = ScriptLogic.getCharacters(script);
		const monograms = CharacterLogic.getMonograms(characters);
		const paper = getPaperSize();

		// Shrink the text a little, rather than let a big script spill onto a second sheet
		let pdf = ScriptPDFLogic.drawSheet(script, characters, monograms, paper, 1);
		for (const scale of [ 0.92, 0.85, 0.78 ]) {
			if (pdf.pageCount <= 1) {
				break;
			}
			pdf = ScriptPDFLogic.drawSheet(script, characters, monograms, paper, scale);
		}
		pdf.addPage();
		ScriptPDFLogic.drawNightOrder(pdf, script, characters, monograms);

		return {
			filename: `${Utility.toFilename(script.name, 'script')}.pdf`,
			bytes: pdf.toBytes(script.name || 'Script')
		};
	};

	private static drawTitle = (pdf: PDFWriter, script: Script, subtitle: string) => {
		pdf.text(script.name || 'Unnamed script', margin, margin + 18, 'bold', 22, ink);
		pdf.text(subtitle, margin, margin + 36, 'regular', 10, dimmed);
		pdf.line(margin, margin + 48, pdf.width - margin, margin + 48, rule, 0.75);
		return margin + 68;
	};

	private static drawDisc = (pdf: PDFWriter, x: number, y: number, r: number, character: Character | null, monogram: string) => {
		const colour = character ? roleColours[ character.role ] : rule;
		pdf.circle(x + r, y + r, r, tint(colour, 18), { colour: colour, thickness: r * 0.14 });
		if (monogram) {
			pdf.text(monogram, x + r, y + r + (r * 0.32), 'bold', r * 0.8, ink, 'center');
		}
	};

	private static drawSheet = (script: Script, characters: Character[], monograms: Map<string, string>, paper: { width: number, height: number }, scale: number) => {
		const pdf = new PDFWriter(paper.width, paper.height);
		const bottom = pdf.height - margin;
		const columnWidth = (pdf.width - (margin * 2) - gutter) / 2;
		const discR = 11 * scale;
		const textX = (discR * 2) + (9 * scale);
		const nameSize = 10 * scale;
		const abilitySize = 8.5 * scale;
		const leading = abilitySize * 1.25;

		const subtitle = [ script.type, script.author ? `by ${script.author}` : null ].filter(s => !!s).join(' · ');
		let y = ScriptPDFLogic.drawTitle(pdf, script, subtitle);

		const newPage = () => {
			pdf.addPage();
			y = margin;
		};

		const measureCharacter = (c: Character) => {
			const lines = pdf.wrap(c.ability, 'regular', abilitySize, columnWidth - textX);
			return { lines: lines, height: Math.max(discR * 2, nameSize + 3 + (lines.length * leading)) };
		};

		const drawCharacter = (c: Character, x: number, top: number, lines: string[]) => {
			ScriptPDFLogic.drawDisc(pdf, x, top, discR, c, monograms.get(c.id) ?? CharacterLogic.getMonogram(c.name));
			pdf.text(c.name, x + textX, top + nameSize, 'bold', nameSize, ink);
			lines.forEach((line, n) => pdf.text(line, x + textX, top + nameSize + 3 + ((n + 1) * leading) - (leading * 0.2), 'regular', abilitySize, dimmed));
		};

		ScriptLogic.scriptRoles.forEach(role => {
			const list = CharacterLogic.filterByRole(characters, role);
			if (list.length === 0) {
				return;
			}

			// Two characters to a row, read left to right
			const rows: { items: { c: Character, lines: string[] }[], height: number }[] = [];
			for (let n = 0; n < list.length; n += 2) {
				const items = list.slice(n, n + 2).map(c => ({ c: c, ...measureCharacter(c) }));
				rows.push({ items: items, height: Math.max(...items.map(i => i.height)) });
			}

			// Keep a heading with its first row
			const headingHeight = 20 * scale;
			if (y + headingHeight + rows[ 0 ].height > bottom) {
				newPage();
			}
			const colour = roleColours[ role ];
			pdf.text(CharacterLogic.getPlural(role).toUpperCase(), margin, y + (9 * scale), 'bold', 9 * scale, colour);
			pdf.line(margin, y + (13 * scale), pdf.width - margin, y + (13 * scale), tint(colour, 45), 0.75);
			y += headingHeight;

			rows.forEach(row => {
				if (y + row.height > bottom) {
					newPage();
				}
				row.items.forEach((item, n) => drawCharacter(item.c, margin + (n * (columnWidth + gutter)), y, item.lines));
				y += row.height + (9 * scale);
			});
			y += 8 * scale;
		});

		const jinxes = CharacterLogic.getJinxes(characters);
		if (jinxes.length > 0) {
			const width = pdf.width - (margin * 2);
			const items = jinxes.map(j => {
				const label = `${j.character.name} & ${j.other.name}: `;
				const lines = pdf.wrap(`${label}${j.text}`, 'regular', abilitySize, width);
				return { label: label, lines: lines, height: lines.length * leading };
			});

			if (y + (20 * scale) + items[ 0 ].height > bottom) {
				newPage();
			}
			pdf.text('JINXES', margin, y + (9 * scale), 'bold', 9 * scale, dimmed);
			pdf.line(margin, y + (13 * scale), pdf.width - margin, y + (13 * scale), rule, 0.75);
			y += 20 * scale;

			items.forEach(item => {
				if (y + item.height > bottom) {
					newPage();
				}
				item.lines.forEach((line, n) => {
					const baseline = y + ((n + 1) * leading) - (leading * 0.2);
					// The pair's names start the first line, in bold
					if ((n === 0) && line.startsWith(item.label.trimEnd())) {
						const names = item.label.trimEnd();
						pdf.text(names, margin, baseline, 'bold', abilitySize, ink);
						pdf.text(line.slice(names.length), margin + pdf.measure(names, 'bold', abilitySize), baseline, 'regular', abilitySize, dimmed);
					} else {
						pdf.text(line, margin, baseline, 'regular', abilitySize, dimmed);
					}
				});
				y += item.height + (5 * scale);
			});
		}

		return pdf;
	};

	// Who wakes, in order, on the first night and on other nights; only characters on this script are listed
	private static drawNightOrder = (pdf: PDFWriter, script: Script, characters: Character[], monograms: Map<string, string>) => {
		const top = ScriptPDFLogic.drawTitle(pdf, script, 'Night order');
		const bottom = pdf.height - margin;
		const columnWidth = (pdf.width - (margin * 2) - gutter) / 2;
		const r = 8;
		const rowHeight = 22;

		const getEntries = (firstNight: boolean) => {
			const order = firstNight ? NightOrder.firstNight : NightOrder.otherNights;
			return order
				.map(id => {
					switch (id) {
						case '_dusk':
							return { label: 'Dusk', character: null };
						case '_dawn':
							return { label: 'Dawn', character: null };
						case '_minion_info':
							return { label: 'Minion info', character: null };
						case '_demon_info':
							return { label: 'Demon info', character: null };
					}
					const character = characters.find(c => c.id === id);
					const steps = character ? (firstNight ? character.wakesFirstNight : character.wakesOtherNights) : [];
					return character && (steps.length > 0) ? { label: character.name, character: character } : null;
				})
				.filter(e => !!e);
		};

		// Each column runs on to the next page if it has to
		const columns = [ { title: 'FIRST NIGHT', entries: getEntries(true) }, { title: 'OTHER NIGHTS', entries: getEntries(false) } ];
		const rowsPerPage = Math.floor((bottom - top - 20) / rowHeight);
		const pages = Math.max(...columns.map(c => Math.ceil(c.entries.length / rowsPerPage)));

		for (let page = 0; page < pages; ++page) {
			if (page > 0) {
				pdf.addPage();
			}
			const pageTop = page === 0 ? top : margin;
			columns.forEach((column, n) => {
				const x = margin + (n * (columnWidth + gutter));
				pdf.text(column.title, x, pageTop + 9, 'bold', 9, dimmed);
				pdf.line(x, pageTop + 13, x + columnWidth, pageTop + 13, rule, 0.75);
				column.entries.slice(page * rowsPerPage, (page + 1) * rowsPerPage).forEach((entry, row) => {
					const y = pageTop + 20 + (row * rowHeight);
					ScriptPDFLogic.drawDisc(pdf, x, y, r, entry.character, entry.character ? (monograms.get(entry.character.id) ?? '') : '');
					pdf.text(entry.label, x + (r * 2) + 8, y + r + 3.5, entry.character ? 'bold' : 'oblique', 10, entry.character ? ink : dimmed);
				});
			});
		}
	};
}
