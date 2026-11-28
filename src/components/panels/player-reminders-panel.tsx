import * as stylex from '@stylexjs/stylex';
import { Plus, X } from 'lucide-react';
import { Button } from '../controls/button';
import { DescriptionLogic } from '../../logic/description-logic';
import { Expander } from '../controls/expander';
import type { Game } from '../../models/game';
import { GameLogic } from '../../logic/game-logic';
import { ModifierPanel } from './modifier/modifier-panel';
import type { Player } from '../../models/player';
import { Tag } from '../controls/tag';
import { Text } from '../controls/text';

interface Props {
	game: Game;
	player: Player;
	onChange: (game: Game) => void;
}

const styles = stylex.create({
	panel: {
		display: 'flex',
		flexDirection: 'column',
		gap: '5px'
	},
	tags: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '5px'
	},
	reminder: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px'
	},
	options: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '5px',
		paddingTop: '5px'
	}
});

export const PlayerRemindersPanel = (props: Props) => {
	const placed = GameLogic.getModifiersOnPlayer(props.game, props.player);
	const available = GameLogic.getAvailableModifiers(props.game, props.player);
	const states = GameLogic.getStateLabels(props.game, props.player);

	return (
		<div {...stylex.props(styles.panel)}>
			<Text type='h3'>Reminders</Text>
			{states.length > 0 ? <div {...stylex.props(styles.tags)}>{states.map(s => <Tag key={s}>{s}</Tag>)}</div> : null}
			{placed.length === 0 ? <Text type='dimmed'>None</Text> : null}
			{
				placed.map(({ player: owner, modifier }) => (
					<div key={`${owner.id}-${modifier.id}`} {...stylex.props(styles.reminder)}>
						<Text><ModifierPanel modifier={modifier} owner={owner.character?.name} display='compact' /></Text>
						<Button type='quiet' icon={X} iconOnly={true} label='Remove' onClick={() => props.onChange(GameLogic.removeModifier(props.game, owner.id, modifier.id, props.player.id))} />
					</div>
				))
			}
			{
				available.length > 0 ?
					<Expander label='Add a reminder'>
						<div {...stylex.props(styles.options)}>
							{
								available.map(({ player: owner, modifier }) => (
									<Button
										key={`${owner.id}-${modifier.id}`}
										icon={Plus}
										label={DescriptionLogic.getModifierName(modifier, owner.character?.name)}
										onClick={() => props.onChange(GameLogic.placeModifier(props.game, owner.id, modifier.id, props.player.id))}
									/>
								))
							}
						</div>
					</Expander>
					: null
			}
		</div>
	);
};
