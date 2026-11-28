import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { palette } from '../../tokens.stylex';

interface Props {
	type?: 'body' | 'h1' | 'h2' | 'h3' | 'dimmed';
	// Shows the text in red, eg for a count that's over its limit
	error?: boolean;
	children: ReactNode;
}

const styles = stylex.create({
	text: {
		color: palette.text,
		fontSize: '16px'
	},
	body: {
		//
	},
	h1: {
		color: palette.textHeader,
		fontSize: '24px',
		fontWeight: '600'
	},
	h2: {
		color: palette.textHeader,
		fontSize: '20px',
		fontWeight: '600'
	},
	h3: {
		color: palette.textHeader,
		fontSize: '18px',
		fontWeight: '600'
	},
	dimmed: {
		color: palette.textDimmed
	},
	error: {
		color: palette.textError
	}
});

export const Text = (props: Props) => {
	return (
		<div {...stylex.props(styles.text, styles[ props.type || 'body' ], props.error && styles.error)}>
			{props.children}
		</div>
	);
};
