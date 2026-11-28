import * as stylex from '@stylexjs/stylex';
import { palette } from '../../../tokens.stylex';

interface Props {
	// Past phases, oldest first
	phases: { key: string, label: string }[];
	// The phase being looked back at; null for now
	selectedKey: string | null;
	onSelect: (key: string | null) => void;
}

const styles = stylex.create({
	strip: {
		display: 'flex',
		alignItems: 'center',
		gap: '4px',
		overflowX: 'auto',
		maxWidth: '100%',
		padding: '2px'
	},
	label: {
		fontSize: '12px',
		fontWeight: '600',
		color: palette.textDimmed,
		marginRight: '4px',
		whiteSpace: 'nowrap'
	},
	item: {
		appearance: 'none',
		margin: 0,
		flex: '0 0 auto',
		minHeight: '34px',
		padding: '2px 12px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '17px',
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		color: palette.text,
		fontFamily: 'inherit',
		fontSize: '13px',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		}
	},
	selected: {
		borderColor: palette.controlFacePrimary,
		backgroundColor: {
			'default': palette.controlFacePrimary,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFacePrimary }
		},
		color: palette.textLight,
		fontWeight: '600'
	}
});

// Steps back through the game: Setup, Night 1, Day 1 and on, then Now
export const HistoryStrip = (props: Props) => {
	const items = [ ...props.phases, { key: '', label: 'Now' } ];
	return (
		<div role='radiogroup' aria-label='Look back' {...stylex.props(styles.strip)}>
			<span {...stylex.props(styles.label)}>Look back</span>
			{
				items.map(item => {
					const selected = (item.key || null) === props.selectedKey;
					return (
						<button
							key={item.key || 'now'}
							type='button'
							role='radio'
							aria-checked={selected}
							{...stylex.props(styles.item, selected && styles.selected)}
							onClick={() => props.onSelect(item.key || null)}
						>
							{item.label}
						</button>
					);
				})
			}
		</div>
	);
};
