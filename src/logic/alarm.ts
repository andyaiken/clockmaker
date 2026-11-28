// A short alarm chime, synthesised with the Web Audio API so no sound file is needed

let context: AudioContext | null = null;

const getContext = () => {
	if (!context) {
		context = new AudioContext();
	}
	return context;
};

// Browsers (iPad Safari especially) only allow audio once it has been started from a tap,
// so call this from the click handler that starts the timer
const prime = () => {
	const ctx = getContext();
	if (ctx.state === 'suspended') {
		void ctx.resume();
	}
};

// The partials of a church bell, as multiples of the strike note, with their relative loudness
// and how long each rings for (higher partials die away faster)
const PARTIALS = [
	{ ratio: 0.5, level: 0.35, decay: 2.6 },	// hum
	{ ratio: 1, level: 1, decay: 2.2 }, // prime (the note we hear)
	{ ratio: 1.2, level: 0.45, decay: 1.6 },	// minor third, which gives the bell its sombre colour
	{ ratio: 1.5, level: 0.25, decay: 1.2 },	// fifth
	{ ratio: 2, level: 0.5, decay: 1.0 }, // nominal
	{ ratio: 2.5, level: 0.15, decay: 0.6 },
	{ ratio: 3, level: 0.12, decay: 0.45 }
];

const strike = (ctx: AudioContext, at: number, frequency: number, volume: number = 0.5) => {
	const master = ctx.createGain();
	master.gain.value = volume;
	master.connect(ctx.destination);

	PARTIALS.forEach(partial => {
		const osc = ctx.createOscillator();
		osc.type = 'sine';
		osc.frequency.value = frequency * partial.ratio;

		const gain = ctx.createGain();
		gain.gain.setValueAtTime(0.0001, at);
		gain.gain.exponentialRampToValueAtTime(partial.level, at + 0.008);
		gain.gain.exponentialRampToValueAtTime(0.0001, at + partial.decay);

		osc.connect(gain);
		gain.connect(master);
		osc.start(at);
		osc.stop(at + partial.decay + 0.05);
	});
};

// The first phrase of the Westminster Quarters, as rung by Big Ben's quarter bells: G#, F#, E, B
const NOTES = {
	gSharp4: 415.3,
	fSharp4: 369.99,
	e4: 329.63,
	b3: 246.94
};

const PHRASE = [
	{ time: 0, frequency: NOTES.gSharp4 },
	{ time: 0.8, frequency: NOTES.e4 },
	{ time: 1.6, frequency: NOTES.fSharp4 },
	{ time: 2.4, frequency: NOTES.b3 }
];

const play = () => {
	const ctx = getContext();
	const start = () => {
		const t = ctx.currentTime + 0.05;
		PHRASE.forEach(note => strike(ctx, t + note.time, note.frequency));
	};
	if (ctx.state === 'suspended') {
		ctx.resume().then(start).catch(() => undefined);
	}
	else {
		start();
	}
};

// A single soft strike, for dusk and dawn: lower for dusk, higher for dawn
const chime = (when: 'dusk' | 'dawn') => {
	const ctx = getContext();
	const start = () => strike(ctx, ctx.currentTime + 0.05, when === 'dusk' ? NOTES.b3 : NOTES.e4, 0.12);
	if (ctx.state === 'suspended') {
		ctx.resume().then(start).catch(() => undefined);
	}
	else {
		start();
	}
};

export const Alarm = {
	prime,
	play,
	chime
};
