import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useEffect, useRef } from 'react';
import { Button } from './button';
import { X } from 'lucide-react';
import { palette } from '../../tokens.stylex';

interface Props {
	title: string;
	children: ReactNode;
	onClose: () => void;
}

const styles = stylex.create({
	backdrop: {
		position: 'fixed',
		inset: 0,
		zIndex: 90,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '40px',
		backgroundColor: 'rgb(0 0 0 / 0.35)',
		animationName: {
			'default': stylex.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } }),
			'@media (prefers-reduced-motion: reduce)': 'none'
		},
		animationDuration: '200ms'
	},
	sheet: {
		width: 'min(680px, 100%)',
		maxHeight: '100%',
		display: 'flex',
		flexDirection: 'column',
		borderRadius: '18px',
		backgroundColor: palette.background,
		color: palette.text,
		boxShadow: '0 20px 60px rgb(0 0 0 / 0.3)',
		overflow: 'hidden',
		outline: 'none',
		animationName: {
			'default': stylex.keyframes({
				from: { opacity: 0, transform: 'translateY(24px)' },
				to: { opacity: 1, transform: 'translateY(0)' }
			}),
			'@media (prefers-reduced-motion: reduce)': 'none'
		},
		animationDuration: '350ms',
		animationTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px',
		padding: '8px 8px 8px 20px',
		borderBottomWidth: '1px',
		borderBottomStyle: 'solid',
		borderBottomColor: palette.controlBorder
	},
	title: {
		margin: 0,
		fontSize: '20px',
		fontWeight: '600'
	},
	body: {
		flex: '1 1 auto',
		overflowY: 'auto',
		padding: '20px'
	}
});

// A panel over the page for something that's needed now and then, like the script or the log; tapping outside or Escape closes it
export const Sheet = (props: Props) => {
	const sheetRef = useRef<HTMLDivElement>(null);
	// The latest handler, so the sheet sets itself up once however often its parent re-renders
	const onCloseRef = useRef(props.onClose);
	onCloseRef.current = props.onClose;
	const onClose = () => onCloseRef.current();

	useEffect(() => {
		const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		sheetRef.current?.focus();
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onCloseRef.current();
			}
		};
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
			previous?.focus();
		};
	}, []);

	return (
		<div {...stylex.props(styles.backdrop)} onClick={onClose}>
			<div
				ref={sheetRef}
				role='dialog'
				aria-modal='true'
				aria-label={props.title}
				tabIndex={-1}
				{...stylex.props(styles.sheet)}
				onClick={e => e.stopPropagation()}
			>
				<div {...stylex.props(styles.header)}>
					<h2 {...stylex.props(styles.title)}>{props.title}</h2>
					<Button type='quiet' icon={X} iconOnly={true} label='Close' onClick={onClose} />
				</div>
				<div {...stylex.props(styles.body)}>
					{props.children}
				</div>
			</div>
		</div>
	);
};
