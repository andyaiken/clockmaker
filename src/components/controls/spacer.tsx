import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

interface Props {
	orientation?: 'horizontal' | 'vertical';
	children?: ReactNode;
}

const styles = stylex.create({
	spacer: {
		display: 'flex',
		gap: '10px'
	},
	horizontal: {
		flexDirection: 'row',
		flexWrap: 'wrap'
	},
	vertical: {
		flexDirection: 'column'
	}
});

export const Spacer = (props: Props) => {
	return (
		<div {...stylex.props(styles.spacer, props.orientation === 'horizontal' ? styles.horizontal : styles.vertical)}>
			{props.children}
		</div>
	);
};
