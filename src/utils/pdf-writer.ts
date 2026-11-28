// A small PDF writer: text in the standard Helvetica fonts, filled circles, lines and rectangles.
// Enough for a printable script sheet, with nothing to download or install.
// Coordinates are in points (1/72 inch) from the top left of the page.

export type PDFFont = 'regular' | 'bold' | 'oblique';

// A colour as '#rrggbb'
export type PDFColour = string;

const fontNames: Record<PDFFont, string> = {
	regular: 'Helvetica',
	bold: 'Helvetica-Bold',
	oblique: 'Helvetica-Oblique'
};

// Characters outside Latin-1 that the standard fonts' WinAnsi encoding still has
const winAnsi: Record<string, number> = {
	'€': 0x80,
	'‚': 0x82,
	'ƒ': 0x83,
	'„': 0x84,
	'…': 0x85,
	'†': 0x86,
	'‡': 0x87,
	'ˆ': 0x88,
	'‰': 0x89,
	'Š': 0x8A,
	'‹': 0x8B,
	'Œ': 0x8C,
	'Ž': 0x8E,
	'‘': 0x91,
	'’': 0x92,
	'“': 0x93,
	'”': 0x94,
	'•': 0x95,
	'–': 0x96,
	'—': 0x97,
	'˜': 0x98,
	'™': 0x99,
	'š': 0x9A,
	'›': 0x9B,
	'œ': 0x9C,
	'ž': 0x9E,
	'Ÿ': 0x9F
};

// Helvetica's metrics match Arial's, so the browser can measure text for us
let measureContext: CanvasRenderingContext2D | null | undefined;

