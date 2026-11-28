import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

// Decorative watch movement drawn inside the hole of the rotating clock ring.
// Uses the same 512 x 512 coordinate space as clock-ring.svg, so it lines up with the ring
// when given the same box; the movement is scaled down to stay well inside the ring's inner edge (r = 188).

const VIEW = 512;
const C = VIEW / 2;
const GOLD = '#d4a64a';
// The movement is shrunk to leave a clear band inside the ring for the day timer gauge
const INNER_SCALE = 0.78;
const JEWEL = '#b03a48';
const GOLD_DARK = '#a8803a';

// Seconds per revolution of the main wheel; every other wheel's speed follows from its tooth count
const MAIN_PERIOD = 120;
// The escapement beats once per second
const BEAT = 1;

const spinForward = stylex.keyframes({
	from: { transform: 'rotate(0deg)' },
	to: { transform: 'rotate(360deg)' }
});

const spinBackward = stylex.keyframes({
	from: { transform: 'rotate(0deg)' },
	to: { transform: 'rotate(-360deg)' }
});

const oscillate = stylex.keyframes({
	'0%': { transform: 'rotate(-120deg)' },
	'50%': { transform: 'rotate(120deg)' },
	'100%': { transform: 'rotate(-120deg)' }
});

const rock = stylex.keyframes({
	'0%': { transform: 'rotate(-7deg)' },
	'50%': { transform: 'rotate(7deg)' },
	'100%': { transform: 'rotate(-7deg)' }
});

const styles = stylex.create({
	mechanism: {
		position: 'absolute',
		left: '26%', // The middle of the seat ring, as in seat-ring.tsx
		top: '26%',
		width: '48%',
		height: '48%',
		pointerEvents: 'none',
		opacity: 0.55
	},
	moving: {
		transformOrigin: '0px 0px',
		animationIterationCount: 'infinite',
		animationPlayState: {
			'default': 'running',
			'@media (prefers-reduced-motion: reduce)': 'paused'
		}
	},
	forward: {
		animationName: spinForward,
		animationTimingFunction: 'linear'
	},
	backward: {
		animationName: spinBackward,
		animationTimingFunction: 'linear'
	},
	ticking: {
		animationName: spinForward,
		animationTimingFunction: 'steps(15)'
	},
	oscillating: {
		animationName: oscillate,
		animationTimingFunction: 'ease-in-out'
	},
	rocking: {
		animationName: rock,
		animationTimingFunction: 'ease-in-out'
	}
});

type Point = [ number, number ];

const polar = (r: number, a: number): Point => [ r * Math.cos(a), r * Math.sin(a) ];

const toPath = (points: Point[]) => `M${points.map(p => `${p[ 0 ].toFixed(2)} ${p[ 1 ].toFixed(2)}`).join(' L')} Z`;

const circlePath = (r: number) => `M${r} 0 A${r} ${r} 0 1 0 ${-r} 0 A${r} ${r} 0 1 0 ${r} 0 Z`;

const MODULE = 4;

const pitchRadius = (teeth: number) => (teeth * MODULE) / 2;

// A spur gear outline centred on the origin, with a tooth centred on angle 0
const gearOutline = (teeth: number) => {
	const r = pitchRadius(teeth);
	const tip = r + MODULE;
	const root = r - (1.25 * MODULE);
	const pitch = (2 * Math.PI) / teeth;
	const points: Point[] = [];
	for (let k = 0; k < teeth; ++k) {
		const a = k * pitch;
		points.push(polar(root, a - (0.3 * pitch)));
		points.push(polar(tip, a - (0.14 * pitch)));
		points.push(polar(tip, a + (0.14 * pitch)));
		points.push(polar(root, a + (0.3 * pitch)));
	}
	return toPath(points);
};

// An escape wheel outline: slanted ratchet teeth
const escapeOutline = (teeth: number, radius: number) => {
	const root = radius * 0.8;
	const pitch = (2 * Math.PI) / teeth;
	const points: Point[] = [];
	for (let k = 0; k < teeth; ++k) {
		const a = k * pitch;
		points.push(polar(root, a));
		points.push(polar(radius, a + (0.62 * pitch)));
		points.push(polar(radius - 3, a + (0.7 * pitch)));
		points.push(polar(root, a + (0.74 * pitch)));
	}
	return toPath(points);
};

// Rim, hub and curved-looking spokes cut from a wheel of the given radius
const spokes = (count: number, inner: number, outer: number, width: number): ReactNode[] => {
	const items: ReactNode[] = [];
	for (let k = 0; k < count; ++k) {
		const a = (360 * k) / count;
		items.push(
			<rect
				key={k}
				x={inner - 1}
				y={-width / 2}
				width={outer - inner + 2}
				height={width}
				transform={`rotate(${a})`}
			/>
		);
	}
	return items;
};

