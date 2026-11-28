// Regenerates the Help page's screenshots in public/help/.
//
//   npm run help:screenshots              all of them
//   npm run help:screenshots ink night    just these (the game is still played through, so they match)
//
// It starts the app's dev server, opens it in headless Chrome (your installed Chrome; set CHROME_PATH to use another),
// and plays through the same 8-player Trouble Brewing game each time, taking a picture at each step the Help page shows.
// It uses a fresh browser profile, so your own saved games and scripts are never touched.
// To add a screenshot: give a Help topic a `screenshot` id in src/data/help.ts, then take a picture with that id below.

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'help');
const only = process.argv.slice(2);

// The table: seat, name and character, clockwise from seat 1
const TABLE = [
	[ 'Ada', 'Empath' ],
	[ 'Basil', 'Poisoner' ],
	[ 'Cora', 'Fortune Teller' ],
	[ 'Dev', 'Washerwoman' ],
	[ 'Esme', 'Imp' ],
	[ 'Finn', 'Recluse' ],
	[ 'Gwen', 'Monk' ],
	[ 'Hugo', 'Undertaker' ]
];
const BLUFFS = [ 'Chef', 'Virgin', 'Saint' ];

// Helpers the steps use inside the page
const pageHelpers = () => {
	const wait = ms => new Promise(r => setTimeout(r, ms));
	const buttons = () => [ ...document.querySelectorAll('button') ];
	const button = text => buttons().find(b => (b.textContent.trim() === text) || (b.getAttribute('aria-label') === text));
	const click = async text => {
		const b = button(text);
		if (!b) {
			throw new Error(`No button: ${text}`);
		}
		b.click();
		await wait(250);
	};
	const radio = async text => {
		const r = [ ...document.querySelectorAll('[role=radio], [role=tab]') ].find(e => e.textContent.trim().startsWith(text) || (e.getAttribute('aria-label') ?? '').startsWith(text));
		if (!r) {
			throw new Error(`No option: ${text}`);
		}
		r.click();
		await wait(250);
	};
	const seat = name => {
		const s = [ ...document.querySelectorAll('path[role=button]') ].find(p => {
			const label = p.getAttribute('aria-label') ?? '';
			return (label === name) || label.startsWith(`${name},`);
		});
		if (!s) {
			throw new Error(`No seat: ${name}`);
		}
		return s;
	};
	const tapSeat = async name => {
		seat(name).dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await wait(200);
	};
	const centre = element => {
		const r = element.getBoundingClientRect();
		return { x: r.x + (r.width / 2), y: r.y + (r.height / 2) };
	};
	const pointer = (element, type, x, y, id = 7) => element.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: id, pointerType: 'touch' }));
	// A card whose text includes this (eg a setup reminder), or a character card whose first line is exactly this name
	const card = text => [ ...document.querySelectorAll('div[role=button]') ].find(d => d.innerText.includes(text));
	const character = name => [ ...document.querySelectorAll('div[role=button]') ].find(d => d.innerText.split('\n')[ 0 ].trim() === name);
	const closeReveal = async () => {
		document.querySelector('[role=dialog][aria-label="Shown to player"]')?.click();
		await wait(250);
	};
	window.help = { wait, button, click, radio, seat, tapSeat, centre, pointer, card, character, closeReveal };
};

