import { DescriptionLogic } from '../../../../logic/description-logic';
import type { EffectHasVoteModified } from '../../../../models/effect';

interface Props {
	effect: EffectHasVoteModified;
}

export const HasVoteModifiedEffect = (props: Props) => {
	return <>{DescriptionLogic.describeEffect(props.effect)}</>;
};
