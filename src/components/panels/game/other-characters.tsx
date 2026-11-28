import { AlignmentType } from '../../../enums/alignment-type';
import { Button } from '../../controls/button';
import { Center } from '../../controls/center';
import { CharacterLogic } from '../../../logic/character-logic';
import { CharacterPanel } from '../character-panel';
import { Chips } from '../../controls/chips';
import { Divider } from '../../controls/divider';
import { Expander } from '../../controls/expander';
import type { Game } from '../../../models/game';
import { PhaseLogic } from '../../../logic/phase-logic';
import { Segmented } from '../../controls/segmented';
import { Spacer } from '../../controls/spacer';
import { Text } from '../../controls/text';
import { TextBox } from '../../controls/textbox';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Props {
	game: Game;
	onChange: (game: Game) => void;
}

// The Demon's bluffs, and any different ones other players were given (eg a Lunatic, or Minions with the Snitch)
export const BluffsPanel = (props: Props) => {
	const demonIDs = props.game.bluffs.map(c => c.id).join(',');
	const others = props.game.players.filter(p => p.bluffs && (p.bluffs.map(c => c.id).join(',') !== demonIDs));

	return (
		<Spacer>
			{props.game.bluffs.length === 0 ? <Text type='dimmed'>No bluffs were chosen for this game.</Text> : null}
			{props.game.bluffs.map(c => <Center key={c.id}><CharacterPanel character={c} /></Center>)}
			{
				others.length > 0 ?
					<>
						<Divider />
						<Text type='h3'>Other bluffs</Text>
						{
							others.map(p => (
								<Text key={p.id}>
									{p.name} ({p.character?.name ?? 'no character'}): {(p.bluffs ?? []).map(c => c.name).join(', ') || 'none'}
								</Text>
							))
						}
					</>
					: null
			}
		</Spacer>
	);
};

// Fabled and Loric in play, and adding or removing them
export const FabledLoricPanel = (props: Props) => {
	const toggleOther = (id: string) => props.onChange(PhaseLogic.toggleOtherCharacter(props.game, id));

	return (
		<Spacer>
			{
				props.game.otherCharacters.map(c => (
					<Spacer key={c.id}>
						<Center>
							<CharacterPanel character={c} />
						</Center>
						<Button type='quiet' icon={X} iconOnly={true} label='Remove' onClick={() => toggleOther(c.id)} />
					</Spacer>
				))
			}
			{props.game.otherCharacters.length === 0 ? <Text type='dimmed'>None</Text> : null}
			<Divider />
			<Text>Add a Fabled or Loric</Text>
			<Chips
				options={CharacterLogic.getFabledAndLoric().map(c => ({ id: c.id, label: c.name }))}
				selectedIDs={props.game.otherCharacters.map(c => c.id)}
				onToggle={toggleOther}
			/>
		</Spacer>
	);
};

// Adding a Traveller to the game
export const AddTravellerPanel = (props: Props) => {
	const [ name, setName ] = useState('');
	const [ characterID, setCharacterID ] = useState<string | null>(null);
	const [ alignment, setAlignment ] = useState<AlignmentType>(AlignmentType.Good);
	const [ afterPlayerID, setAfterPlayerID ] = useState<string | null>(null);

	const travellers = PhaseLogic.getAvailableTravellers(props.game);
	const scriptTravellers = travellers.onScript;
	const otherTravellers = travellers.others;
	const after = PhaseLogic.getTravellerSeat(props.game, afterPlayerID);

	const toOptions = (ids: { id: string, name: string }[]) => ids.map(c => ({ id: c.id, label: c.name }));
	const onToggleCharacter = (id: string) => setCharacterID(current => current === id ? null : id);

	return (
		<Spacer>
			<Text>Player name</Text>
			<TextBox value={name} placeholder='Traveller' onChange={setName} />
			<Text>Traveller</Text>
			{
				scriptTravellers.length > 0 ?
					<Chips options={toOptions(scriptTravellers)} selectedIDs={characterID ? [ characterID ] : []} onToggle={onToggleCharacter} />
					: <Text type='dimmed'>None left on this script</Text>
			}
			{
				otherTravellers.length > 0 ?
					<Expander label='Travellers not on this script'>
						<Chips options={toOptions(otherTravellers)} selectedIDs={characterID ? [ characterID ] : []} onToggle={onToggleCharacter} />
					</Expander>
					: null
			}
			<Text>Alignment</Text>
			<Segmented
				options={[ AlignmentType.Good, AlignmentType.Evil ].map(a => ({ id: a, label: a }))}
				selectedID={alignment}
				onChange={id => setAlignment(id === AlignmentType.Evil ? AlignmentType.Evil : AlignmentType.Good)}
			/>
			<Text>Sits clockwise after</Text>
			<Chips
				options={props.game.players.map((p, n) => ({ id: p.id, label: p.name, badge: `${n + 1}` }))}
				selectedIDs={after ? [ after.id ] : []}
				onToggle={setAfterPlayerID}
			/>
			<Button
				type='primary'
				label='Add Traveller'
				disabled={!characterID}
				onClick={() => {
					if (!characterID) {
						return;
					}
					props.onChange(PhaseLogic.addTraveller(props.game, {
						name: name.trim() || 'Traveller',
						characterID: characterID,
						alignment: alignment,
						afterPlayerID: after?.id ?? null
					}));
					setName('');
					setCharacterID(null);
					setAlignment(AlignmentType.Good);
					setAfterPlayerID(null);
				}}
			/>
		</Spacer>
	);
};
