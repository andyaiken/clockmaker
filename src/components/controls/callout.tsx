import * as stylex from '@stylexjs/stylex';
import { CircleAlert, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { palette } from '../../tokens.stylex';

interface Props {
	type?: 'information' | 'warning' | 'error';
	children: ReactNode;
}

const styles = stylex.create({
	callout: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: '10px',
		padding: '10px 12px',
		borderRadius: '10px',
		color: palette.text,
		fontSize: '15px'
	},
	icon: {
		flexShrink: 0,
		marginTop: '1px'
	},
	content: {
		flex: '1 1 auto',
		minWidth: 0
	},
	information: {
		backgroundColor: `color-mix(in srgb, ${palette.roleTownsfolk} 12%, ${palette.controlFace})`
	},
	informationIcon: {
		color: palette.roleTownsfolk
	},
	warning: {
		backgroundColor: `color-mix(in srgb, ${palette.warning} 14%, ${palette.controlFace})`
	},
	warningIcon: {
		color: palette.warning
	},
	error: {
		backgroundColor: `color-mix(in srgb, ${palette.roleDemon} 12%, ${palette.controlFace})`
	},
	errorIcon: {
		color: palette.roleDemon
	}
});

const icons = {
	information: Info,
	warning: TriangleAlert,
	error: CircleAlert
};

// A tinted box with an icon, for something the Storyteller should notice
export const Callout = (props: Props) => {
	const type = props.type ?? 'information';
	const Icon = icons[ type ];

	return (
		<div role={type === 'information' ? 'note' : 'alert'} {...stylex.props(styles.callout, styles[ type ])}>
			<Icon size={20} strokeWidth={2} aria-hidden='true' {...stylex.props(styles.icon, styles[ `${type}Icon` ])} />
			<div {...stylex.props(styles.content)}>{props.children}</div>
		</div>
	);
};
