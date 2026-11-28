import * as stylex from '@stylexjs/stylex';
import type { DayTimer } from '../../hooks/use-day-timer';
import { palette } from '../../tokens.stylex';
import { useDayTimerRemaining } from '../../hooks/use-day-timer';

interface Props {
	timer: DayTimer;
}

// Uses the same 512 x 512 coordinate space and box as clock-ring.svg and the clock mechanism,
// so the gauge always sits in the band between the ring's inner edge (r = 186)
// and the mechanism (r <= ~142), whatever size the Grimoire is drawn at
const SIZE = 512;
const STROKE = 30;
const RADIUS = 164;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const styles = stylex.create({
	gauge: {
		position: 'absolute',
		left: '26%', // The middle of the seat ring, as in seat-ring.tsx
		top: '26%',
		width: '48%',
		height: '48%',
		pointerEvents: 'none'
	},
	arc: {
		stroke: palette.controlFacePrimary
	}
});

export const GrimoireCentre = (props: Props) => {
	const remaining = useDayTimerRemaining(props.timer);
	const running = props.timer.endsAt !== null;
	const fraction = props.timer.duration > 0 ? Math.min(1, Math.max(0, remaining / props.timer.duration)) : 0;

	if (!running) {
		return null;
	}

	return (
		<svg {...stylex.props(styles.gauge)} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden='true'>
			<circle
				cx={SIZE / 2}
				cy={SIZE / 2}
				r={RADIUS}
				fill='none'
				{...stylex.props(styles.arc)}
				strokeWidth={STROKE}
				strokeLinecap='round'
				strokeDasharray={CIRCUMFERENCE}
				strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
				transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
			/>
		</svg>
	);
};
