import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectIsProtected } from '../../../../models/effect';

interface Props {
	effect: EffectIsProtected;
}

export const IsProtectedEffect = (props: Props) => {
	return <>{DescriptionLogic.describeEffect(props.effect)}</>;
};
