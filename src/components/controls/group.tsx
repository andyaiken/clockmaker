import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { palette } from '../../tokens.stylex';

interface Props {
	children: ReactNode;
}

const styles = stylex.create({
	group: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		padding: '14px',
		borderRadius: '14px',
		backgroundColor: palette.controlFace,
		boxShadow: '0 1px 2px rgb(0 0 0 / 0.06)'
	}
});

// A card that holds one section, eg a nomination or the Setup steps
export const Group = (props: Props) => {
	return (
		<section {...stylex.props(styles.group)}>
			{props.children}
		</section>
	);
};
