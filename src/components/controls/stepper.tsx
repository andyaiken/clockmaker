import * as stylex from '@stylexjs/stylex';
import { Minus, Plus } from 'lucide-react';
import { palette } from '../../tokens.stylex';

interface Props {
	value: number;
	min?: number;
	max?: number;
	// Read out by VoiceOver, eg 'Votes'
	label: string;
	onChange: (value: number) => void;
}

const styles = stylex.create({
	stepper: {
		display: 'inline-flex',
		alignSelf: 'flex-start',
		alignItems: 'center',
		gap: '4px',
		padding: '3px',
		borderRadius: '14px',
		backgroundColor: palette.backgroundDark
	},
	step: {
		appearance: 'none',
		margin: 0,
		width: '52px',
		height: '52px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 0,
		borderRadius: '11px',
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight },
			':active': palette.controlFaceHighlight
		},
		color: palette.text,
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		transform: {
			'default': null,
			':active': 'scale(0.94)'
		},
		transition: {
			'default': 'transform 120ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	stepDisabled: {
		opacity: '0.4',
		cursor: 'default',
		transform: 'none'
	},
	value: {
		minWidth: '56px',
		textAlign: 'center',
		color: palette.text,
		fontSize: '28px',
		fontWeight: '600',
		fontVariantNumeric: 'tabular-nums'
	}
});

// A large number between - and + buttons
export const Stepper = (props: Props) => {
	const min = props.min ?? 0;
	const canDecrease = props.value > min;
	const canIncrease = (props.max === undefined) || (props.value < props.max);

	return (
		<div role='group' aria-label={props.label} {...stylex.props(styles.stepper)}>
			<button type='button' aria-label={`Fewer ${props.label.toLowerCase()}`} disabled={!canDecrease} {...stylex.props(styles.step, !canDecrease && styles.stepDisabled)} onClick={() => props.onChange(props.value - 1)}>
				<Minus size={22} strokeWidth={2.5} aria-hidden='true' />
			</button>
			<output aria-live='polite' {...stylex.props(styles.value)}>{props.value}</output>
			<button type='button' aria-label={`More ${props.label.toLowerCase()}`} disabled={!canIncrease} {...stylex.props(styles.step, !canIncrease && styles.stepDisabled)} onClick={() => props.onChange(props.value + 1)}>
				<Plus size={22} strokeWidth={2.5} aria-hidden='true' />
			</button>
		</div>
	);
};
