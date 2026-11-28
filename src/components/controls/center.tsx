import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

interface Props {
	children?: ReactNode;
}

const styles = stylex.create({
	center: {
		display: 'flex',
		justifyContent: 'center'
	}
});

export const Center = (props: Props) => {
	return (
		<div {...stylex.props(styles.center)}>
			{props.children}
		</div>
	);
};
