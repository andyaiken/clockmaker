import * as stylex from '@stylexjs/stylex';
import type { Game } from '../../../models/game';
import { PhaseLogic } from '../../../logic/phase-logic';
import { Text } from '../../controls/text';
import { Utility } from '../../../utils/utility';
import { palette } from '../../../tokens.stylex';

interface Props {
	game: Game;
}

const styles = stylex.create({
	logTab: {
		display: 'flex',
		flexDirection: 'column',
		gap: '15px'
	},
	group: {
		display: 'flex',
		flexDirection: 'column',
		gap: '5px'
	},
	entry: {
		display: 'flex',
		alignItems: 'baseline',
		gap: '10px'
	},
	time: {
		flex: '0 0 auto',
		fontSize: '12px',
		color: palette.textDimmed,
		fontVariantNumeric: 'tabular-nums'
	}
});

export const LogTab = (props: Props) => {
	const groups = PhaseLogic.getLogGroups(props.game);

	return (
		<div {...stylex.props(styles.logTab)}>
			{groups.length === 0 ? <Text type='dimmed'>Nothing has happened yet.</Text> : null}
			{
				groups.map((group, index) => (
					<div key={`${group.label}-${index}`} {...stylex.props(styles.group)}>
						<Text type='h2'>{group.label}</Text>
						{
							group.entries.map(entry => (
								<div key={entry.id} {...stylex.props(styles.entry)}>
									<span {...stylex.props(styles.time)}>{Utility.formatTime(entry.timestamp)}</span>
									<Text>{entry.text}</Text>
								</div>
							))
						}
					</div>
				))
			}
		</div>
	);
};