const main = async () => {
	await mkdir(outDir, { recursive: true });

	const server = await createServer({ root: root, logLevel: 'error', server: { port: 5199, strictPort: false } });
	await server.listen();
	const url = server.resolvedUrls.local[ 0 ];

	const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
	const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
	const page = await context.newPage();
	await page.addInitScript(pageHelpers);

	const run = (fn, arg) => page.evaluate(fn, arg);
	const shot = async (id, clip) => {
		if (only.length && !only.includes(id)) {
			return;
		}
		// Undo notes only belong in the picture about undo
		if (id !== 'undo') {
			await run(() => help.button('Dismiss')?.click());
		}
		await page.waitForTimeout(400);
		// JPEG keeps the set small enough to keep offline; shown at about half width on the Help page, 1x is still sharp.
		// A string picks out one element (eg a sheet) to photograph on its own; a box crops the page.
		const options = { path: path.join(outDir, `${id}.jpg`), type: 'jpeg', quality: 85 };
		if (typeof clip === 'string') {
			await page.locator(clip).first().screenshot(options);
		} else {
			await page.screenshot({ ...options, clip: clip });
		}
		console.log(`  ${id}.jpg`);
	};
	const sheet = '[role=dialog][aria-modal=true]';

	try {
		await page.goto(url);
		await page.waitForSelector('text=Clockmaker');

		// Settings
		await run(() => help.click('Settings'));
		await shot('settings', sheet);
		await page.keyboard.press('Escape');

		// Setup: players and script, then the bag
		await run(() => help.click('New Game'));
		await shot('setup-players');
		await run(async () => {
			await help.click('Next: script');
			await help.radio('Trouble Brewing');
		});
		await run(async ({ table, bluffs }) => {
			for (const [ , character ] of table) {
				await help.click(`Add ${character}`);
			}
			await help.radio('Add to bluffs');
			for (const character of bluffs) {
				await help.click(`Add ${character}`);
			}
		}, { table: TABLE, bluffs: BLUFFS });
		await shot('setup-bag');
		await run(() => help.click('Start'));

		// Names and seats
		for (let i = 0; i < TABLE.length; i++) {
			await page.fill(`#player-name-${i}`, TABLE[ i ][ 0 ]);
		}
		await page.locator('body').click({ position: { x: 5, y: 5 } });
		await run(async table => {
			await help.radio('Assign Characters');
			for (const [ name, character ] of table.slice(0, 5)) {
				help.character(character).click();
				await help.wait(100);
				await help.tapSeat(name);
			}
			// Leave the next character picked, ready to tap its seat
			help.character(table[ 5 ][ 1 ]).click();
			await help.wait(200);
		}, TABLE);
		await shot('seating');
		await run(async table => {
			// The sixth character is already picked
			await help.tapSeat(table[ 5 ][ 0 ]);
			for (const [ name, character ] of table.slice(6)) {
				help.character(character).click();
				await help.wait(100);
				await help.tapSeat(name);
			}
			// Setup reminders: the Washerwoman's two, and the Fortune Teller's red herring
			await help.radio('Add Reminders');
			for (const [ reminder, name ] of [ [ ': Townsfolk', 'Cora' ], [ ': Wrong', 'Hugo' ], [ ': Red herring', 'Gwen' ] ]) {
				help.card(reminder).click();
				await help.wait(100);
				await help.tapSeat(name);
			}
			await help.click('Begin Game');
		}, TABLE);

		// Night 1: the Poisoner chooses, then the Fortune Teller
		await run(() => help.radio('Poisoner'));
		await shot('night');
		await run(async () => {
			await help.click('Show');
			await help.closeReveal();
			await help.tapSeat('Ada');
			await help.click('Done recording answer');
			document.querySelector('[role=switch]')?.scrollIntoView({ block: 'center' });
		});
		await shot('night-choice');
		await run(async () => {
			await help.click('Place reminder');
			await help.radio('Fortune Teller');
			await help.click('Show');
			await help.closeReveal();
			await help.tapSeat('Gwen');
			await help.tapSeat('Dev');
			await help.click('Done recording answer');
			[ ...document.querySelectorAll('div') ].find(d => d.textContent === 'Worked out from the grimoire')?.scrollIntoView({ block: 'center' });
		});
		await shot('night-answer');

		// Day 1
		await run(() => help.click('End Night 1'));
		await shot('undo', { x: 0, y: 0, width: 1180, height: 400 });
		await run(async () => {
			help.button('Dismiss')?.click();
			const finn = help.seat('Finn');
			const at = help.centre(finn);
			help.pointer(finn, 'pointerdown', at.x, at.y);
			await help.wait(700);
		});
		await shot('seat-menu');
		await run(async () => {
			const finn = help.seat('Finn');
			const at = help.centre(finn);
			help.pointer(finn, 'pointerup', at.x, at.y);
			await help.wait(100);
			await help.click('Mark dead');
		});
		await shot('grimoire');
		await run(async () => {
			await help.click('Choose a lens');
			await help.click('Health');
		});
		await shot('lens-health');
		await run(async () => {
			// The lens button shows the lens it's on; tapping it again goes back to Info
			await help.click('Health');
			await help.tapSeat('Ada');
		});
		await shot('inspector');
		await run(async () => {
			await help.click('Close');
			// A ring round Cora and Dev, who might both claim to be the Washerwoman
			await help.click('Draw with a finger (Apple Pencil always draws)');
			const ring = help.seat('Ada').closest('svg').parentElement;
			const box = ring.getBoundingClientRect();
			const cx = box.x + (box.width / 2);
			const cy = box.y + (box.height / 2);
			const r = box.width * 0.4;
			const start = Math.PI * 0.05;
			const end = Math.PI * 0.95;
			const point = t => ({ x: cx + (r * Math.sin(t)), y: cy - (r * Math.cos(t)) });
			let p = point(start);
			help.pointer(ring, 'pointerdown', p.x, p.y, 9);
			for (let i = 1; i <= 30; i++) {
				p = point(start + ((end - start) * i / 30));
				help.pointer(ring, 'pointermove', p.x, p.y, 9);
			}
			help.pointer(ring, 'pointerup', p.x, p.y, 9);
			await help.wait(200);
			await help.click('Stop drawing with a finger');
		});
		await shot('ink');
		await run(async () => {
			await help.click('Clear this phase\'s ink');
			await help.click('New nomination');
			await help.tapSeat('Cora');
			await help.tapSeat('Esme');
		});
		await shot('day-nominate');
		await run(async () => {
			await help.click('Start the vote');
			for (const name of [ 'Ada', 'Dev', 'Gwen', 'Finn' ]) {
				await help.tapSeat(name);
			}
		});
		await shot('day-vote');
		await run(async () => {
			await help.click('Close the vote');
			await help.click('Look back at a past phase');
			await help.click('Night 1');
		});
		await shot('look-back');
		await run(async () => {
			// The button shows the phase it's looking back at; tapping it again comes back to now
			await help.click('Night 1');
			await help.tapSeat('Dev');
			[ ...document.querySelectorAll('button') ].find(b => b.textContent.trim().startsWith('Show to player')).click();
			await help.wait(150);
			await help.click('Player');
			const esme = [ ...document.querySelectorAll('button[aria-pressed]') ].filter(b => b.textContent.endsWith('Esme')).pop();
			esme.click();
			await help.wait(100);
			await help.click('Show');
		});
		await shot('reveal');
		await run(async () => {
			await help.closeReveal();
			await help.click('Close');
			await help.click('Script');
		});
		await shot('script', sheet);
		await page.keyboard.press('Escape');
		await run(() => help.click('More'));
		await shot('menu', { x: 640, y: 0, width: 540, height: 620 });
		await page.keyboard.press('Escape');
		await run(() => help.click('Hide'));
		await shot('privacy');
		await run(async () => {
			help.button('Hold to show').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
			await help.wait(900);
			await help.click('Home (the game is saved)');
		});
		await shot('home');

		// Scripts
		await run(async () => {
			await help.click('Browse Scripts');
			await help.radio('Trouble Brewing');
		});
		await shot('browse');
		await run(async () => {
			await help.click('New script');
			for (const character of [ 'Chef', 'Empath', 'Fortune Teller', 'Butler', 'Spy', 'Imp' ]) {
				await help.click(`Add ${character}`);
			}
		});
		await page.fill('input[placeholder="Script name"]', 'Lantern Light');
		await shot('editor');
	} finally {
		await browser.close();
		await server.close();
	}
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
