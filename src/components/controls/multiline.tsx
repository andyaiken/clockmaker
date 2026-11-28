import * as stylex from '@stylexjs/stylex';
import { useLayoutEffect, useRef } from 'react';
import { palette } from '../../tokens.stylex';

interface Props {
	value: string;
	placeholder?: string;
	disabled?: boolean;
	minRows?: number;
	onChange: (value: string) => void;
}

const styles = stylex.create({
	multiline: {
		width: '100%',
		margin: '0',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: {
			'default': palette.controlBorder,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlBorderHighlight },
			':focus': palette.controlBorderHighlight
		},
		borderRadius: '5px',
		outline: 'none',
		backgroundColor: palette.controlFace,
		color: palette.text,
		padding: '8px 10px',
		fontFamily: 'inherit',
		fontSize: '16px',
		lineHeight: '1.4',
		resize: 'none',
		overflow: 'hidden',
		boxSizing: 'border-box',
		userSelect: 'text'
	},
	disabled: {
		pointerEvents: 'none',
		opacity: '0.5'
	}
});

export const Multiline = (props: Props) => {
	const ref = useRef<HTMLTextAreaElement>(null);

	// Grow to fit the content; `rows` sets the minimum height
	useLayoutEffect(() => {
		const textarea = ref.current;
		if (!textarea) {
			return;
		}

		const resize = () => {
			textarea.style.height = 'auto';
			// scrollHeight excludes borders, so add them back for border-box sizing
			const border = textarea.offsetHeight - textarea.clientHeight;
			textarea.style.height = `${textarea.scrollHeight + border}px`;
		};

		resize();

		// Re-measure when the width changes, since that changes line wrapping
		let width = textarea.clientWidth;
		const observer = new ResizeObserver(() => {
			if (textarea.clientWidth !== width) {
				width = textarea.clientWidth;
				resize();
			}
		});
		observer.observe(textarea);
		return () => observer.disconnect();
	}, [ props.value ]);

	return (
		<textarea
			ref={ref}
			{...stylex.props(styles.multiline, props.disabled ? styles.disabled : null)}
			value={props.value}
			placeholder={props.placeholder}
			disabled={props.disabled}
			rows={props.minRows ?? 10}
			onChange={event => props.onChange(event.target.value)}
		/>
	);
};
