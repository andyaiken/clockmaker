import { DescriptionLogic } from '../../../logic/description-logic';
import { DetailList } from './detail-list';
import { EffectPanel } from './effect-panel';
import type { PlayerModifier } from '../../../models/modifier';

interface Props {
	modifier: PlayerModifier;
}

// Who a player modifier can go on, when, for how long, and what it does
export const PlayerModifierDetails = (props: Props) => {
	return (
		<DetailList
			items={[
				...DescriptionLogic.describePlayerModifier(props.modifier),
				...props.modifier.data.effects.map(e => <EffectPanel key={e.id} effect={e} />)
			]}
		/>
	);
};
