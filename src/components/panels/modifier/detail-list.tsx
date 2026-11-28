import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { palette } from '../../../tokens.stylex';

interface Props {
	items: ReactNode[];
}

const styles = stylex.create({
	list: {
		margin: 0,
		paddingLeft: '18px',
		fontSize: '13px',
		color: palette.text,
		display: 'flex',
		flexDirection: 'column',
		gap: '2px'
	}
});

// A bulleted list of a modifier's details
export const DetailList = (props: Props) => {
	if (props.items.length === 0) {
		return null;
	}

	return (
		<ul {...stylex.props(styles.list)}>
			{props.items.map((item, n) => <li key={n}>{item}</li>)}
		</ul>
	);
};
