import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Spacer } from './spacer';
import { Text } from './text';
import { palette } from '../../tokens.stylex';

interface Props {
	label: string;
	secondary?: string;
	startOpen?: boolean;
	children: ReactNode;
}

const styles = stylex.create({
	header: {
		width: '100%',
		minHeight: '50px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight },
			':active': palette.controlFaceHighlight
		},
		appearance: 'none',
		margin: 0,
		borderRadius: '10px',
		fontFamily: 'inherit',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		},
		outlineOffset: '2px',
		color: palette.text,
		padding: '2px 10px',
		fontSize: '16px',
		textAlign: 'left',
		cursor: 'pointer',
		transition: {
			'default': 'border-radius 200ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	// When open, the header's bottom corners square off to join the content below
	headerOpen: {
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0
	},
	// Hovering the header highlights the whole outline, header and content together
	borderHighlight: {
		borderColor: palette.controlBorderHighlight
	},
	indicator: {
		width: '8px',
		height: '8px',
		flexShrink: 0,
		borderWidth: '0',
		borderRightWidth: '2px',
		borderBottomWidth: '2px',
		borderStyle: 'solid',
		borderColor: palette.text,
		transform: 'rotate(45deg)',
		transition: {
			'default': 'transform 200ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	indicatorOpen: {
		transform: 'rotate(225deg)'
	},
	content: {
		display: 'grid',
		gridTemplateRows: '0fr',
		transition: {
			'default': 'grid-template-rows 200ms ease',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	contentOpen: {
		gridTemplateRows: '1fr'
	},
	contentInner: {
		minHeight: 0,
		overflow: 'hidden'
	},
	contentBody: {
		borderWidth: '1px',
		borderStyle: 'solid',
		// The header's bottom border separates the two
		borderTopWidth: 0,
		borderColor: palette.controlBorder,
		borderBottomLeftRadius: '10px',
		borderBottomRightRadius: '10px',
		backgroundColor: palette.controlFace,
		padding: '10px'
	}
});

export const Expander = (props: Props) => {
	const [ open, setOpen ] = useState(props.startOpen ?? false);
	// Only a mouse hovers; a touch shouldn't leave the outline highlighted
	const [ hovered, setHovered ] = useState(false);
	const contentID = useId();

	return (
		<div>
			<button
				type='button'
				aria-expanded={open}
				aria-controls={contentID}
				{...stylex.props(styles.header, open && styles.headerOpen, hovered && styles.borderHighlight)}
				onClick={() => setOpen(previous => !previous)}
				onPointerEnter={e => setHovered(e.pointerType === 'mouse')}
				onPointerLeave={() => setHovered(false)}
			>
				<Spacer orientation='horizontal'>
					<Text>{props.label}</Text>
					{
						props.secondary ?
							<Text type='dimmed'>{props.secondary}</Text>
							: null
					}
				</Spacer>
				<span aria-hidden='true' {...stylex.props(styles.indicator, open && styles.indicatorOpen)} />
			</button>
			<div id={contentID} inert={!open} {...stylex.props(styles.content, open && styles.contentOpen)}>
				<div {...stylex.props(styles.contentInner)}>
					<div {...stylex.props(styles.contentBody, hovered && styles.borderHighlight)}>
						{props.children}
					</div>
				</div>
			</div>
		</div>
	);
};
