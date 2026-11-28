import * as stylex from '@stylexjs/stylex';

// Every colour has a light and a dark value, and by default follows the iPad's appearance.
// src/themes.ts repeats the same values to force light or dark, so change both together.
export const palette = stylex.defineVars({
	// Page background
	background: { 'default': '#f2f2f6', '@media (prefers-color-scheme: dark)': '#0b0b0d' },
	// Header bars and other recessed areas
	backgroundDark: { 'default': '#e8e8ee', '@media (prefers-color-scheme: dark)': '#161618' },
	// Controls, cards and panels
	controlFace: { 'default': '#ffffff', '@media (prefers-color-scheme: dark)': '#1f1f22' },
	// A selected or hovered control
	controlFaceHighlight: { 'default': '#e9eafb', '@media (prefers-color-scheme: dark)': '#2b2d4a' },
	controlFaceSelected: { 'default': '#ffffff', '@media (prefers-color-scheme: dark)': '#1f1f22' },
	// Primary buttons
	controlFacePrimary: { 'default': '#4b55d6', '@media (prefers-color-scheme: dark)': '#8c95ff' },
	controlBorder: { 'default': '#c9c9d1', '@media (prefers-color-scheme: dark)': '#3d3d43' },
	// Hover, focus
	controlBorderHighlight: { 'default': '#4b55d6', '@media (prefers-color-scheme: dark)': '#8c95ff' },
	controlBorderSelected: { 'default': '#4b55d6', '@media (prefers-color-scheme: dark)': '#8c95ff' },
	text: { 'default': '#1c1c1f', '@media (prefers-color-scheme: dark)': '#f2f2f5' },
	// Selected text, links
	textHighlight: { 'default': '#3f49c4', '@media (prefers-color-scheme: dark)': '#a3abff' },
	textSelected: { 'default': '#1c1c1f', '@media (prefers-color-scheme: dark)': '#ffffff' },
	textHeader: { 'default': '#1c1c1f', '@media (prefers-color-scheme: dark)': '#ffffff' },
	// Secondary text; still meets WCAG AA
	textDimmed: { 'default': '#6e6e76', '@media (prefers-color-scheme: dark)': '#8b8b94' },
	// Text on controlFacePrimary and textHighlight
	textLight: { 'default': '#ffffff', '@media (prefers-color-scheme: dark)': '#0b0b1a' },
	textError: { 'default': '#c42b35', '@media (prefers-color-scheme: dark)': '#ff6b6b' },
	// Role colours: Minion and Demon differ clearly in lightness
	roleTownsfolk: { 'default': '#2f6fe4', '@media (prefers-color-scheme: dark)': '#6ea1ff' },
	roleOutsider: { 'default': '#0e9aa7', '@media (prefers-color-scheme: dark)': '#3cc9d4' },
	roleMinion: { 'default': '#d97a00', '@media (prefers-color-scheme: dark)': '#ffb347' },
	roleDemon: { 'default': '#b81d36', '@media (prefers-color-scheme: dark)': '#f0475a' },
	roleTraveller: { 'default': '#8250df', '@media (prefers-color-scheme: dark)': '#b394ff' },
	roleFabled: { 'default': '#b88a00', '@media (prefers-color-scheme: dark)': '#f2c94c' },
	roleLoric: { 'default': '#1f9d63', '@media (prefers-color-scheme: dark)': '#4fd18b' },
	// Text on a role colour
	onRoleTownsfolk: { 'default': '#ffffff', '@media (prefers-color-scheme: dark)': '#0b0b0d' },
	onRoleOutsider: { 'default': '#1c1c1f', '@media (prefers-color-scheme: dark)': '#0b0b0d' },
	onRoleMinion: { 'default': '#1c1c1f', '@media (prefers-color-scheme: dark)': '#0b0b0d' },
	onRoleDemon: { 'default': '#ffffff', '@media (prefers-color-scheme: dark)': '#0b0b0d' },
	onRoleTraveller: { 'default': '#ffffff', '@media (prefers-color-scheme: dark)': '#0b0b0d' },
	onRoleFabled: { 'default': '#1c1c1f', '@media (prefers-color-scheme: dark)': '#0b0b0d' },
	onRoleLoric: { 'default': '#1c1c1f', '@media (prefers-color-scheme: dark)': '#0b0b0d' },
	// Drunk, poisoned and other things to watch
	warning: { 'default': '#a85400', '@media (prefers-color-scheme: dark)': '#ffb04a' },
	onWarning: { 'default': '#ffffff', '@media (prefers-color-scheme: dark)': '#1c1404' },
	ok: { 'default': '#1a7a43', '@media (prefers-color-scheme: dark)': '#4fd18b' },
	onOk: { 'default': '#ffffff', '@media (prefers-color-scheme: dark)': '#0b0b0d' }
});
