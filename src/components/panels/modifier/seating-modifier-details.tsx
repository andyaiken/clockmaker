import { DescriptionLogic } from '../../../logic/description-logic';
import { DetailList } from './detail-list';
import type { SeatingModifier } from '../../../models/modifier';

interface Props {
	modifier: SeatingModifier;
}

// Where players must sit for a seating modifier
export const SeatingModifierDetails = (props: Props) => {
	const requirements = props.modifier.data.requirements;
	return (
		<DetailList
			items={requirements.length > 0 ? requirements.map(DescriptionLogic.describeRequirement) : [ 'The Storyteller arranges the seats by hand' ]}
		/>
	);
};
