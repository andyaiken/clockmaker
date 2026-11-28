import { CharacterLogic } from '../../../logic/character-logic';
import { Expander } from '../../controls/expander';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import { JinxList } from '../jinx-list';
import { PhaseType } from '../../../enums/phase-type';
import { Spacer } from '../../controls/spacer';
import { Text } from '../../controls/text';
import { WinLogic } from '../../../logic/win-logic';

interface Props {
	game: Game;
}

// Win conditions and jinxes in play: things to keep in mind all game, pinned to the top of the phase panel
export const WatchOuts = (props: Props) => {
	const conditions = props.game.phase.type === PhaseType.Setup ? [] : WinLogic.getWinConditions(props.game);
	const characters = GameLogic.getCharactersInPlay(props.game);
	const jinxes = CharacterLogic.getJinxes(characters);

	if ((conditions.length === 0) && (jinxes.length === 0)) {
		return null;
	}

	const summary = [
		conditions.length > 0 ? `${conditions.length} win ${conditions.length === 1 ? 'condition' : 'conditions'}` : null,
		jinxes.length > 0 ? `${jinxes.length} ${jinxes.length === 1 ? 'jinx' : 'jinxes'}` : null
	].filter(Boolean).join(', ');

	return (
		<Expander label='Watch-outs' secondary={summary}>
			<Spacer>
				{
					conditions.length > 0 ?
						<Spacer>
							<Text type='h3'>Win conditions in play</Text>
							{
								conditions.map(c => (
									<Text key={c.key}>
										{c.character.name}{c.owner ? ` (${c.owner.name})` : ''}: {c.text}
										{c.placedOn.length > 0 ? ` On: ${c.placedOn.map(p => p.name).join(', ')}.` : ''}
									</Text>
								))
							}
						</Spacer>
						: null
				}
				{
					jinxes.length > 0 ?
						<Spacer>
							<Text type='h3'>Jinxes in play</Text>
							<JinxList characters={characters} />
						</Spacer>
						: null
				}
			</Spacer>
		</Expander>
	);
};
