import * as stylex from '@stylexjs/stylex';
import { Check } from 'lucide-react';
import { palette } from '../../tokens.stylex';

interface Props {
	// badge is a short marker shown before the label, eg a seat number
	options: { id: string, label: string, badge?: string }[];
	selectedIDs: string[];
	onToggle: (id: string) => void;
}

const styles = stylex.create({
	chips: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: '6px'
	},
	chip: {
		appearance: 'none',
		margin: 0,
		minHeight: '44px',
		// Room for the tick is always kept, so toggling a chip never changes its width and re-wraps the set
		padding: '2px 14px 2px 10px',
		display: 'inline-flex',
		alignItems: 'center',
		gap: '6px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '22px',
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight },
			':active': palette.controlFaceHighlight
		},
		color: palette.text,
		fontFamily: 'inherit',
		fontSize: '15px',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		outlineOffset: '2px',
		transition: {
			'default': 'background-color 120ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	on: {
		borderColor: palette.controlBorderSelected,
		backgroundColor: {
			'default': palette.controlFaceHighlight,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		color: palette.textHighlight,
		fontWeight: '600'
	},
	tick: {
		flexShrink: 0,
		opacity: 0.2,
		transition: {
			'default': 'opacity 120ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	tickOn: {
		opacity: 1
	},
	// The label sits over a hidden bold copy of itself, so turning bold when on doesn't widen the chip
	label: {
		display: 'inline-grid'
	},
	labelLayer: {
		gridArea: '1 / 1'
	},
	labelSizer: {
		gridArea: '1 / 1',
		fontWeight: '600',
		visibility: 'hidden'
	},
	badge: {
		minWidth: '22px',
		height: '22px',
		padding: '0 4px',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '11px',
		backgroundColor: palette.backgroundDark,
		color: palette.textDimmed,
		fontSize: '12px',
		fontWeight: '600',
		fontVariantNumeric: 'tabular-nums'
	}
});

// A wrapping set of chips, any number of which can be on; a single choice passes at most one ID in selectedIDs
export const Chips = (props: Props) => {
	return (
		<div {...stylex.props(styles.chips)}>
			{props.options.map(o => {
				const on = props.selectedIDs.includes(o.id);
				return (
					<button
						key={o.id}
						type='button'
						aria-pressed={on}
						{...stylex.props(styles.chip, on && styles.on)}
						onClick={() => props.onToggle(o.id)}
					>
						<Check size={16} strokeWidth={2.5} aria-hidden='true' {...stylex.props(styles.tick, on && styles.tickOn)} />
						{o.badge ? <span {...stylex.props(styles.badge)}>{o.badge}</span> : null}
						<span {...stylex.props(styles.label)}>
							<span {...stylex.props(styles.labelLayer)}>{o.label}</span>
							<span aria-hidden='true' {...stylex.props(styles.labelSizer)}>{o.label}</span>
						</span>
					</button>
				);
			})}
		</div>
	);
};
