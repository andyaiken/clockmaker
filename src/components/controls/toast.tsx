import * as stylex from '@stylexjs/stylex';
import { Undo2, X } from 'lucide-react';
import { palette } from '../../tokens.stylex';
import { useEffect } from 'react';

interface Props {
	text: string;
	// How long it stays, in milliseconds
	duration?: number;
	onUndo: () => void;
	onDismiss: () => void;
}

const styles = stylex.create({
	toast: {
		position: 'fixed',
		left: '50%',
		// At the top, clear of the controls under the circle and the panel's footer
		top: '76px',
		zIndex: 150,
		transform: 'translateX(-50%)',
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		maxWidth: 'calc(100vw - 48px)',
		padding: '6px 6px 6px 18px',
		borderRadius: '16px',
		backgroundColor: palette.text,
		color: palette.background,
		boxShadow: '0 10px 30px rgb(0 0 0 / 0.3)',
		fontSize: '15px',
		animationName: {
			'default': stylex.keyframes({
				from: { opacity: 0, transform: 'translate(-50%, -16px)' },
				to: { opacity: 1, transform: 'translate(-50%, 0)' }
			}),
			'@media (prefers-reduced-motion: reduce)': 'none'
		},
		animationDuration: '200ms',
		animationTimingFunction: 'ease-out'
	},
	text: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		marginRight: '8px'
	},
	button: {
		appearance: 'none',
		margin: 0,
		minHeight: '40px',
		display: 'inline-flex',
		alignItems: 'center',
		gap: '6px',
		padding: '0 12px',
		borderWidth: 0,
		borderRadius: '10px',
		backgroundColor: {
			'default': 'transparent',
			':hover': { 'default': null, '@media (hover: hover)': 'rgb(127 127 127 / 0.25)' },
			':active': 'rgb(127 127 127 / 0.25)'
		},
		color: 'inherit',
		fontFamily: 'inherit',
		fontSize: '15px',
		fontWeight: '700',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		}
	}
});

// A short note about what just happened, with Undo; it goes away by itself
export const Toast = (props: Props) => {
	const { onDismiss } = props;
	const duration = props.duration ?? 10000;

	useEffect(() => {
		const timer = window.setTimeout(onDismiss, duration);
		return () => window.clearTimeout(timer);
	}, [ props.text, duration, onDismiss ]);

	return (
		<div role='status' aria-live='polite' {...stylex.props(styles.toast)}>
			<span {...stylex.props(styles.text)}>{props.text}</span>
			<button type='button' {...stylex.props(styles.button)} onClick={props.onUndo}>
				<Undo2 size={18} aria-hidden='true' />
				Undo
			</button>
			<button type='button' aria-label='Dismiss' {...stylex.props(styles.button)} onClick={onDismiss}>
				<X size={18} aria-hidden='true' />
			</button>
		</div>
	);
};