interface Wheel {
	teeth: number;
	x: number;
	y: number;
	// Initial rotation, in radians
	phase: number;
	// Seconds per revolution
	period: number;
	direction: 1 | -1;
}

// Positions a wheel so it meshes with the given parent wheel, in the direction of the given angle (degrees)
const meshWith = (parent: Wheel, teeth: number, angleDeg: number): Wheel => {
	const theta = (angleDeg * Math.PI) / 180;
	const distance = pitchRadius(parent.teeth) + pitchRadius(teeth);
	// Fraction of a tooth pitch at which the parent's teeth sit at the contact point...
	const turns = ((theta - parent.phase) * parent.teeth) / (2 * Math.PI);
	const fraction = turns - Math.floor(turns);
	// ...so the child must present a gap there
	const phase = theta + Math.PI - (((2 * Math.PI) / teeth) * (0.5 - fraction));
	return {
		teeth,
		x: parent.x + (distance * Math.cos(theta)),
		y: parent.y + (distance * Math.sin(theta)),
		phase,
		period: (parent.period * teeth) / parent.teeth,
		direction: parent.direction === 1 ? -1 : 1
	};
};

const MAIN: Wheel = { teeth: 40, x: C, y: C, phase: 0, period: MAIN_PERIOD, direction: 1 };
const THIRD = meshWith(MAIN, 15, -50);
const FOURTH = meshWith(THIRD, 10, 30);
const CENTRE = meshWith(MAIN, 24, 150);
const UPPER = meshWith(MAIN, 12, -100);
const LOWER = meshWith(MAIN, 18, 90);
const LOWER_IDLER = meshWith(LOWER, 10, 160);

const BALANCE = { x: 152, y: 162, radius: 40 };
const ESCAPE = { x: 352, y: 352, radius: 38, teeth: 15 };
const PALLET = { x: 381, y: 302 };

// Plate screws, placed in the gaps between the wheels
const SCREWS = [
	{ x: 100, y: 240, angle: 20 },
	{ x: 420, y: 240, angle: 75 },
	{ x: 300, y: 420, angle: -30 },
	{ x: 310, y: 92, angle: 110 },
	{ x: 200, y: 90, angle: 45 }
];

const Screw = (props: { x: number, y: number, angle: number }) => (
	<g transform={`translate(${props.x} ${props.y}) rotate(${props.angle})`}>
		<circle r={7} fill={GOLD} stroke={GOLD_DARK} strokeWidth={1.5} />
		<rect x={-6} y={-1.2} width={12} height={2.4} fill={GOLD_DARK} />
	</g>
);

const Jewel = (props: { x: number, y: number, r?: number }) => (
	<g transform={`translate(${props.x} ${props.y})`}>
		<circle r={(props.r ?? 6) + 2.5} fill='none' stroke={GOLD} strokeWidth={2} />
		<circle r={props.r ?? 6} fill={JEWEL} opacity={0.7} />
	</g>
);

// A pinion, if given, is drawn on the same arbor and turns with the wheel
const GearWheel = (props: { wheel: Wheel, spokeCount?: number, pinion?: number }) => {
	const { wheel } = props;
	const r = pitchRadius(wheel.teeth);
	const rimInner = r - (1.25 * MODULE) - 6;
	const hub = Math.max(9, r * 0.22);
	const cutOut = props.spokeCount !== undefined && rimInner > hub + 8;
	return (
		<g transform={`translate(${wheel.x} ${wheel.y}) rotate(${(wheel.phase * 180) / Math.PI})`}>
			<g
				{...stylex.props(styles.moving, wheel.direction === 1 ? styles.forward : styles.backward)}
				style={{ animationDuration: `${wheel.period}s` }}
			>
				<path
					d={cutOut ? `${gearOutline(wheel.teeth)} ${circlePath(rimInner)}` : gearOutline(wheel.teeth)}
					fill={GOLD}
					fillRule='evenodd'
				/>
				{
					cutOut ?
						<g fill={GOLD}>
							<circle r={hub} />
							{spokes(props.spokeCount ?? 0, hub, rimInner, 6)}
						</g>
						: null
				}
				{
					props.pinion ?
						<path
							d={gearOutline(props.pinion)}
							transform={`scale(${(hub + 7) / ((2 * props.pinion) + 4)})`}
							fill={GOLD}
							stroke={GOLD_DARK}
							strokeWidth={2}
							vectorEffect='non-scaling-stroke'
						/>
						: null
				}
			</g>
		</g>
	);
};

// A tight spiral, as for a balance spring
const hairspring = (turns: number, inner: number, outer: number) => {
	const steps = turns * 48;
	const points: string[] = [];
	for (let i = 0; i <= steps; ++i) {
		const t = i / steps;
		const a = t * turns * 2 * Math.PI;
		const r = inner + ((outer - inner) * t);
		points.push(`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`);
	}
	return `M${points.join(' L')}`;
};

