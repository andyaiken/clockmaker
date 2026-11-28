import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectCanRegisterAs } from '../../../../models/effect';

interface Props {
	effect: EffectCanRegisterAs;
}

export const CanRegisterAsEffect = (props: Props) => {
	return <>{DescriptionLogic.describeEffect(props.effect)}</>;
};
