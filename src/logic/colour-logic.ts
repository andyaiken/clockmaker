import type { BadgeTone } from './grimoire-view-logic';
import { RoleType } from '../enums/role-type';
import { palette } from '../tokens.stylex';

// Palette values are CSS var() references at runtime, so they can be used in inline styles
// for colours that depend on data, like a seat's role

export class ColourLogic {
	static roleColour = (role: RoleType | null): string => {
		switch (role) {
			case RoleType.Townsfolk:
				return palette.roleTownsfolk;
			case RoleType.Outsider:
				return palette.roleOutsider;
			case RoleType.Minion:
				return palette.roleMinion;
			case RoleType.Demon:
				return palette.roleDemon;
			case RoleType.Traveller:
				return palette.roleTraveller;
			case RoleType.Fabled:
				return palette.roleFabled;
			case RoleType.Loric:
				return palette.roleLoric;
		}
		return palette.controlBorder;
	};

	// Text that reads on a fill of roleColour
	static onRoleColour = (role: RoleType | null): string => {
		switch (role) {
			case RoleType.Townsfolk:
				return palette.onRoleTownsfolk;
			case RoleType.Outsider:
				return palette.onRoleOutsider;
			case RoleType.Minion:
				return palette.onRoleMinion;
			case RoleType.Demon:
				return palette.onRoleDemon;
			case RoleType.Traveller:
				return palette.onRoleTraveller;
			case RoleType.Fabled:
				return palette.onRoleFabled;
			case RoleType.Loric:
				return palette.onRoleLoric;
		}
		return palette.text;
	};

	static toneColour = (tone: BadgeTone): string => {
		switch (tone) {
			case 'good':
				return palette.roleTownsfolk;
			case 'evil':
				return palette.roleDemon;
			case 'warning':
				return palette.warning;
			case 'ok':
				return palette.ok;
			case 'dim':
				return palette.textDimmed;
		}
		return ColourLogic.roleColour(tone);
	};

	static onToneColour = (tone: BadgeTone): string => {
		switch (tone) {
			case 'good':
				return palette.onRoleTownsfolk;
			case 'evil':
				return palette.onRoleDemon;
			case 'warning':
				return palette.onWarning;
			case 'ok':
				return palette.onOk;
			case 'dim':
				return palette.background;
		}
		return ColourLogic.onRoleColour(tone);
	};

	// A light wash of a colour over a control's face
	static tint = (colour: string, percent = 16) => `color-mix(in srgb, ${colour} ${percent}%, ${palette.controlFace})`;
}
