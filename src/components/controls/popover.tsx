import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { palette } from '../../tokens.stylex';

interface Props {
	open: boolean;
	// The control the popover points at
	anchor: ReactNode;
	// Read out by VoiceOver when the popover opens
	label: string;
	children: ReactNode;
	onClose: () => void;
}

const gap = 8;
const margin = 12;

const styles = stylex.create({
	anchor: {
		display: 'block'
	},
	popover: {
		position: 'fixed',
		zIndex: 100,
		width: 'max-content',
		maxWidth: '340px',
		padding: '14px',
		borderRadius: '14px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		backgroundColor: palette.controlFace,
		color: palette.text,
		boxShadow: '0 10px 30px rgb(0 0 0 / 0.22)',
		outline: 'none',
		animationName: {
			'default': stylex.keyframes({
				from: { opacity: 0, transform: 'scale(0.96)' },
				to: { opacity: 1, transform: 'scale(1)' }
			}),
			'@media (prefers-reduced-motion: reduce)': 'none'
		},
		animationDuration: '200ms',
		animationTimingFunction: 'ease-out'
	}
});

// A small panel that floats next to the control that opened it; tapping elsewhere or pressing Escape closes it
export const Popover = (props: Props) => {
	const anchorRef = useRef<HTMLDivElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const [ position, setPosition ] = useState<{ top: number, left: number } | null>(null);
	const { open, onClose } = props;

	// Below the anchor if it fits, otherwise above; kept inside the window
	useLayoutEffect(() => {
		if (!open || !anchorRef.current || !popoverRef.current) {
			setPosition(null);
			return;
		}

		const place = () => {
			if (!anchorRef.current || !popoverRef.current) {
				return;
			}
			const a = anchorRef.current.getBoundingClientRect();
			const p = popoverRef.current.getBoundingClientRect();
			const below = a.bottom + gap;
			const top = (below + p.height + margin <= window.innerHeight) ? below : Math.max(margin, a.top - gap - p.height);
			const left = Math.min(Math.max(margin, a.left), window.innerWidth - p.width - margin);
			setPosition(current => ((current?.top === top) && (current.left === left)) ? current : { top, left });
		};
		place();
		popoverRef.current.focus();

		// Its content can change while it's open, eg a confirmation asked in place, so it's kept inside the window
		const observer = new ResizeObserver(place);
		observer.observe(popoverRef.current);
		return () => observer.disconnect();
	}, [ open ]);

	useEffect(() => {
		if (!open) {
			return;
		}

		// A popover opened from inside this one (eg a confirmation in a menu) handles Escape and outside taps first
		const hasChild = () => !!popoverRef.current?.querySelector('[role=dialog]');
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as Node;
			if (!popoverRef.current?.contains(target) && !anchorRef.current?.contains(target)) {
				onClose();
			}
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.key === 'Escape') && !hasChild()) {
				onClose();
			}
		};

		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [ open, onClose ]);

	return (
		<>
			<div ref={anchorRef} {...stylex.props(styles.anchor)}>{props.anchor}</div>
			{
				open ?
					<div
						ref={popoverRef}
						role='dialog'
						aria-label={props.label}
						tabIndex={-1}
						{...stylex.props(styles.popover)}
						// Measured first while hidden, then shown in place
						style={{ top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? 'visible' : 'hidden' }}
						onClick={e => e.stopPropagation()}
					>
						{props.children}
					</div>
					: null
			}
		</>
	);
};
