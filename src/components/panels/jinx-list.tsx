import { Callout } from '../controls/callout';
import type { Character } from '../../models/character';
import { CharacterLogic } from '../../logic/character-logic';
import { Spacer } from '../controls/spacer';
import { Text } from '../controls/text';

interface Props {
	characters: Character[];
	emptyText?: string;
}

export const JinxList = (props: Props) => {
	const jinxes = CharacterLogic.getJinxes(props.characters);
	if (jinxes.length === 0) {
		return props.emptyText ? <Text type='dimmed'>{props.emptyText}</Text> : null;
	}

	return (
		<Spacer>
			{
				jinxes.map(j => (
					<Callout key={`${j.character.id}-${j.other.id}`}>
						{j.character.name} and {j.other.name}: {j.text}
					</Callout>
				))
			}
		</Spacer>
	);
};
