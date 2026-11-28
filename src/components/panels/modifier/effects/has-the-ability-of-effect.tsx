import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectHasTheAbilityOf } from '../../../../models/effect';

interface Props {
	effect: EffectHasTheAbilityOf;
}

export const HasTheAbilityOfEffect = (props: Props) => {
	return <>{DescriptionLogic.describeEffect(props.effect)}</>;
};
