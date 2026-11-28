import * as stylex from '@stylexjs/stylex';
import { AlignmentType } from '../../enums/alignment-type';
import type { ReactNode } from 'react';
import { RoleType } from '../../enums/role-type';
import { palette } from '../../tokens.stylex';

interface Props {
	children?: ReactNode;
	size?: number;
	role?: RoleType;
	alignment?: AlignmentType;
	containsCharacter?: boolean;
}

const styles = stylex.create({
	square: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '0.3em',
		padding: '0.6em',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '0.8em',
		backgroundColor: palette.controlFace,
		color: palette.text,
		overflow: 'hidden',
		overflowWrap: 'anywhere',
		boxShadow: '2px 2px 4px 0 rgba(0, 0, 0, 0.2)'
	},
	topAligned: {
		justifyContent: 'flex-start'
	},
	darkText: {
		color: palette.text
	},
	alignmentGood: {
		color: palette.roleTownsfolk
	},
	alignmentEvil: {
		backgroundColor: palette.roleDemon,
		color: palette.onRoleDemon
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
	}
});

const roleStyle = (role: RoleType | undefined) => {
	switch (role) {
		case RoleType.Townsfolk:
			return styles.roleTownsfolk;
		case RoleType.Outsider:
			return styles.roleOutsider;
		case RoleType.Minion:
			return styles.roleMinion;
		case RoleType.Demon:
			return styles.roleDemon;
		case RoleType.Traveller:
			return styles.roleTraveller;
		case RoleType.Fabled:
			return styles.roleFabled;
		case RoleType.Loric:
			return styles.roleLoric;
	}
};

export const CompactPanel = (props: Props) => {
	const size = props.size ?? 120;
	return (
		<div
			{...stylex.props(
				styles.square,
				roleStyle(props.role),
				!props.role && !props.alignment && styles.darkText,
				props.alignment === AlignmentType.Good && styles.alignmentGood,
				props.alignment === AlignmentType.Evil && styles.alignmentEvil,
				props.containsCharacter && styles.topAligned
			)}
			style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size / (props.containsCharacter ? 11 : 5)}px` }}
		>
			{props.children}
		</div>
	);
};
