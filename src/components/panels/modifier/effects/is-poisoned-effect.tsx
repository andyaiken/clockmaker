import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectIsPoisoned } from '../../../../models/effect';

interface Props {
	effect: EffectIsPoisoned;
}

export const IsPoisonedEffect = (props: Props) => {
	return <>{DescriptionLogic.describeEffect(props.effect)}</>;
};
