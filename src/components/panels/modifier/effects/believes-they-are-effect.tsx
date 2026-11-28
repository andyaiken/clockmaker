import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectBelievesTheyAre } from '../../../../models/effect';

interface Props {
	effect: EffectBelievesTheyAre;
}

export const BelievesTheyAreEffect = (props: Props) => {
	return <>{DescriptionLogic.describeEffect(props.effect)}</>;
};
