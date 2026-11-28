import * as stylex from '@stylexjs/stylex';
import type { Character } from '../../models/character';
import { CompactPanel } from '../controls/compact-panel';
import { ModifierPanel } from './modifier/modifier-panel';
import { RoleType } from '../../enums/role-type';
import { ShowPlayerPanel } from './reveal/show-player-panel';
import { Spacer } from '../controls/spacer';
import { Text } from '../controls/text';
import { palette } from '../../tokens.stylex';

interface Props {
	character: Character | null;
	// A coloured square with just the name, role and ability
	compact?: boolean;
	// The width and height of the compact square, in pixels; everything inside scales with it
	size?: number;
}

const styles = stylex.create({
	characterPanel: {
		width: '250px',
		height: '350px',
		display: 'flex',
		flexDirection: 'column',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '15px',
		backgroundColor: palette.controlFace,
		color: palette.text,
		boxShadow: '3px 3px 5px 0 rgba(0, 0, 0, 0.2)'
	},
	squareName: {
		fontSize: '1.2em',
		fontWeight: '600',
		lineHeight: '1.2',
		textAlign: 'center'
	},
	squareRole: {
		fontSize: '0.7em',
		opacity: 0.85,
		textAlign: 'center'
	},
	squareAbility: {
		flex: '0 1 auto',
		minHeight: 0,
		overflow: 'hidden',
		fontSize: '0.8em',
		lineHeight: '1.2'
	},
	cardHeader: {
		flex: '0 0 40px',
		borderBottomWidth: '1px',
		borderBottomStyle: 'solid',
		borderBottomColor: palette.controlBorder,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '0 10px',
		borderRadius: '10px 10px 0 0',
		fontSize: '20px',
		fontWeight: '600'
	},
	cardContent: {
		flex: '1 1 0',
		padding: '10px',
		overflowY: 'auto'
	},
	cardFooter: {
		flex: '0 0 25px',
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: palette.controlBorder,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '0 0 10px 10px',
		fontSize: '14px'
	},
	roleTownsfolk: {
		backgroundColor: palette.roleTownsfolk,
		color: palette.onRoleTownsfolk
	},
	roleOutsider: {
		backgroundColor: palette.roleOutsider,
		color: palette.onRoleOutsider
	},
	roleMinion: {
		backgroundColor: palette.roleMinion,
		color: palette.onRoleMinion
	},
	roleDemon: {
		backgroundColor: palette.roleDemon,
		color: palette.onRoleDemon
	},
	roleTraveller: {
		backgroundColor: palette.roleTraveller,
		color: palette.onRoleTraveller
	},
	roleFabled: {
		backgroundColor: palette.roleFabled,
		color: palette.onRoleFabled
	},
	roleLoric: {
		backgroundColor: palette.roleLoric,
		color: palette.onRoleLoric
	},
	roleNone: {
		backgroundColor: palette.controlFace,
		color: palette.text
	}
});

export const CharacterPanel = (props: Props) => {
	const getRole = () => {
		if (!props.character) {
			return 'roleNone';
		}

		switch (props.character.role) {
			case RoleType.Townsfolk:
				return 'roleTownsfolk';
			case RoleType.Outsider:
				return 'roleOutsider';
			case RoleType.Minion:
				return 'roleMinion';
			case RoleType.Demon:
				return 'roleDemon';
			case RoleType.Traveller:
				return 'roleTraveller';
			case RoleType.Fabled:
				return 'roleFabled';
			case RoleType.Loric:
				return 'roleLoric';
		}
	};

	if (props.compact) {
		return (
			<CompactPanel size={props.size} role={props.character?.role} containsCharacter={props.character !== null}>
				{
					props.character ?
						<Spacer>
							<div {...stylex.props(styles.squareName)}>{props.character.name}</div>
							<div {...stylex.props(styles.squareAbility)}>{props.character.ability}</div>
							<div {...stylex.props(styles.squareRole)}>{props.character.role}</div>
						</Spacer>
						: null
				}
			</CompactPanel>
		);
	}

	return (
		<div {...stylex.props(styles.characterPanel)}>
			{
				props.character ?
					<>
						<div {...stylex.props(styles.cardHeader, styles[ getRole() ])}>
							{props.character ? props.character.name : '-'}
						</div>
						<div {...stylex.props(styles.cardContent)}>
							<Spacer>
								<Text>{props.character.quote}</Text>
								<Text>{props.character.ability}</Text>
								{
									props.character.wakesFirstNight.length > 0 ?
										<>
											<Text type='h3'>First Night</Text>
											{props.character.wakesFirstNight.map(w => <ShowPlayerPanel key={w.id} showPlayer={w} />)}
										</>
										: null
								}
								{
									props.character.wakesOtherNights.length > 0 ?
										<>
											<Text type='h3'>Other Nights</Text>
											{props.character.wakesOtherNights.map(w => <ShowPlayerPanel key={w.id} showPlayer={w} />)}
										</>
										: null
								}
								{
									props.character.modifiers.length > 0 ?
										<>
											<Text type='h3'>Modifiers</Text>
											{props.character.modifiers.map(m => <ModifierPanel key={m.id} modifier={m} />)}
										</>
										: null
								}
							</Spacer>
						</div>
						<div {...stylex.props(styles.cardFooter, styles[ getRole() ])}>
							{props.character ? props.character.role : '-'}
						</div>
					</>
					: null
			}
		</div>
	);
};
