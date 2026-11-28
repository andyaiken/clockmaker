import * as stylex from '@stylexjs/stylex';
import { palette } from '../../tokens.stylex';

const styles = stylex.create({
	divider: {
		margin: '15px 0',
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: palette.controlBorder
	}
});

export const Divider = () => {
	return (
		<div {...stylex.props(styles.divider)} />
	);
};
