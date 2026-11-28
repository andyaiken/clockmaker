import * as stylex from '@stylexjs/stylex';
import { Check, type LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ColourLogic } from '../../../logic/colour-logic';
import type { RoleType } from '../../../enums/role-type';
import { palette } from '../../../tokens.stylex';

export interface RailItem {
	id: string;
	// The waking character's monogram, or an icon for steps that aren't a character (dusk, dawn, minion info)
	monogram: string | null;
	icon: LucideIcon | null;
	role: RoleType | null;
	title: string;
	// Who is woken
	detail: string;
	complete: boolean;
}

interface Props {
	items: RailItem[];
	// What the steps are, for screen readers; defaults to the night order
	label?: string;
	// Shares the width out between the steps, for a short rail with longer titles
	fill?: boolean;
	selectedID: string | null;
	onSelect: (id: string) => void;
}

const styles = stylex.create({
	rail: {
		position: 'relative',
		display: 'flex',
		gap: '4px',
		overflowX: 'auto',
		padding: '4px 2px 8px 2px',
		scrollbarWidth: 'thin'
	},
	item: {
		position: 'relative',
		flex: '0 0 64px',
		appearance: 'none',
		margin: 0,
		padding: '4px 2px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '4px',
		borderWidth: 0,
		borderRadius: '10px',
		backgroundColor: {
			'default': 'transparent',
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		color: palette.text,
		fontFamily: 'inherit',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		}
	},
	itemFill: {
		flex: '1 1 0',
		minWidth: '64px'
	},
	selected: {
		backgroundColor: {
			'default': palette.controlFaceHighlight,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		}
	},
	// The progress line runs behind the chips; done steps colour it in
	line: {
		position: 'absolute',
		top: '25px',
		left: 0,
		right: 0,
		height: '3px',
		backgroundColor: palette.controlBorder,
		zIndex: 0
	},
	lineDone: {
		backgroundColor: palette.ok
	},
	chip: {
		position: 'relative',
		zIndex: 1,
		width: '42px',
		height: '42px',
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		fontSize: '15px',
		fontWeight: '700',
		color: palette.text
	},
	chipSelected: {
		outlineWidth: '3px',
		outlineStyle: 'solid',
		outlineColor: palette.controlFacePrimary,
		outlineOffset: '2px'
	},
	tick: {
		position: 'absolute',
		right: '-4px',
		bottom: '-4px',
		width: '18px',
		height: '18px',
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		backgroundColor: palette.ok,
		color: palette.onOk,
		boxShadow: `0 0 0 2px ${palette.background}`
	},
	title: {
		maxWidth: '100%',
		fontSize: '12px',
		fontWeight: '600',
		lineHeight: 1.15,
		textAlign: 'center',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	},
	// With the width shared out, a longer title can take two lines rather than being cut off
	titleWrap: {
		whiteSpace: 'normal',
		overflowWrap: 'break-word'
	},
	detail: {
		maxWidth: '100%',
		fontSize: '11px',
		color: palette.textDimmed,
		lineHeight: 1.15,
		textAlign: 'center',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap'
	}
});

// A row of steps as chips, with a tick on each step that's done: the night order, or setup
export const NightRail = (props: Props) => {
	const selectedRef = useRef<HTMLButtonElement>(null);

	// Keep the current step in view as the night moves on
	useEffect(() => {
		selectedRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
	}, [ props.selectedID ]);

	return (
		<div role='tablist' aria-label={props.label ?? 'Night order'} {...stylex.props(styles.rail)}>
			{props.items.map((item, index) => {
				const selected = item.id === props.selectedID;
				const Icon = item.icon;
				const colour = ColourLogic.roleColour(item.role);
				const next = props.items[ index + 1 ];
				return (
					<button
						key={item.id}
						ref={selected ? selectedRef : undefined}
						type='button'
						role='tab'
						aria-selected={selected}
						aria-label={`${item.title}${item.detail ? `: ${item.detail}` : ''}${item.complete ? ', done' : ''}`}
						{...stylex.props(styles.item, props.fill && styles.itemFill, selected && styles.selected)}
						onClick={() => props.onSelect(item.id)}
					>
						{next ? <span aria-hidden='true' {...stylex.props(styles.line, item.complete && styles.lineDone)} style={{ left: '50%', right: '-50%' }} /> : null}
						<span
							aria-hidden='true'
							{...stylex.props(styles.chip, selected && styles.chipSelected)}
							style={{ backgroundColor: ColourLogic.tint(colour, item.role ? 22 : 0), boxShadow: `inset 0 0 0 2.5px ${colour}` }}
						>
							{Icon ? <Icon size={20} /> : item.monogram}
							{item.complete ? <span {...stylex.props(styles.tick)}><Check size={12} strokeWidth={3} /></span> : null}
						</span>
						<span aria-hidden='true' {...stylex.props(styles.title, props.fill && styles.titleWrap)}>{item.title}</span>
						<span aria-hidden='true' {...stylex.props(styles.detail)}>{item.detail || ' '}</span>
					</button>
				);
			})}
		</div>
	);
};
