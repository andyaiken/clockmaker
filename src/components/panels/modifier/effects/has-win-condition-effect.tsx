import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectHasWinCondition } from '../../../../models/effect';

interface Props {
	effect: EffectHasWinCondition;
}

export const HasWinConditionEffect = (props: Props) => {
	return <>{DescriptionLogic.describeEffect(props.effect)}</>;
};
