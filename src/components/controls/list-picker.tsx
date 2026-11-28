import * as stylex from '@stylexjs/stylex';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { palette } from '../../tokens.stylex';

interface Props {
	options: { id: string, label: ReactNode }[];
	selectedID: string | null;
	// 'grid' lays the rows out in as many columns as fit, for short lists in wide spaces
	layout?: 'column' | 'grid';
	onChange: (id: string) => void;
}

const styles = stylex.create({
	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: '6px'
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
		gap: '8px'
	},
	row: {
		appearance: 'none',
		margin: 0,
		minHeight: '50px',
		padding: '8px 12px',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: '10px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '10px',
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight },
			':active': palette.controlFaceHighlight
		},
		color: palette.text,
		fontFamily: 'inherit',
		fontSize: '16px',
		textAlign: 'left',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		outlineOffset: '2px'
	},
	selected: {
		borderColor: palette.controlBorderSelected,
		backgroundColor: {
			'default': palette.controlFaceHighlight,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		cursor: 'default'
	},
	content: {
		flex: '1 1 auto',
		minWidth: 0
	},
	check: {
		flexShrink: 0,
		color: palette.textHighlight
	}
});

// A list of rows to pick one from, for choices that need more than a word, like scripts
export const ListPicker = (props: Props) => {
	return (
		<div role='radiogroup' {...stylex.props(props.layout === 'grid' ? styles.grid : styles.list)}>
			{props.options.map(o => {
				const selected = props.selectedID === o.id;
				return (
					<button
						type='button'
						role='radio'
						aria-checked={selected}
						key={o.id}
						{...stylex.props(styles.row, selected && styles.selected)}
						onClick={() => {
							if (!selected) {
								props.onChange(o.id);
							}
						}}
					>
						<div {...stylex.props(styles.content)}>{o.label}</div>
						{selected ? <Check size={20} strokeWidth={2.5} aria-hidden='true' {...stylex.props(styles.check)} /> : null}
					</button>
				);
			})}
		</div>
	);
};
