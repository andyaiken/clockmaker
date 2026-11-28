import * as stylex from '@stylexjs/stylex';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { palette } from '../../tokens.stylex';

interface Props {
	clickable: boolean;
	outlined: boolean;
	children: ReactNode;
	onClick: () => void;
}

const styles = stylex.create({
	targetOutline: {
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		borderWidth: '2px',
		borderStyle: 'dashed',
		borderColor: 'transparent',
		borderRadius: '5px',
		padding: '3px'
	},
	clickable: {
		cursor: 'pointer'
	},
	outlined: {
		borderColor: palette.controlBorderSelected
	}
});

export const TargetOutline = (props: Props) => {
	const onClick = (e: MouseEvent) => {
		e.stopPropagation();
		props.onClick();
	};

	// It wraps other content, so it can't be a <button>; this makes it work like one from a keyboard
	const onKeyDown = (e: KeyboardEvent) => {
		if ((e.target === e.currentTarget) && ((e.key === 'Enter') || (e.key === ' '))) {
			e.preventDefault();
			e.stopPropagation();
			props.onClick();
		}
	};

	return (
		<div role='button' tabIndex={0} {...stylex.props(styles.targetOutline, props.clickable && styles.clickable, props.outlined && styles.outlined)} onClick={onClick} onKeyDown={onKeyDown}>
			{props.children}
		</div>
	);
};
