import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { palette } from '../../tokens.stylex';

interface Props {
	children: ReactNode;
}

const styles = stylex.create({
	tag: {
		display: 'inline-flex',
		alignItems: 'center',
		width: 'fit-content',
		borderRadius: '999px',
		backgroundColor: palette.backgroundDark,
		color: palette.textDimmed,
		fontSize: '13px',
		fontWeight: '500',
		lineHeight: '18px',
		padding: '2px 10px',
		whiteSpace: 'nowrap'
	}
});

// A small pill for a label, eg a script's type
export const Tag = (props: Props) => {
	return (
		<span {...stylex.props(styles.tag)}>
			{props.children}
		</span>
	);
};
