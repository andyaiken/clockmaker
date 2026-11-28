import * as stylex from '@stylexjs/stylex';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import { JinxList } from '../jinx-list';
import { RoleType } from '../../../enums/role-type';
import { ScriptLogic } from '../../../logic/script-logic';
import { ScriptSheet } from '../script-sheet';
import { Text } from '../../controls/text';

interface Props {
	game: Game;
}

const styles = stylex.create({
	scriptTab: {
		display: 'flex',
		flexDirection: 'column',
		gap: '18px'
	},
	section: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px'
	}
});

// The game's script as a script sheet, with any Fabled and Loric in play and the jinxes
export const ScriptTab = (props: Props) => {
	const scriptCharacters = ScriptLogic.getCharacters(props.game.script);
	// Monograms match the circle's: the script's characters first
	const scope = [ ...scriptCharacters, ...props.game.players.flatMap(p => p.character ? [ p.character ] : []), ...props.game.otherCharacters ];

	return (
		<div {...stylex.props(styles.scriptTab)}>
			<Text type='h1'>{props.game.script.name}</Text>
			<ScriptSheet
				characters={[ ...scriptCharacters, ...props.game.otherCharacters ]}
				roles={[ ...ScriptLogic.scriptRoles, RoleType.Fabled, RoleType.Loric ]}
				monogramScope={scope}
			/>
			<div {...stylex.props(styles.section)}>
				<Text type='h2'>Jinxes</Text>
				<JinxList characters={GameLogic.getAvailableCharacters(props.game)} emptyText='None on this script' />
			</div>
		</div>
	);
};
