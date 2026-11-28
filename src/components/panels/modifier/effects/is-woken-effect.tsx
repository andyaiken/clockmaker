import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectIsWoken } from '../../../../models/effect';
import { ShowPlayerPanel } from '../../reveal/show-player-panel';
import { Spacer } from '../../../controls/spacer';

interface Props {
	effect: EffectIsWoken;
}

// When the player is woken, and what they're shown or asked, in order
export const IsWokenEffect = (props: Props) => {
	const show = props.effect.data.show;
	return (
		<Spacer>
			<span>{DescriptionLogic.describeEffect(props.effect)}{show.length > 0 ? ':' : ''}</span>
			{show.map(s => <ShowPlayerPanel key={s.id} showPlayer={s} />)}
		</Spacer>
	);
};