export class PDFWriter {
	readonly width: number;
	readonly height: number;
	private pages: string[][] = [];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.addPage();
	}

	get pageCount() {
		return this.pages.length;
	}

	addPage = () => {
		this.pages.push([]);
	};

	private get ops() {
		return this.pages[ this.pages.length - 1 ];
	}

	// The width of the text in points
	measure = (text: string, font: PDFFont, size: number) => {
		if (measureContext === undefined) {
			measureContext = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
		}
		if (!measureContext) {
			return text.length * size * 0.52;
		}
		const weight = font === 'bold' ? 'bold ' : font === 'oblique' ? 'italic ' : '';
		measureContext.font = `${weight}100px Helvetica, Arial, sans-serif`;
		return measureContext.measureText(text).width * size / 100;
	};

	// Breaks the text into lines no wider than the width
	wrap = (text: string, font: PDFFont, size: number, width: number): string[] => {
		const lines: string[] = [];
		text.split('\n').forEach(paragraph => {
			let line = '';
			paragraph.split(/\s+/).filter(w => w.length > 0).forEach(word => {
				const candidate = line ? `${line} ${word}` : word;
				if (line && (this.measure(candidate, font, size) > width)) {
					lines.push(line);
					line = word;
				} else {
					line = candidate;
				}
			});
			lines.push(line);
		});
		return lines;
	};

	// Text with its baseline at y
	text = (text: string, x: number, y: number, font: PDFFont, size: number, colour: PDFColour = '#000000', align: 'left' | 'center' = 'left') => {
		const left = align === 'center' ? x - (this.measure(text, font, size) / 2) : x;
		this.ops.push(`BT ${this.fill(colour)} /${this.fontKey(font)} ${num(size)} Tf ${num(left)} ${num(this.height - y)} Td (${encode(text)}) Tj ET`);
	};

	line = (x1: number, y1: number, x2: number, y2: number, colour: PDFColour, thickness: number) => {
		this.ops.push(`${this.stroke(colour)} ${num(thickness)} w ${num(x1)} ${num(this.height - y1)} m ${num(x2)} ${num(this.height - y2)} l S`);
	};

	rect = (x: number, y: number, width: number, height: number, colour: PDFColour) => {
		this.ops.push(`${this.fill(colour)} ${num(x)} ${num(this.height - y - height)} ${num(width)} ${num(height)} re f`);
	};

	// A filled circle, with an optional ring drawn just inside its edge
	circle = (cx: number, cy: number, r: number, fill: PDFColour, ring?: { colour: PDFColour, thickness: number }) => {
		this.ops.push(`${this.fill(fill)} ${circlePath(cx, this.height - cy, r)} f`);
		if (ring) {
			this.ops.push(`${this.stroke(ring.colour)} ${num(ring.thickness)} w ${circlePath(cx, this.height - cy, r - (ring.thickness / 2))} S`);
		}
	};

	// The finished file
	toBytes = (title: string): Uint8Array<ArrayBuffer> => {
		const objects: string[] = [];
		const add = (body: string) => {
			objects.push(body);
			return objects.length;
		};

		const catalog = add('');
		const pagesRoot = add('');
		const fonts = (Object.keys(fontNames) as PDFFont[])
			.map(f => `/${this.fontKey(f)} ${add(`<< /Type /Font /Subtype /Type1 /BaseFont /${fontNames[ f ]} /Encoding /WinAnsiEncoding >>`)} 0 R`)
			.join(' ');
		const pageRefs = this.pages.map(ops => {
			const content = ops.join('\n');
			const stream = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
			return add(`<< /Type /Page /Parent ${pagesRoot} 0 R /MediaBox [0 0 ${num(this.width)} ${num(this.height)}] /Resources << /Font << ${fonts} >> >> /Contents ${stream} 0 R >>`);
		});
		const info = add(`<< /Title (${encode(title)}) /Producer (Clockmaker) >>`);
		objects[ catalog - 1 ] = `<< /Type /Catalog /Pages ${pagesRoot} 0 R >>`;
		objects[ pagesRoot - 1 ] = `<< /Type /Pages /Kids [${pageRefs.map(p => `${p} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`;

		// Every character here is a single byte, so string lengths are byte offsets
		let file = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
		const offsets = objects.map((body, n) => {
			const offset = file.length;
			file += `${n + 1} 0 obj\n${body}\nendobj\n`;
			return offset;
		});
		const xref = file.length;
		file += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
		offsets.forEach(o => file += `${String(o).padStart(10, '0')} 00000 n \n`);
		file += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

		const bytes = new Uint8Array(file.length);
		for (let n = 0; n < file.length; ++n) {
			bytes[ n ] = file.charCodeAt(n) & 0xFF;
		}
		return bytes;
	};

	private fontKey = (font: PDFFont) => `F${(Object.keys(fontNames) as PDFFont[]).indexOf(font) + 1}`;

	private fill = (colour: PDFColour) => `${rgb(colour)} rg`;

	private stroke = (colour: PDFColour) => `${rgb(colour)} RG`;
}

const num = (value: number) => (Math.round(value * 100) / 100).toString();

const rgb = (colour: PDFColour) => {
	const hex = colour.replace('#', '');
	return [ 0, 2, 4 ].map(n => num(parseInt(hex.slice(n, n + 2), 16) / 255)).join(' ');
};

// A circle as four Bézier curves, in PDF coordinates (from the bottom left)
const circlePath = (cx: number, cy: number, r: number) => {
	const k = r * 0.5523;
	return [
		`${num(cx + r)} ${num(cy)} m`,
		`${num(cx + r)} ${num(cy + k)} ${num(cx + k)} ${num(cy + r)} ${num(cx)} ${num(cy + r)} c`,
		`${num(cx - k)} ${num(cy + r)} ${num(cx - r)} ${num(cy + k)} ${num(cx - r)} ${num(cy)} c`,
		`${num(cx - r)} ${num(cy - k)} ${num(cx - k)} ${num(cy - r)} ${num(cx)} ${num(cy - r)} c`,
		`${num(cx + k)} ${num(cy - r)} ${num(cx + r)} ${num(cy - k)} ${num(cx + r)} ${num(cy)} c`
	].join(' ');
};

// Text as a PDF string: one byte per character, with anything the fonts can't show replaced
const encode = (text: string) => {
	return Array.from(text).map(ch => {
		const code = ch.codePointAt(0) ?? 0x3F;
		const byte = winAnsi[ ch ] ?? (((code >= 0x20) && (code <= 0x7E)) || ((code >= 0xA0) && (code <= 0xFF)) ? code : 0x3F);
		const out = String.fromCharCode(byte);
		return (out === '\\') || (out === '(') || (out === ')') ? `\\${out}` : out;
	}).join('');
};
