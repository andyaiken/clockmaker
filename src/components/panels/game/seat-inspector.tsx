import { ArrowUpToLine, RotateCcw, RotateCw } from 'lucide-react';
import { AlignmentType } from '../../../enums/alignment-type';
import { Button } from '../../controls/button';
import { Center } from '../../controls/center';
import { CharacterPanel } from '../character-panel';
import { Chips } from '../../controls/chips';
import { ConfirmButton } from '../../controls/confirm-button';
import { Divider } from '../../controls/divider';
import { Expander } from '../../controls/expander';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import { PhaseLogic } from '../../../logic/phase-logic';
import type { Player } from '../../../models/player';
import { PlayerRemindersPanel } from '../player-reminders-panel';
import { PlayerState } from '../../../enums/player-state';
import type { Reveal } from '../../../models/reveal';
import { RevealBuilder } from '../reveal/reveal-builder';
import { RoleType } from '../../../enums/role-type';
import { Segmented } from '../../controls/segmented';
import { Spacer } from '../../controls/spacer';
import { Text } from '../../controls/text';
import { TextBox } from '../../controls/textbox';

interface Props {
	game: Game;
	player: Player;
	onChange: (game: Game) => void;
	onShowReveal: (reveal: Reveal) => void;
}

// Everything about one player: their character, editing them, their reminders and showing them things
export const SeatInspector = (props: Props) => {
	const player = props.player;

	return (
		<Spacer>
			{
				player.character ?
					<Center><CharacterPanel character={player.character} /></Center>
					: null
			}
			{
				player.character?.role === RoleType.Traveller ?
					<ConfirmButton
						label='Remove Traveller'
						confirmLabel={`Remove ${player.name}`}
						onConfirm={() => props.onChange(PhaseLogic.removePlayer(props.game, player.id))}
					/>
					: null
			}
			<Divider />
			<Expander label='Edit'>
				<Spacer>
					<Text>Player name</Text>
					<TextBox
						value={player.name}
						onChange={name => props.onChange(PhaseLogic.setPlayerName(props.game, player.id, name))}
					/>
					<Expander label='Change character'>
						<Chips
							options={GameLogic.getAvailableCharacters(props.game).map(c => ({ id: c.id, label: c.name }))}
							selectedIDs={player.character ? [ player.character.id ] : []}
							onToggle={id => props.onChange(PhaseLogic.changeCharacter(props.game, player.id, id))}
						/>
					</Expander>
					<Text>Alignment</Text>
					<Segmented
						options={[ AlignmentType.Good, AlignmentType.Evil ].map(alignment => ({ id: alignment, label: alignment }))}
						selectedID={player.alignment}
						onChange={id => {
							if (id !== AlignmentType.Good && id !== AlignmentType.Evil) {
								throw new Error(`Unknown alignment: ${id}`);
							}
							props.onChange(PhaseLogic.setAlignment(props.game, player.id, id));
						}}
					/>
					<Text>State</Text>
					<Segmented
						options={[
							{ id: PlayerState.Alive, label: 'Alive' },
							{ id: PlayerState.DeadWithGhostVote, label: 'Dead, ghost vote' },
							{ id: PlayerState.DeadWithoutGhostVote, label: 'Dead, vote used' }
						]}
						selectedID={player.state}
						onChange={id => props.onChange(PhaseLogic.setPlayerState(props.game, player.id, id as PlayerState))}
					/>
					<Text>Seat</Text>
					<Spacer orientation='horizontal'>
						<Button icon={RotateCcw} label='Move anticlockwise' disabled={props.game.players.length < 2} onClick={() => props.onChange(PhaseLogic.movePlayer(props.game, player.id, 'anticlockwise'))} />
						<Button icon={RotateCw} label='Move clockwise' disabled={props.game.players.length < 2} onClick={() => props.onChange(PhaseLogic.movePlayer(props.game, player.id, 'clockwise'))} />
						<Button icon={ArrowUpToLine} label='Put at top' disabled={props.game.players.indexOf(player) === (props.game.topSeat ?? 0)} onClick={() => props.onChange({ ...props.game, topSeat: props.game.players.indexOf(player) })} />
					</Spacer>
				</Spacer>
			</Expander>
			{
				player.death ?
					<>
						<Divider />
						<Text type='h3'>Death</Text>
						<Text>{PhaseLogic.getLabel(player.death.phase)}</Text>
						<TextBox
							value={player.death.cause}
							onChange={cause => props.onChange(PhaseLogic.setCauseOfDeath(props.game, player.id, cause))}
						/>
					</>
					: null
			}
			{
				player.bluffs ?
					<>
						<Divider />
						<Text type='h3'>Bluffs</Text>
						<Text>{player.bluffs.map(c => c.name).join(', ') || 'Shown no characters'}</Text>
					</>
					: null
			}
			<Divider />
			<PlayerRemindersPanel game={props.game} player={player} onChange={props.onChange} />
			<Divider />
			<Expander label='Show to player'>
				<RevealBuilder key={player.id} game={props.game} player={player} onShow={props.onShowReveal} />
			</Expander>
		</Spacer>
	);
};
