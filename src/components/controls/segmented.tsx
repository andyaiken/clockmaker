import * as stylex from '@stylexjs/stylex';
import { palette } from '../../tokens.stylex';

interface Props {
	options: { id: string, label: string }[];
	selectedID: string | null;
	// Stretches the control to fill its container, with equal-width segments
	block?: boolean;
	// Read out by VoiceOver, eg 'Alignment'
	label?: string;
	onChange: (id: string) => void;
}

const styles = stylex.create({
	segmented: {
		display: 'inline-flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: '2px',
		padding: '3px',
		borderRadius: '12px',
		backgroundColor: palette.backgroundDark,
		maxWidth: '100%',
		alignSelf: 'flex-start'
	},
	block: {
		display: 'flex',
		width: '100%',
		alignSelf: 'stretch',
		flexWrap: 'nowrap'
	},
	segment: {
		appearance: 'none',
		margin: 0,
		minHeight: '44px',
		padding: '2px 14px',
		borderWidth: 0,
		borderRadius: '9px',
		backgroundColor: {
			'default': 'transparent',
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		color: palette.text,
		fontFamily: 'inherit',
		fontSize: '15px',
		whiteSpace: 'nowrap',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		outlineOffset: '1px',
		transition: {
			'default': 'background-color 200ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	segmentBlock: {
		flex: '1 1 0',
		minWidth: 0,
		paddingLeft: '4px',
		paddingRight: '4px',
		overflow: 'hidden',
		textOverflow: 'ellipsis'
	},
	selected: {
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFace }
		},
		color: palette.textHighlight,
		fontWeight: '600',
		boxShadow: '0 1px 3px rgb(0 0 0 / 0.15)',
		cursor: 'default'
	}
});

// A row of mutually exclusive choices, for short sets like Good / Evil
export const Segmented = (props: Props) => {
	return (
		<div role='radiogroup' aria-label={props.label} {...stylex.props(styles.segmented, props.block && styles.block)}>
			{props.options.map(o => {
				const selected = props.selectedID === o.id;
				return (
					<button
						type='button'
						role='radio'
						aria-checked={selected}
						key={o.id}
						{...stylex.props(styles.segment, props.block && styles.segmentBlock, selected && styles.selected)}
						onClick={() => {
							if (!selected) {
								props.onChange(o.id);
							}
						}}
					>
						{o.label}
					</button>
				);
			})}
		</div>
	);
};
