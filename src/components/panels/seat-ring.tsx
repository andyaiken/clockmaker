import * as stylex from '@stylexjs/stylex';
import { type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { Ghost, Hand, Skull } from 'lucide-react';
import { ColourLogic } from '../../logic/colour-logic';
import type { InkStroke } from '../../models/game';
import type { RoleType } from '../../enums/role-type';
import type { SeatBadge } from '../../logic/grimoire-view-logic';
import { palette } from '../../tokens.stylex';

export interface SeatReminder {
	key: string;
	// The monogram and role of the character that placed it
	monogram: string;
	role: RoleType | null;
	label: string;
	// Can be dragged to another seat
	movable?: boolean;
}

export interface Seat {
	id: string;
	name: string;
	character: { name: string, monogram: string, role: RoleType } | null;
	dead: boolean;
	ghostVote: boolean;
	reminders: SeatReminder[];
	// What the current lens says about this seat, if anything
	badge: SeatBadge | null;
	selected: boolean;
	// Tapping it would do something with the current setup selection
	target: boolean;
	// Woken, or otherwise picked out by the night; or the nominator and nominee
	highlighted: boolean;
	// Can't be picked right now, eg a dead player without a ghost vote during a vote
	dimmed?: boolean;
	// Has a hand raised in the open vote
	hand?: boolean;
}

interface Props {
	seats: Seat[];
	// The seat drawn at the top
	topSeat: number;
	// Shows only names
	privacy?: boolean;
	// Drawn in the middle of the ring, eg the gears
	centre?: ReactNode;
	onSeatClick?: (index: number) => void;
	// An arrow from one seat to another, eg from the nominator to the nominee
	link?: { from: number, to: number } | null;
	// The circle can only be turned when this is given
	onTurn?: (topSeat: number) => void;
	// Ink drawn on the circle; Apple Pencil always draws, a finger only when fingerInk is on
	ink?: { strokes: InkStroke[], fingerInk: boolean, onStroke?: (stroke: InkStroke) => void };
	// Holding a seat for a moment opens quick actions for it
	onSeatLongPress?: (index: number, x: number, y: number) => void;
	// Dragging a reminder from one seat to another
	onMoveReminder?: (key: string, fromIndex: number, toIndex: number) => void;
}

// Everything is laid out in a 1000 x 1000 square, scaled to fit
export const SIZE = 1000;
export const C = SIZE / 2;
const R_IN = 252;
const R_OUT = 496;
const BAND = 10;
const R_TEXT = (R_IN + R_OUT) / 2;
// The gap between neighbouring slices
const GAP = 3;

// The centre artwork (the brass ring, gears and timer) fills the box from 26% to 74% of the circle;
// grimoire-panel, grimoire-centre and clock-mechanism each say so, since StyleX needs the values written out

type Fit = 'full' | 'mid' | 'tight';

// How much of a seat fits, judged by the width of its slice at the name line:
// from about 12 players reminders shrink to dots, and from about 17 the character line goes
const getFit = (count: number): Fit => {
	const width = 2 * R_TEXT * Math.sin(Math.PI / Math.max(count, 2));
	return width >= 200 ? 'full' : (width >= 140 ? 'mid' : 'tight');
};

export const polar = (r: number, deg: number) => {
	const t = (deg * Math.PI) / 180;
	return { x: C + (r * Math.sin(t)), y: C - (r * Math.cos(t)) };
};

// A ring sector between two radii, from a0 to a1 degrees clockwise from twelve o'clock, with an even gap to its neighbours
export const sector = (rIn: number, rOut: number, a0: number, a1: number) => {
	const off = (r: number) => ((GAP / r) * 180) / Math.PI;
	const f = (v: number) => v.toFixed(1);
	const p0 = polar(rOut, a0 + off(rOut));
	const p1 = polar(rOut, a1 - off(rOut));
	const p2 = polar(rIn, a1 - off(rIn));
	const p3 = polar(rIn, a0 + off(rIn));
	const large = (a1 - a0) > 180 ? 1 : 0;
	return `M${f(p0.x)} ${f(p0.y)} A${rOut} ${rOut} 0 ${large} 1 ${f(p1.x)} ${f(p1.y)} L${f(p2.x)} ${f(p2.y)} A${rIn} ${rIn} 0 ${large} 0 ${f(p3.x)} ${f(p3.y)} Z`;
};

const wrap = (value: number, count: number) => ((value % count) + count) % count;

// Keeps following a pointer that leaves the element; a pointer the browser has already let go of can't be captured, which is harmless
const capture = (element: Element, pointerID: number) => {
	try {
		element.setPointerCapture(pointerID);
	} catch {
		// Nothing to follow
	}
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const styles = stylex.create({
	ring: {
		position: 'relative',
		width: '100%',
		height: '100%',
		containerType: 'size',
		touchAction: 'none',
		userSelect: 'none',
		WebkitUserSelect: 'none'
	},
	svg: {
		position: 'absolute',
		inset: 0,
		width: '100%',
		height: '100%',
		overflow: 'visible',
		zIndex: 1
	},
	face: {
		fill: palette.controlFace,
		stroke: palette.controlBorder,
		strokeWidth: 1.5,
		cursor: 'pointer',
		outline: 'none',
		transition: {
			'default': 'fill 200ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	faceFocus: {
		stroke: {
			'default': palette.controlBorder,
			':focus-visible': palette.controlBorderHighlight
		},
		strokeWidth: {
			'default': 1.5,
			':focus-visible': 6
		}
	},
	faceDead: {
		fill: palette.backgroundDark
	},
	faceTarget: {
		stroke: palette.textHighlight,
		strokeWidth: 4,
		strokeDasharray: '14 10'
	},
	faceHighlighted: {
		stroke: palette.controlFacePrimary,
		strokeWidth: 6,
		filter: `drop-shadow(0 0 12px color-mix(in srgb, ${palette.controlFacePrimary} 50%, transparent))`
	},
	faceSelected: {
		stroke: palette.controlFacePrimary,
		strokeWidth: 7
	},
	faceHand: {
		fill: `color-mix(in srgb, ${palette.controlFacePrimary} 22%, ${palette.controlFace})`
	},
	dimmed: {
		opacity: 0.35
	},
	grabbable: {
		pointerEvents: 'auto',
		cursor: 'grab',
		touchAction: 'none'
	},
	ghost: {
		position: 'fixed',
		zIndex: 200,
		transform: 'translate(-50%, -120%)',
		pointerEvents: 'none',
		boxShadow: '0 8px 20px rgb(0 0 0 / 0.3)'
	},
	inkLayer: {
		position: 'absolute',
		inset: 0,
		width: '100%',
		height: '100%',
		overflow: 'visible',
		zIndex: 3,
		pointerEvents: 'none'
	},
	ink: {
		fill: 'none',
		stroke: palette.roleMinion,
		strokeWidth: 5,
		strokeLinecap: 'round',
		strokeLinejoin: 'round'
	},
	link: {
		fill: 'none',
		stroke: palette.controlFacePrimary,
		strokeWidth: 6,
		strokeLinecap: 'round',
		strokeDasharray: '1 14',
		pointerEvents: 'none'
	},
	linkHead: {
		fill: palette.controlFacePrimary
	},
	handPill: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '0.4cqw',
		padding: '0.25cqw 0.9cqw',
		borderRadius: '999px',
		backgroundColor: palette.controlFacePrimary,
		color: palette.textLight,
		fontSize: 'max(10px, 1.35cqw)',
		fontWeight: '700',
		whiteSpace: 'nowrap'
	},
	handIcon: {
		width: '1.6cqw',
		height: '1.6cqw'
	},
	band: {
		pointerEvents: 'none'
	},
	bandDead: {
		opacity: 0.45
	},
	label: {
		position: 'absolute',
		zIndex: 2,
		transform: 'translate(-50%, -50%)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '0.35cqw',
		textAlign: 'center',
		pointerEvents: 'none',
		color: palette.text
	},
	disc: {
		position: 'relative',
		flexShrink: 0,
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		color: palette.text,
		fontWeight: '700',
		letterSpacing: '-0.02em',
		marginBottom: '0.3cqw'
	},
	discFull: { width: '5.2cqw', height: '5.2cqw', fontSize: '2cqw' },
	discMid: { width: '4.4cqw', height: '4.4cqw', fontSize: '1.7cqw' },
	discTight: { width: '3.7cqw', height: '3.7cqw', fontSize: '1.45cqw' },
	discDead: {
		opacity: 0.6
	},
	// Small round marks either side of the disc, eg a skull for the dead; at its sides so they never cover the name
	mark: {
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		width: '2.4cqw',
		height: '2.4cqw',
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		backgroundColor: palette.textDimmed,
		color: palette.background,
		boxShadow: `0 0 0 0.25cqw ${palette.controlFace}`
	},
	markLeft: { left: '-1.9cqw' },
	markRight: { right: '-1.9cqw', backgroundColor: palette.controlFacePrimary, color: palette.textLight },
	markTight: { width: '1.9cqw', height: '1.9cqw' },
	markLeftTight: { left: '-1.5cqw' },
	markRightTight: { right: '-1.5cqw' },
	markIcon: { width: '1.5cqw', height: '1.5cqw' },
	markIconTight: { width: '1.2cqw', height: '1.2cqw' },
	name: {
		maxWidth: '100%',
		fontWeight: '600',
		lineHeight: 1.15,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	nameFull: { fontSize: 'max(12px, 2.05cqw)' },
	nameMid: { fontSize: 'max(11px, 1.8cqw)' },
	nameTight: { fontSize: 'max(10px, 1.55cqw)' },
	nameDead: {
		color: palette.textDimmed
	},
	character: {
		maxWidth: '100%',
		color: palette.textDimmed,
		lineHeight: 1.2,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	characterFull: { fontSize: 'max(10px, 1.6cqw)' },
	characterMid: { fontSize: 'max(10px, 1.4cqw)' },
	reminders: {
		maxWidth: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '0.4cqw',
		marginTop: '0.3cqw'
	},
	reminderDots: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center'
	},
	pill: {
		maxWidth: '100%',
		height: '2.7cqw',
		display: 'inline-flex',
		alignItems: 'center',
		gap: '0.5cqw',
		padding: '0 0.9cqw 0 0.35cqw',
		borderRadius: '999px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		backgroundColor: palette.controlFace,
		fontSize: 'max(10px, 1.35cqw)',
		fontWeight: '600',
		whiteSpace: 'nowrap'
	},
	pillText: {
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	dot: {
		flexShrink: 0,
		width: '2.1cqw',
		height: '2.1cqw',
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		fontSize: '0.95cqw',
		fontWeight: '700',
		letterSpacing: '-0.02em'
	},
	dotLarge: {
		width: '2.5cqw',
		height: '2.5cqw',
		fontSize: '1.1cqw'
	},
	more: {
		fontSize: 'max(10px, 1.3cqw)',
		fontWeight: '600',
		color: palette.textDimmed
	},
	badge: {
		maxWidth: '100%',
		padding: '0.25cqw 0.9cqw',
		borderRadius: '999px',
		fontSize: 'max(10px, 1.35cqw)',
		fontWeight: '600',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	badgeDetail: {
		maxWidth: '100%',
		fontSize: 'max(9px, 1.2cqw)',
		lineHeight: 1.15,
		color: palette.textDimmed
	}
});

export const SeatRing = (props: Props) => {
	const count = props.seats.length;
	const span = 360 / Math.max(count, 1);
	const fit = getFit(count);
	const topSeat = count > 0 ? wrap(props.topSeat, count) : 0;

	// How far the drawing is turned from where topSeat puts it, in degrees: while dragging, and while settling after a turn
	const [ offset, setOffset ] = useState(0);
	const offsetRef = useRef(0);
	const ringRef = useRef<HTMLDivElement>(null);
	const pointers = useRef(new Map<number, { x: number, y: number }>());
	const gesture = useRef<{ startAngle: number, startOffset: number, twist: boolean, moved: boolean } | null>(null);
	const suppressClick = useRef(false);
	const animation = useRef<number | null>(null);
	const previousTop = useRef(topSeat);

	const updateOffset = (value: number) => {
		offsetRef.current = value;
		setOffset(value);
	};

	const stopAnimation = () => {
		if (animation.current !== null) {
			cancelAnimationFrame(animation.current);
			animation.current = null;
		}
	};

	// Eases the offset back to zero, so seats glide into place
	const settle = () => {
		stopAnimation();
		const from = offsetRef.current;
		if ((from === 0) || reducedMotion()) {
			updateOffset(0);
			return;
		}
		const start = performance.now();
		const duration = 250;
		const step = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			updateOffset(from * (1 - eased));
			animation.current = t < 1 ? requestAnimationFrame(step) : null;
		};
		animation.current = requestAnimationFrame(step);
	};

	// When the top seat changes, keep every seat where it's drawn for now, then let them glide to their new places
	const onTopSeatChange = useEffectEvent(() => {
		if (count === 0) {
			return;
		}
		let delta = topSeat - previousTop.current;
		if (delta > count / 2) {
			delta -= count;
		}
		if (delta < -count / 2) {
			delta += count;
		}
		previousTop.current = topSeat;
		if (delta !== 0) {
			updateOffset(offsetRef.current + (delta * span));
			settle();
		}
	});
	useLayoutEffect(() => onTopSeatChange(), [ topSeat ]);

	useEffect(() => stopAnimation, []);

	// The angle of a point around the centre of the ring, and how far out it is (0 at the centre, 1 at the rim)
	const locate = (x: number, y: number) => {
		const rect = ringRef.current?.getBoundingClientRect();
		if (!rect) {
			return { angle: 0, radius: 0 };
		}
		const dx = x - (rect.left + (rect.width / 2));
		const dy = y - (rect.top + (rect.height / 2));
		return {
			angle: (Math.atan2(dx, -dy) * 180) / Math.PI,
			radius: Math.hypot(dx, dy) / (rect.width / 2)
		};
	};

	const twistAngle = () => {
		const [ a, b ] = [ ...pointers.current.values() ];
		return (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI;
	};

	const turnable = (props.onTurn !== undefined) && (count > 1);

	// A line being drawn, in seat units, so it can be stored against the ring
	const drawing = useRef<{ pointerID: number, points: InkStroke[ 'points' ] } | null>(null);
	const [ liveStroke, setLiveStroke ] = useState<InkStroke | null>(null);

	const toInkPoint = (x: number, y: number) => {
		const at = locate(x, y);
		return { r: Math.round(at.radius * 1000) / 1000, seat: Math.round((((at.angle - offsetRef.current) / span) + topSeat) * 1000) / 1000 };
	};

	// A reminder being dragged to another seat
	const reminderDrag = useRef<{ pointerID: number, key: string, from: number, x: number, y: number, moved: boolean } | null>(null);
	const [ ghost, setGhost ] = useState<{ x: number, y: number, reminder: SeatReminder } | null>(null);
	// Holding a seat still opens its quick actions
	const longPress = useRef<{ timer: number, x: number, y: number, fired: boolean } | null>(null);

	const cancelLongPress = () => {
		if (longPress.current) {
			window.clearTimeout(longPress.current.timer);
			longPress.current = null;
		}
	};

	// The click that follows a gesture is swallowed by the ring, so it neither reaches a seat nor
	// bubbles out to whatever is behind the ring (which would clear the selection)
	const suppressNextClick = () => {
		suppressClick.current = true;
		window.setTimeout(() => {
			suppressClick.current = false;
		}, 400);
	};

	const onClickCapture = (e: MouseEvent) => {
		if (suppressClick.current) {
			suppressClick.current = false;
			e.stopPropagation();
		}
	};

	// The seat under a point, if it's on the ring
	const seatAt = (x: number, y: number) => {
		const at = locate(x, y);
		if ((at.radius < (R_IN / C) * 0.9) || (at.radius > 1.05)) {
			return null;
		}
		return wrap(Math.round(((at.angle - offsetRef.current) / span) + topSeat), count);
	};

	const canInk = (e: PointerEvent<HTMLDivElement>) => !!props.ink?.onStroke && !props.privacy && ((e.pointerType === 'pen') || props.ink.fingerInk);

	const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (canInk(e)) {
			stopAnimation();
			drawing.current = { pointerID: e.pointerId, points: [ toInkPoint(e.clientX, e.clientY) ] };
			setLiveStroke({ points: drawing.current.points });
			capture(e.currentTarget, e.pointerId);
			return;
		}

		const target = e.target as Element;
		const pill = props.onMoveReminder ? target.closest('[data-reminder]') : null;
		if (pill) {
			reminderDrag.current = { pointerID: e.pointerId, key: pill.getAttribute('data-reminder') ?? '', from: Number(pill.getAttribute('data-seat')), x: e.clientX, y: e.clientY, moved: false };
			capture(e.currentTarget, e.pointerId);
			return;
		}

		const face = target.closest('[data-seat-index]');
		if (face && props.onSeatLongPress && (pointers.current.size === 0)) {
			const index = Number(face.getAttribute('data-seat-index'));
			const x = e.clientX;
			const y = e.clientY;
			cancelLongPress();
			longPress.current = {
				x,
				y,
				fired: false,
				timer: window.setTimeout(() => {
					if (longPress.current && !gesture.current?.moved) {
						longPress.current.fired = true;
						props.onSeatLongPress?.(index, x, y);
					}
				}, 550)
			};
		}

		if (!turnable) {
			return;
		}
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

		if (pointers.current.size === 1) {
			// One finger turns the circle by dragging round the ring of seats
			const at = locate(e.clientX, e.clientY);
			if ((at.radius < (R_IN / C)) || (at.radius > 1.05)) {
				pointers.current.delete(e.pointerId);
				return;
			}
			stopAnimation();
			gesture.current = { startAngle: at.angle, startOffset: offsetRef.current, twist: false, moved: false };
		} else if (pointers.current.size === 2) {
			// Two fingers twist it, anywhere on the circle
			stopAnimation();
			gesture.current = { startAngle: twistAngle(), startOffset: offsetRef.current, twist: true, moved: gesture.current?.moved ?? false };
		}
	};

	const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (longPress.current && (Math.hypot(e.clientX - longPress.current.x, e.clientY - longPress.current.y) > 8)) {
			cancelLongPress();
		}
		const drag = reminderDrag.current;
		if (drag && (drag.pointerID === e.pointerId)) {
			if (!drag.moved && (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6)) {
				drag.moved = true;
			}
			const reminder = props.seats[ drag.from ]?.reminders.find(r => r.key === drag.key);
			if (drag.moved && reminder) {
				setGhost({ x: e.clientX, y: e.clientY, reminder: reminder });
			}
			return;
		}
		if (drawing.current && (drawing.current.pointerID === e.pointerId)) {
			drawing.current.points = [ ...drawing.current.points, toInkPoint(e.clientX, e.clientY) ];
			setLiveStroke({ points: drawing.current.points });
			return;
		}
		if (!pointers.current.has(e.pointerId) || !gesture.current) {
			return;
		}
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

		const g = gesture.current;
		let angle: number;
		if (g.twist) {
			if (pointers.current.size < 2) {
				return;
			}
			angle = twistAngle();
		} else {
			angle = locate(e.clientX, e.clientY).angle;
		}

		let delta = angle - g.startAngle;
		if (delta > 180) {
			delta -= 360;
		}
		if (delta < -180) {
			delta += 360;
		}
		// A small wobble is still a tap
		if (!g.moved && (Math.abs(delta) < 4)) {
			return;
		}
		if (!g.moved) {
			// Only capture once it's a drag, so a tap still reaches the seat under it
			g.moved = true;
			pointers.current.forEach((_, id) => capture(e.currentTarget, id));
		}
		updateOffset(g.startOffset + delta);
	};

	const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
		if (longPress.current) {
			if (longPress.current.fired) {
				suppressNextClick();
			}
			cancelLongPress();
		}
		const drag = reminderDrag.current;
		if (drag && (drag.pointerID === e.pointerId)) {
			reminderDrag.current = null;
			setGhost(null);
			suppressNextClick();
			if (drag.moved) {
				const to = seatAt(e.clientX, e.clientY);
				if ((to !== null) && (to !== drag.from)) {
					props.onMoveReminder?.(drag.key, drag.from, to);
				}
			} else {
				// A tap on a reminder is a tap on its seat
				props.onSeatClick?.(drag.from);
			}
			return;
		}
		if (drawing.current && (drawing.current.pointerID === e.pointerId)) {
			const points = drawing.current.points;
			drawing.current = null;
			setLiveStroke(null);
			// Drawing isn't a tap on the seat underneath
			suppressNextClick();
			if (points.length > 1) {
				props.ink?.onStroke?.({ points: points });
			}
			return;
		}
		if (!pointers.current.has(e.pointerId)) {
			return;
		}
		pointers.current.delete(e.pointerId);
		const g = gesture.current;
		if (!g) {
			return;
		}

		if (pointers.current.size === 1) {
			// One finger of a twist lifted: carry on with the other, as a drag
			const [ remaining ] = [ ...pointers.current.values() ];
			gesture.current = { startAngle: locate(remaining.x, remaining.y).angle, startOffset: offsetRef.current, twist: false, moved: g.moved };
			return;
		}

		gesture.current = null;
		if (!g.moved) {
			return;
		}

		// Snap to the nearest seat
		suppressNextClick();
		const steps = Math.round(offsetRef.current / span);
		if (steps === 0) {
			settle();
		} else {
			props.onTurn?.(wrap(topSeat - steps, count));
		}
	};

	const onSeatClick = (index: number) => {
		if (!suppressClick.current) {
			props.onSeatClick?.(index);
		}
	};

	const onSeatKeyDown = (e: KeyboardEvent, index: number) => {
		if ((e.key === 'Enter') || (e.key === ' ')) {
			e.preventDefault();
			props.onSeatClick?.(index);
		}
	};

	const getAngle = (index: number) => ((index - topSeat) * span) + offset;

	const getShape = (seat: Seat, index: number) => {
		const mid = getAngle(index);
		const a0 = mid - (span / 2);
		const a1 = mid + (span / 2);
		const dead = seat.dead && !props.privacy;
		const badge = props.privacy ? null : seat.badge;
		const tinted = badge && (badge.tone !== 'ok') && (badge.tone !== 'dim');
		const description = [
			seat.name,
			(!props.privacy && seat.character) ? seat.character.name : null,
			dead ? 'dead' : null,
			badge ? badge.label : null
		].filter(Boolean).join(', ');

		return (
			<g key={seat.id} {...stylex.props(seat.dimmed && styles.dimmed)}>
				<path
					d={sector(R_IN, R_OUT, a0, a1)}
					data-seat-index={index}
					role='button'
					tabIndex={props.onSeatClick ? 0 : -1}
					aria-label={seat.hand ? `${description}, hand raised` : description}
					aria-pressed={seat.selected || (seat.hand ?? false)}
					aria-disabled={seat.dimmed}
					{...stylex.props(
						styles.face,
						styles.faceFocus,
						dead && styles.faceDead,
						seat.target && styles.faceTarget,
						(seat.highlighted && !props.privacy) && styles.faceHighlighted,
						seat.selected && styles.faceSelected,
						seat.hand && styles.faceHand
					)}
					style={tinted ? { fill: ColourLogic.tint(ColourLogic.toneColour(badge.tone)) } : undefined}
					onClick={e => {
						e.stopPropagation();
						onSeatClick(index);
					}}
					onKeyDown={e => onSeatKeyDown(e, index)}
				/>
				<path
					d={sector(R_OUT - BAND, R_OUT, a0, a1)}
					{...stylex.props(styles.band, dead && styles.bandDead)}
					style={{ fill: props.privacy ? palette.controlBorder : ColourLogic.roleColour(seat.character?.role ?? null) }}
				/>
			</g>
		);
	};

	const getReminders = (seat: Seat, index: number) => {
		// Reminders that can be moved take pointer events, so they can be picked up and dragged to another seat
		const grab = (r: SeatReminder) => (r.movable && props.onMoveReminder) ? { 'data-reminder': r.key, 'data-seat': index } : {};
		if (props.privacy) {
			return null;
		}

		if (seat.hand) {
			return (
				<div {...stylex.props(styles.reminders)}>
					<span {...stylex.props(styles.handPill)}><Hand {...stylex.props(styles.handIcon)} strokeWidth={2.5} aria-hidden='true' />{fit === 'tight' ? null : 'Hand up'}</span>
				</div>
			);
		}

		if (seat.badge) {
			return (
				<div {...stylex.props(styles.reminders)}>
					<span {...stylex.props(styles.badge)} style={{ backgroundColor: ColourLogic.toneColour(seat.badge.tone), color: ColourLogic.onToneColour(seat.badge.tone) }}>{seat.badge.label}</span>
					{(seat.badge.detail && (fit === 'full')) ? <span {...stylex.props(styles.badgeDetail)}>{seat.badge.detail}</span> : null}
				</div>
			);
		}

		if (seat.reminders.length === 0) {
			return null;
		}

		// At most two show; the rest are counted
		const shown = seat.reminders.slice(0, 2);
		const more = seat.reminders.length > 2 ? <span {...stylex.props(styles.more)}>+{seat.reminders.length - 2}</span> : null;
		const dotStyle = (r: SeatReminder): CSSProperties => ({ backgroundColor: ColourLogic.roleColour(r.role), color: ColourLogic.onRoleColour(r.role) });

		if (fit === 'full') {
			return (
				<div {...stylex.props(styles.reminders)}>
					{shown.map(r => (
						<span key={r.key} title={r.label} {...grab(r)} {...stylex.props(styles.pill, (r.movable && props.onMoveReminder) && styles.grabbable)}>
							<span {...stylex.props(styles.dot)} style={dotStyle(r)}>{r.monogram}</span>
							<span {...stylex.props(styles.pillText)}>{r.label}</span>
						</span>
					))}
					{more}
				</div>
			);
		}

		return (
			<div {...stylex.props(styles.reminders, styles.reminderDots)}>
				{shown.map(r => <span key={r.key} title={r.label} {...grab(r)} {...stylex.props(styles.dot, styles.dotLarge, (r.movable && props.onMoveReminder) && styles.grabbable)} style={dotStyle(r)}>{r.monogram}</span>)}
				{more}
			</div>
		);
	};

	const getLabel = (seat: Seat, index: number) => {
		const mid = getAngle(index);
		const at = polar(R_TEXT, mid);
		// Text stays upright, so in the bottom half the stack is flipped to keep the monogram by the rim
		const flipped = Math.cos((mid * Math.PI) / 180) < -0.5;
		const width = Math.min(230, 2 * R_TEXT * Math.sin(Math.PI / Math.max(count, 2)) * 0.84);
		const dead = seat.dead && !props.privacy;
		const character = props.privacy ? null : seat.character;
		const tight = fit === 'tight';

		const disc = character ?
			<div
				key='disc'
				{...stylex.props(styles.disc, fit === 'full' ? styles.discFull : (fit === 'mid' ? styles.discMid : styles.discTight), dead && styles.discDead)}
				style={{ backgroundColor: ColourLogic.tint(ColourLogic.roleColour(character.role), 18), boxShadow: `inset 0 0 0 0.3cqw ${ColourLogic.roleColour(character.role)}` }}
			>
				{character.monogram}
				{dead ? <span {...stylex.props(styles.mark, styles.markLeft, tight && styles.markTight, tight && styles.markLeftTight)}><Skull {...stylex.props(styles.markIcon, tight && styles.markIconTight)} strokeWidth={2.5} aria-hidden='true' /></span> : null}
				{(dead && seat.ghostVote) ? <span {...stylex.props(styles.mark, styles.markRight, tight && styles.markTight, tight && styles.markRightTight)}><Ghost {...stylex.props(styles.markIcon, tight && styles.markIconTight)} strokeWidth={2.5} aria-hidden='true' /></span> : null}
			</div>
			: null;

		const names = (
			<div key='names' {...stylex.props(styles.name)} style={{ maxWidth: '100%' }}>
				<div {...stylex.props(styles.name, fit === 'full' ? styles.nameFull : (fit === 'mid' ? styles.nameMid : styles.nameTight), dead && styles.nameDead)}>{seat.name}</div>
				{(character && (fit !== 'tight')) ? <div {...stylex.props(styles.character, fit === 'full' ? styles.characterFull : styles.characterMid)}>{character.name}</div> : null}
			</div>
		);

		const reminders = <div key='reminders' style={{ maxWidth: '100%' }}>{getReminders(seat, index)}</div>;
		const parts = flipped ? [ reminders, names, disc ] : [ disc, names, reminders ];

		return (
			<div
				key={seat.id}
				aria-hidden='true'
				{...stylex.props(styles.label, seat.dimmed && styles.dimmed)}
				style={{ left: `${at.x / 10}%`, top: `${at.y / 10}%`, width: `${width / 10}cqw` }}
			>
				{parts}
			</div>
		);
	};

	// A dotted curve just inside the ring, bowing towards the centre, with an arrowhead at the far seat
	const getLink = () => {
		const link = props.link;
		if (!link || (link.from === link.to) || !props.seats[ link.from ] || !props.seats[ link.to ]) {
			return null;
		}
		const r = R_IN - 14;
		const p0 = polar(r, getAngle(link.from));
		const p1 = polar(r, getAngle(link.to));
		const pull = 0.35;
		const cx = C + ((((p0.x + p1.x) / 2) - C) * pull);
		const cy = C + ((((p0.y + p1.y) / 2) - C) * pull);
		// The arrowhead points along the curve as it arrives
		const angle = Math.atan2(p1.y - cy, p1.x - cx);
		const head = (len: number, spread: number) => {
			const f = (v: number) => v.toFixed(1);
			const back = (a: number) => `${f(p1.x - (len * Math.cos(a)))} ${f(p1.y - (len * Math.sin(a)))}`;
			return `M${f(p1.x)} ${f(p1.y)} L${back(angle - spread)} L${back(angle + spread)} Z`;
		};
		return (
			<g aria-hidden='true'>
				<path d={`M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`} {...stylex.props(styles.link)} />
				<path d={head(26, 0.45)} {...stylex.props(styles.linkHead)} />
			</g>
		);
	};

	// Ink is stored against the ring, so it's drawn turned with the seats
	const getInkPath = (stroke: InkStroke, key: string) => {
		const d = stroke.points.map((p, n) => {
			const at = polar(p.r * C, ((p.seat - topSeat) * span) + offset);
			return `${n === 0 ? 'M' : 'L'}${at.x.toFixed(1)} ${at.y.toFixed(1)}`;
		}).join(' ');
		return <path key={key} d={d} {...stylex.props(styles.ink)} />;
	};

	// The selected seat is drawn last, so its outline isn't covered by its neighbours
	const order = props.seats.map((seat, index) => ({ seat, index }))
		.sort((a, b) => Number(a.seat.selected) - Number(b.seat.selected));

	return (
		<div
			ref={ringRef}
			{...stylex.props(styles.ring)}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}
			onClickCapture={onClickCapture}
		>
			{props.centre}
			<svg {...stylex.props(styles.svg)} viewBox={`0 0 ${SIZE} ${SIZE}`}>
				{order.map(o => getShape(o.seat, o.index))}
				{props.privacy ? null : getLink()}
			</svg>
			{props.seats.map(getLabel)}
			{
				ghost ?
					<span aria-hidden='true' {...stylex.props(styles.pill, styles.ghost)} style={{ left: ghost.x, top: ghost.y, fontSize: '14px', height: '28px' }}>
						<span {...stylex.props(styles.dot)} style={{ backgroundColor: ColourLogic.roleColour(ghost.reminder.role), color: ColourLogic.onRoleColour(ghost.reminder.role), width: '20px', height: '20px', fontSize: '10px' }}>{ghost.reminder.monogram}</span>
						{ghost.reminder.label}
					</span>
					: null
			}
			{
				!props.privacy && ((props.ink?.strokes.length ?? 0) > 0 || liveStroke) ?
					<svg aria-hidden='true' {...stylex.props(styles.inkLayer)} viewBox={`0 0 ${SIZE} ${SIZE}`}>
						{(props.ink?.strokes ?? []).map((s, n) => getInkPath(s, `${n}`))}
						{liveStroke ? getInkPath(liveStroke, 'live') : null}
					</svg>
					: null
			}
		</div>
	);
};
