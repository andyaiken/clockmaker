import * as stylex from '@stylexjs/stylex';
import { Plus, X } from 'lucide-react';
import type { Reveal, RevealItem } from '../../../models/reveal';
import { Button } from '../../controls/button';
import { Callout } from '../../controls/callout';
import { Divider } from '../../controls/divider';
import type { Game } from '../../../models/game';
import type { Player } from '../../../models/player';
import { RevealItemEditor } from './reveal-item-editor';
import { RevealLogic } from '../../../logic/reveal-logic';
import { ShowPlayerType } from '../../../enums/show-player-type';
import { Spacer } from '../../controls/spacer';
import { Text } from '../../controls/text';
import { WarningLogic } from '../../../logic/warning-logic';
import { palette } from '../../../tokens.stylex';
import { useState } from 'react';

interface Props {
	game: Game;
	player: Player;
	onShow: (reveal: Reveal) => void;
}

const styles = stylex.create({
	builder: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	},
	item: {
		display: 'flex',
		flexDirection: 'column',
		gap: '5px',
		padding: '10px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '12px',
		backgroundColor: palette.controlFace
	},
	add: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: '6px'
	},
	itemHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	actions: {
		display: 'flex',
		gap: '5px'
	}
});

export const RevealBuilder = (props: Props) => {
	const [ items, setItems ] = useState<RevealItem[]>([]);

	const addItem = (type: ShowPlayerType) => {
		const item = RevealLogic.createAdHocItem(type, props.game, props.player);
		if (item) {
			setItems(current => [ ...current, item ]);
		}
	};

	return (
		<div {...stylex.props(styles.builder)}>
			<Spacer>
				{WarningLogic.getWarnings(props.game, props.player).map(w => <Callout key={w} type='warning'><Text>{w}</Text></Callout>)}
				<Text>Add something to show {props.player.name}:</Text>
				<div {...stylex.props(styles.add)}>
					{RevealLogic.adHocTypes.map(t => <Button key={t} icon={Plus} label={RevealLogic.getTypeLabel(t)} onClick={() => addItem(t)} />)}
				</div>
				{
					items.map(item => (
						<div key={item.id} {...stylex.props(styles.item)}>
							<div {...stylex.props(styles.itemHeader)}>
								<Text type='h3'>{RevealLogic.getItemLabel(item)}</Text>
								<Button type='quiet' icon={X} iconOnly={true} label='Remove' onClick={() => setItems(current => current.filter(i => i.id !== item.id))} />
							</div>
							<RevealItemEditor
								game={props.game}
								item={item}
								onChange={updated => setItems(current => current.map(i => i.id === updated.id ? updated : i))}
							/>
						</div>
					))
				}
				{
					items.length > 0 ?
						<>
							<Divider />
							<div {...stylex.props(styles.actions)}>
								<Button type='primary' label='Show' onClick={() => props.onShow({ items: items, playerID: props.player.id })} />
								<Button type='quiet' label='Clear' onClick={() => setItems([])} />
							</div>
						</>
						: null
				}
			</Spacer>
		</div>
	);
};
