import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { palette } from '../../tokens.stylex';

interface Props {
	label: string;
	icon?: LucideIcon;
	// How long it must be held, in milliseconds
	duration?: number;
	onHold: () => void;
}

const styles = stylex.create({
	button: {
		position: 'relative',
		overflow: 'hidden',
		appearance: 'none',
		margin: 0,
		minHeight: '50px',
		padding: '2px 16px',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlFacePrimary,
		borderRadius: '10px',
		backgroundColor: palette.controlFace,
		color: palette.textHighlight,
		fontFamily: 'inherit',
		fontSize: '16px',
		fontWeight: '600',
		cursor: 'pointer',
		touchAction: 'none',
		userSelect: 'none',
		WebkitUserSelect: 'none',
		WebkitTouchCallout: 'none',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		outlineOffset: '2px'
	},
	// Fills from the left while the button is held
	progress: {
		position: 'absolute',
		inset: 0,
		backgroundColor: palette.controlFaceHighlight,
		transformOrigin: 'left center',
		transform: 'scaleX(0)'
	},
	content: {
		position: 'relative',
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px'
	}
});

// A button that only acts once it has been held down, so it can't be set off by accident
export const HoldButton = (props: Props) => {
	const duration = props.duration ?? 700;
	const [ holding, setHolding ] = useState(false);
	const timer = useRef<number | null>(null);
	const Icon = props.icon;

	const cancel = () => {
		if (timer.current !== null) {
			window.clearTimeout(timer.current);
			timer.current = null;
		}
		setHolding(false);
	};

	const start = () => {
		cancel();
		setHolding(true);
		timer.current = window.setTimeout(() => {
			timer.current = null;
			setHolding(false);
			props.onHold();
		}, duration);
	};

	useEffect(() => cancel, []);

	return (
		<button
			type='button'
			{...stylex.props(styles.button)}
			onPointerDown={e => {
				e.stopPropagation();
				start();
			}}
			onPointerUp={cancel}
			onPointerLeave={cancel}
			onPointerCancel={cancel}
			onKeyDown={e => {
				if (((e.key === 'Enter') || (e.key === ' ')) && !e.repeat) {
					e.preventDefault();
					start();
				}
			}}
			onKeyUp={cancel}
			onClick={e => e.stopPropagation()}
			onContextMenu={e => e.preventDefault()}
		>
			<span
				aria-hidden='true'
				{...stylex.props(styles.progress)}
				style={{ transform: holding ? 'scaleX(1)' : 'scaleX(0)', transition: holding ? `transform ${duration}ms linear` : 'transform 150ms ease-out' }}
			/>
			<span {...stylex.props(styles.content)}>
				{Icon ? <Icon size={20} aria-hidden='true' /> : null}
				{props.label}
			</span>
		</button>
	);
};
