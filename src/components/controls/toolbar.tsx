import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

interface Props {
	// Read out by VoiceOver, eg 'Grimoire'
	label?: string;
	children: ReactNode;
}

const styles = stylex.create({
	toolbar: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: '10px'
	}
});

// A row of tools above the content they act on
export const Toolbar = (props: Props) => {
	return (
		<div role='toolbar' aria-label={props.label} {...stylex.props(styles.toolbar)} onClick={e => e.stopPropagation()}>
			{props.children}
		</div>
	);
};
