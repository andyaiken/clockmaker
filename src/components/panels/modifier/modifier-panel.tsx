import * as stylex from '@stylexjs/stylex';
import { BagModifierDetails } from './bag-modifier-details';
import { DescriptionLogic } from '../../../logic/description-logic';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import type { Modifier } from '../../../models/modifier';
import { ModifierType } from '../../../enums/modifier-type';
import { PlayerModifierDetails } from './player-modifier-details';
import { SeatingModifierDetails } from './seating-modifier-details';
import { Tag } from '../../controls/tag';
import { Text } from '../../controls/text';

interface Props {
	modifier: Modifier;
	// How much to show:
	// 'full': everything about the modifier (the default)
	// 'summary': its name, text, and (with a game) who it's on
	// 'compact': its name on one line, with the text as a tooltip
	display?: 'full' | 'summary' | 'compact';
	// The character or player it belongs to, shown before its name
	owner?: string;
	// Lets a player modifier show who it's placed on
	game?: Game;
}

const styles = stylex.create({
	modifierPanel: {
		display: 'flex',
		flexDirection: 'column',
		gap: '4px'
	},
	header: {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: '5px'
	},
	name: {
		fontWeight: '600'
	}
});

export const ModifierPanel = (props: Props) => {
	const modifier = props.modifier;
	const display = props.display ?? 'full';
	const name = DescriptionLogic.getModifierName(modifier, props.owner);

	if (display === 'compact') {
		return <span title={modifier.data.text}>{name}</span>;
	}

	const setupTag = DescriptionLogic.getSetupLabel(modifier);
	// The text is only repeated under the name when the name is the label
	const showText = (modifier.label !== '') && (modifier.data.text !== '');
	const placedOn = (props.game && (modifier.type === ModifierType.PlayerModifier))
		? GameLogic.getPlacedPlayers(props.game, modifier).map(p => p.name)
		: null;

	const getDetails = () => {
		switch (modifier.type) {
			case ModifierType.BagModifier:
				return <BagModifierDetails modifier={modifier} />;
			case ModifierType.SeatingModifier:
				return <SeatingModifierDetails modifier={modifier} />;
			case ModifierType.PlayerModifier:
				return <PlayerModifierDetails modifier={modifier} />;
		}
	};

	return (
		<div {...stylex.props(styles.modifierPanel)}>
			<div {...stylex.props(styles.header)}>
				{name ? <span {...stylex.props(styles.name)}>{name}</span> : null}
				<Tag>{modifier.type}</Tag>
				{setupTag ? <Tag>{setupTag}</Tag> : null}
			</div>
			{showText ? <Text>{modifier.data.text}</Text> : null}
			{placedOn ? <Text type='dimmed'>On: {placedOn.length > 0 ? placedOn.join(', ') : 'nobody yet'}</Text> : null}
			{display === 'full' ? getDetails() : null}
		</div>
	);
};
