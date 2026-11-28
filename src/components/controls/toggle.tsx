import * as stylex from '@stylexjs/stylex';
import { palette } from '../../tokens.stylex';

interface Props {
	label: string;
	// A line of smaller text under the label
	description?: string;
	checked: boolean;
	disabled?: boolean;
	block?: boolean;
	onChange: (checked: boolean) => void;
}

const styles = stylex.create({
	toggle: {
		appearance: 'none',
		margin: 0,
		minHeight: '50px',
		width: 'fit-content',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '14px',
		padding: '6px 8px 6px 14px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '10px',
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		color: palette.text,
		fontFamily: 'inherit',
		fontSize: '16px',
		textAlign: 'left',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		outlineOffset: '2px'
	},
	block: {
		width: '100%'
	},
	text: {
		display: 'flex',
		flexDirection: 'column',
		gap: '2px'
	},
	description: {
		color: palette.textDimmed,
		fontSize: '13px'
	},
	// The same size as an iOS switch
	track: {
		flexShrink: 0,
		width: '51px',
		height: '31px',
		display: 'flex',
		alignItems: 'center',
		padding: '2px',
		borderRadius: '16px',
		backgroundColor: palette.controlBorder,
		transition: {
			'default': 'background-color 200ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	trackChecked: {
		backgroundColor: palette.ok
	},
	thumb: {
		width: '27px',
		height: '27px',
		borderRadius: '50%',
		backgroundColor: '#ffffff',
		boxShadow: '0 2px 4px rgb(0 0 0 / 0.25)',
		transform: 'translateX(0)',
		transition: {
			'default': 'transform 200ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	thumbChecked: {
		transform: 'translateX(20px)'
	},
	disabled: {
		opacity: '0.5',
		cursor: 'default'
	}
});

// A row with a label and an on / off switch
export const Toggle = (props: Props) => {
	return (
		<button
			type='button'
			role='switch'
			aria-checked={props.checked}
			disabled={props.disabled}
			{...stylex.props(styles.toggle, props.block && styles.block, props.disabled && styles.disabled)}
			onClick={() => props.onChange(!props.checked)}
		>
			<span {...stylex.props(styles.text)}>
				{props.label}
				{props.description ? <span {...stylex.props(styles.description)}>{props.description}</span> : null}
			</span>
			<span aria-hidden='true' {...stylex.props(styles.track, props.checked && styles.trackChecked)}>
				<span {...stylex.props(styles.thumb, props.checked && styles.thumbChecked)} />
			</span>
		</button>
	);
};
