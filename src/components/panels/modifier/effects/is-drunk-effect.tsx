import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectIsDrunk } from '../../../../models/effect';

interface Props {
	effect: EffectIsDrunk;
}

export const IsDrunkEffect = (props: Props) => {
	return <>{DescriptionLogic.describeEffect(props.effect)}</>;
};
