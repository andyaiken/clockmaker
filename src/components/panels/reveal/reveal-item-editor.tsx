import * as stylex from '@stylexjs/stylex';
import type { RevealContent, RevealItem } from '../../../models/reveal';
import { AlignmentType } from '../../../enums/alignment-type';
import { Chips } from '../../controls/chips';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import { RevealLogic } from '../../../logic/reveal-logic';
import { RoleType } from '../../../enums/role-type';
import { Segmented } from '../../controls/segmented';
import { Stepper } from '../../controls/stepper';
import { Text } from '../../controls/text';
import { TextBox } from '../../controls/textbox';
import { Utility } from '../../../utils/utility';

interface Props {
	game: Game;
	item: RevealItem;
	// The player being shown this, if there is one; used for 'not self' restrictions
	ownerID?: string | null;
	part?: 'all' | 'prompt' | 'answer';
	onChange: (item: RevealItem) => void;
}

const styles = stylex.create({
	editor: {
		display: 'flex',
		flexDirection: 'column',
		gap: '5px'
	}
});

export const RevealItemEditor = (props: Props) => {
	const characters = GameLogic.getAvailableCharacters(props.game);
	const characterOptions = characters.map(c => ({ id: c.id, label: c.name }));
	const playerOptions = props.game.players.map((p, n) => ({ id: p.id, label: p.name, badge: `${n + 1}` }));

	const setContent = (content: RevealContent) => {
		props.onChange({ ...props.item, content: content });
	};

	const getContentEditor = () => {
		const content = props.item.content;
		switch (content.type) {
			case 'none':
			case 'grimoire':
				return null;
			case 'you_are':
				return (
					<>
						<Chips
							options={characterOptions}
							selectedIDs={content.characterID ? [ content.characterID ] : []}
							onToggle={id => setContent({ ...content, characterID: content.characterID === id ? null : id })}
						/>
						<Segmented
							options={[
								{ id: 'none', label: 'No alignment' },
								{ id: AlignmentType.Good, label: AlignmentType.Good },
								{ id: AlignmentType.Evil, label: AlignmentType.Evil }
							]}
							selectedID={content.alignment ?? 'none'}
							onChange={id => setContent({ ...content, alignment: id === 'none' ? null : id as AlignmentType })}
						/>
					</>
				);
			case 'characters':
				return (
					<Chips
						options={characterOptions}
						selectedIDs={content.characterIDs}
						onToggle={id => setContent({ ...content, characterIDs: Utility.toggle(content.characterIDs, id) })}
					/>
				);
			case 'players':
				return (
					<Chips
						options={playerOptions}
						selectedIDs={content.playerIDs}
						onToggle={id => setContent({ ...content, playerIDs: Utility.toggle(content.playerIDs, id) })}
					/>
				);
			case 'role':
				return (
					<Segmented
						options={[ RoleType.Townsfolk, RoleType.Outsider, RoleType.Minion, RoleType.Demon, RoleType.Traveller ].map(r => ({ id: r, label: r }))}
						selectedID={content.role}
						onChange={id => setContent({ ...content, role: id as RoleType })}
					/>
				);
			case 'alignment':
				return (
					<Segmented
						options={[ AlignmentType.Good, AlignmentType.Evil ].map(a => ({ id: a, label: a }))}
						selectedID={content.alignment}
						onChange={id => setContent({ ...content, alignment: id as AlignmentType })}
					/>
				);
			case 'number':
				return (
					<Stepper label='Number' value={content.value} onChange={value => setContent({ ...content, value: value })} />
				);
			case 'choose_players': {
				const options = RevealLogic.getChoosablePlayers(props.game, content.restrictions, props.ownerID ?? null)
					.map(p => ({ id: p.id, label: p.name, badge: `${props.game.players.indexOf(p) + 1}` }));
				return (
					<>
						<Text type='h3'>{RevealLogic.getChoiceLabel(content.playerIDs.length, content.min, content.max)}</Text>
						<Chips
							options={options}
							selectedIDs={content.playerIDs}
							onToggle={id => setContent({ ...content, playerIDs: Utility.toggle(content.playerIDs, id) })}
						/>
					</>
				);
			}
			case 'choose_characters': {
				const options = GameLogic.filterCharacters(props.game, characters, { types: content.types, inPlay: content.inPlay })
					.map(c => ({ id: c.id, label: c.name }));
				return (
					<>
						<Text type='h3'>{RevealLogic.getChoiceLabel(content.characterIDs.length, content.min, content.max)}</Text>
						<Chips
							options={options}
							selectedIDs={content.characterIDs}
							onToggle={id => setContent({ ...content, characterIDs: Utility.toggle(content.characterIDs, id) })}
						/>
					</>
				);
			}
			case 'choose_yes_no':
				return (
					<>
						<Text type='h3'>Their answer</Text>
						<Segmented
							options={[ { id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' } ]}
							selectedID={content.value === null ? null : (content.value ? 'yes' : 'no')}
							onChange={id => setContent({ ...content, value: id === 'yes' })}
						/>
					</>
				);
			case 'yes_no':
				return (
					<Segmented
						options={[ { id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' } ]}
						selectedID={content.value ? 'yes' : 'no'}
						onChange={id => setContent({ ...content, value: id === 'yes' })}
					/>
				);
		}
	};

	return (
		<div {...stylex.props(styles.editor)}>
			{
				props.part !== 'answer' ?
					<TextBox
						value={props.item.text}
						placeholder='Text shown to the player'
						onChange={text => props.onChange({ ...props.item, text: text })}
					/>
					: null
			}
			{props.part !== 'prompt' ? getContentEditor() : null}
		</div>
	);
};
