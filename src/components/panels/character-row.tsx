import * as stylex from '@stylexjs/stylex';
import { Check, Plus } from 'lucide-react';
import type { Character } from '../../models/character';
import { ColourLogic } from '../../logic/colour-logic';
import { palette } from '../../tokens.stylex';

interface Props {
	character: Character;
	monogram: string;
	// 'add' marks a row that adds the character when tapped; 'included' marks one that's in (tap to take it out)
	action?: 'add' | 'included' | null;
	onClick?: () => void;
}

const styles = stylex.create({
	row: {
		appearance: 'none',
		margin: 0,
		width: '100%',
		display: 'grid',
		gridTemplateColumns: '40px 1fr auto',
		alignItems: 'start',
		columnGap: '12px',
		padding: '8px 10px',
		borderWidth: 0,
		borderRadius: '10px',
		backgroundColor: 'transparent',
		color: palette.text,
		fontFamily: 'inherit',
		textAlign: 'left',
		breakInside: 'avoid'
	},
	clickable: {
		cursor: 'pointer',
		backgroundColor: {
			'default': 'transparent',
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight },
			':active': palette.controlFaceHighlight
		},
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		}
	},
	disc: {
		width: '40px',
		height: '40px',
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		fontSize: '15px',
		fontWeight: '700',
		letterSpacing: '-0.02em'
	},
	name: {
		fontSize: '16px',
		fontWeight: '600',
		lineHeight: 1.3
	},
	ability: {
		fontSize: '13px',
		lineHeight: 1.35,
		color: palette.textDimmed
	},
	mark: {
		alignSelf: 'center',
		width: '28px',
		height: '28px',
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		borderWidth: '1.5px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		color: palette.textDimmed
	},
	markIncluded: {
		borderColor: palette.ok,
		backgroundColor: palette.ok,
		color: palette.onOk
	}
});

// One character as a script sheet shows them: monogram, name and full ability
export const CharacterRow = (props: Props) => {
	const colour = ColourLogic.roleColour(props.character.role);
	const content = (
		<>
			<span aria-hidden='true' {...stylex.props(styles.disc)} style={{ backgroundColor: ColourLogic.tint(colour, 18), boxShadow: `inset 0 0 0 2.5px ${colour}` }}>{props.monogram}</span>
			<span>
				<span {...stylex.props(styles.name)}>{props.character.name}</span>
				<br />
				<span {...stylex.props(styles.ability)}>{props.character.ability}</span>
			</span>
			{
				props.action ?
					<span aria-hidden='true' {...stylex.props(styles.mark, props.action === 'included' && styles.markIncluded)}>
						{props.action === 'included' ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.5} />}
					</span>
					: <span />
			}
		</>
	);

	if (!props.onClick) {
		return <div {...stylex.props(styles.row)}>{content}</div>;
	}

	return (
		<button
			type='button'
			aria-label={`${props.action === 'add' ? 'Add' : 'Remove'} ${props.character.name}`}
			{...stylex.props(styles.row, styles.clickable)}
			onClick={props.onClick}
		>
			{content}
		</button>
	);
};
