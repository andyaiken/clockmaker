import type { BagModifier } from '../../../models/modifier';
import { DescriptionLogic } from '../../../logic/description-logic';
import { DetailList } from './detail-list';

interface Props {
	modifier: BagModifier;
}

// How a bag modifier changes the characters in the bag
export const BagModifierDetails = (props: Props) => {
	const adjustments = props.modifier.data.adjustments;
	return (
		<DetailList
			items={adjustments.length > 0 ? adjustments.map(DescriptionLogic.describeAdjustment) : [ 'The Storyteller adjusts the bag by hand' ]}
		/>
	);
};
