import * as stylex from '@stylexjs/stylex';
import type { LucideIcon } from 'lucide-react';
import { palette } from '../../tokens.stylex';

interface Props {
	// quiet has no border or face until it's pressed, for less important actions
	type?: 'primary' | 'danger' | 'quiet' | 'default';
	label: string;
	icon?: LucideIcon;
	// Shows only the icon; the label is still read out by VoiceOver
	iconOnly?: boolean;
	// Lines the icon and label up on the left, eg for items in a menu
	alignStart?: boolean;
	disabled?: boolean;
	block?: boolean;
	onClick: () => void;
}

// Hover styles only apply on devices that can hover, so they don't stick after a tap on an iPad
const styles = stylex.create({
	button: {
		appearance: 'none',
		margin: '0',
		minHeight: '50px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: '10px',
		borderColor: {
			'default': palette.controlBorder,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlBorderHighlight }
		},
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight },
			':active': palette.controlFaceHighlight
		},
		color: palette.text,
		padding: '2px 14px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
		fontFamily: 'inherit',
		fontSize: '16px',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		outlineOffset: '2px',
		transform: {
			'default': null,
			':active': 'scale(0.97)'
		},
		transition: {
			'default': 'transform 120ms ease, background-color 120ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	primary: {
		borderColor: palette.controlFacePrimary,
		backgroundColor: {
			'default': palette.controlFacePrimary,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFacePrimary },
			':active': palette.controlFacePrimary
		},
		color: palette.textLight,
		fontWeight: '600'
	},
	danger: {
		borderColor: palette.roleDemon,
		backgroundColor: {
			'default': `color-mix(in srgb, ${palette.roleDemon} 8%, ${palette.controlFace})`,
			':hover': { 'default': null, '@media (hover: hover)': `color-mix(in srgb, ${palette.roleDemon} 16%, ${palette.controlFace})` },
			':active': `color-mix(in srgb, ${palette.roleDemon} 16%, ${palette.controlFace})`
		},
		color: palette.roleDemon,
		fontWeight: '600'
	},
	quiet: {
		borderColor: {
			'default': 'transparent',
			':hover': { 'default': null, '@media (hover: hover)': 'transparent' }
		},
		backgroundColor: {
			'default': 'transparent',
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight },
			':active': palette.controlFaceHighlight
		},
		color: palette.textHighlight
	},
	default: {
		//
	},
	iconOnly: {
		minWidth: '50px',
		padding: '2px'
	},
	icon: {
		flexShrink: 0
	},
	block: {
		width: '100%'
	},
	alignStart: {
		justifyContent: 'flex-start'
	},
	disabled: {
		cursor: 'default',
		opacity: '0.5',
		borderColor: palette.controlBorder,
		backgroundColor: palette.controlFace,
		color: palette.text,
		fontWeight: 'normal',
		transform: 'none'
	}
});

export const Button = (props: Props) => {
	const Icon = props.icon;
	return (
		<button
			type='button'
			disabled={props.disabled}
			{...stylex.props(styles.button, styles[ props.type || 'default' ], props.iconOnly && styles.iconOnly, props.block && styles.block, props.alignStart && styles.alignStart, props.disabled && styles.disabled)}
			aria-label={props.iconOnly ? props.label : undefined}
			title={props.iconOnly ? props.label : undefined}
			onClick={props.onClick}
		>
			{Icon ? <Icon size={20} strokeWidth={2} aria-hidden='true' {...stylex.props(styles.icon)} /> : null}
			{props.iconOnly ? null : props.label}
		</button>
	);
};