export const ClockMechanism = () => {
	const escapeAngles = Array.from({ length: 8 }, (_, k) => k * 45);

	return (
		<svg {...stylex.props(styles.mechanism)} viewBox={`0 0 ${VIEW} ${VIEW}`} aria-hidden='true'>
			<g transform={`translate(${C} ${C}) scale(${INNER_SCALE}) translate(${-C} ${-C})`}>
				{/* Base plate engraving */}
				<circle cx={C} cy={C} r={180} fill='none' stroke={GOLD} strokeWidth={1.5} strokeDasharray='2 6' />

				{/* Going train */}
				<GearWheel wheel={MAIN} spokeCount={5} pinion={12} />
				<GearWheel wheel={CENTRE} spokeCount={4} pinion={8} />
				<GearWheel wheel={THIRD} spokeCount={3} pinion={7} />
				<GearWheel wheel={FOURTH} />
				<GearWheel wheel={UPPER} spokeCount={3} />
				<GearWheel wheel={LOWER} spokeCount={4} pinion={8} />
				<GearWheel wheel={LOWER_IDLER} />

				{SCREWS.map(screw => <Screw key={`${screw.x}-${screw.y}`} {...screw} />)}

				{/* Escape wheel: advances one tooth per beat */}
				<g transform={`translate(${ESCAPE.x} ${ESCAPE.y})`}>
					<g
						{...stylex.props(styles.moving, styles.ticking)}
						style={{ animationDuration: `${ESCAPE.teeth * BEAT}s` }}
					>
						<path
							d={`${escapeOutline(ESCAPE.teeth, ESCAPE.radius)} ${circlePath(ESCAPE.radius * 0.62)}`}
							fill={GOLD}
							fillRule='evenodd'
						/>
						<g fill={GOLD}>
							<circle r={8} />
							{spokes(4, 8, ESCAPE.radius * 0.62, 5)}
						</g>
					</g>
				</g>

				{/* Pallet fork: rocks in time with the balance */}
				<g transform={`translate(${PALLET.x} ${PALLET.y})`}>
					<g
						{...stylex.props(styles.moving, styles.rocking)}
						style={{ animationDuration: `${2 * BEAT}s`, animationDelay: `${-BEAT / 2}s` }}
					>
						<g
							fill='none'
							stroke={GOLD}
							strokeWidth={5}
							strokeLinecap='round'
							transform={`rotate(${(Math.atan2(ESCAPE.y - PALLET.y, ESCAPE.x - PALLET.x) * 180) / Math.PI})`}
						>
							<path d='M0 0 L-30 0' />
							<path d='M27 -20 Q12 0 27 20' />
							<path d='M0 0 L27 -20 M0 0 L27 20' />
						</g>
					</g>
				</g>

				{/* Balance wheel and spring */}
				<g transform={`translate(${BALANCE.x} ${BALANCE.y})`}>
					<path
						d={hairspring(6, 6, BALANCE.radius * 0.72)}
						fill='none'
						stroke={GOLD}
						strokeWidth={1.2}
						opacity={0.8}
					/>
					<g
						{...stylex.props(styles.moving, styles.oscillating)}
						style={{ animationDuration: `${2 * BEAT}s`, animationDelay: `${-BEAT / 2}s` }}
					>
						<circle r={BALANCE.radius} fill='none' stroke={GOLD} strokeWidth={6} />
						<g fill={GOLD}>
							{spokes(3, 6, BALANCE.radius, 4)}
							{
								escapeAngles.map(a => {
									const [ x, y ] = polar(BALANCE.radius + 4, (a * Math.PI) / 180);
									return <circle key={a} cx={x} cy={y} r={3.5} />;
								})
							}
						</g>
					</g>
				</g>

				{/* Jewelled pivots */}
				<Jewel x={MAIN.x} y={MAIN.y} r={8} />
				<Jewel x={CENTRE.x} y={CENTRE.y} />
				<Jewel x={THIRD.x} y={THIRD.y} />
				<Jewel x={FOURTH.x} y={FOURTH.y} r={4} />
				<Jewel x={UPPER.x} y={UPPER.y} r={4} />
				<Jewel x={LOWER.x} y={LOWER.y} r={5} />
				<Jewel x={LOWER_IDLER.x} y={LOWER_IDLER.y} r={4} />
				<Jewel x={ESCAPE.x} y={ESCAPE.y} r={5} />
				<Jewel x={PALLET.x} y={PALLET.y} r={4} />
				<Jewel x={BALANCE.x} y={BALANCE.y} r={5} />
			</g>
		</svg>
	);
};
