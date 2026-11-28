import * as stylex from '@stylexjs/stylex';
import { palette } from '../../tokens.stylex';

interface Props {
	value: string;
	placeholder?: string;
	maxLength?: number;
	disabled?: boolean;
	// Lets other controls find this one, eg to move focus to it
	id?: string;
	// The label on the on-screen keyboard's Return key, eg 'next'
	enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
	onChange: (value: string) => void;
	// Called when Return is pressed
	onEnter?: () => void;
}

const styles = stylex.create({
	textbox: {
		width: '100%',
		minHeight: '50px',
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
		padding: '2px 10px',
		fontSize: '16px',
		userSelect: 'text'
	},
	disabled: {
		pointerEvents: 'none',
		opacity: '0.5'
	}
});

export const TextBox = (props: Props) => {
	return (
		<input
			{...stylex.props(styles.textbox, props.disabled ? styles.disabled : null)}
			id={props.id}
			type='text'
			value={props.value}
			placeholder={props.placeholder}
			maxLength={props.maxLength}
			disabled={props.disabled}
			enterKeyHint={props.enterKeyHint}
			onChange={event => props.onChange(event.target.value)}
			onKeyDown={event => {
				// Ignore Return while an IME is composing text
				if ((event.key === 'Enter') && !event.nativeEvent.isComposing && props.onEnter) {
					event.preventDefault();
					props.onEnter();
				}
			}}
		/>
	);
};
