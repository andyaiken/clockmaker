import * as stylex from '@stylexjs/stylex';
import { Gavel, Hand, LockOpen, Megaphone, X } from 'lucide-react';
import { Button } from '../../controls/button';
import { Callout } from '../../controls/callout';
import type { DayAction } from '../../../models/day-action';
import { DayLogic } from '../../../logic/day-logic';
import { Divider } from '../../controls/divider';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import { Group } from '../../controls/group';
import type { Nomination } from '../../../models/day';
import { Spacer } from '../../controls/spacer';
import { Stepper } from '../../controls/stepper';
import { Text } from '../../controls/text';

interface Props {
	game: Game;
	// The nomination being set up, or the vote being counted, on the circle
	action: DayAction | null;
	onChange: (game: Game) => void;
	onActionChange: (action: DayAction | null) => void;
}

const styles = stylex.create({
	dayTab: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	},
	row: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px'
	},
	buttons: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '8px'
	},
	count: {
		display: 'flex',
		alignItems: 'baseline',
		gap: '8px'
	},
	countValue: {
		fontSize: '44px',
		fontWeight: '700',
		lineHeight: 1,
		fontVariantNumeric: 'tabular-nums'
	},
	override: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px'
	}
});

export const DayTab = (props: Props) => {
	const day = DayLogic.getDay(props.game);
	if (!day) {
		return (
			<div {...stylex.props(styles.dayTab)}>
				<Callout type='information'><Text>Nominations happen during the day.</Text></Callout>
			</div>
		);
	}

	const hasTravellers = DayLogic.hasTravellers(props.game);
	const block = DayLogic.getOnTheBlock(props.game, day);
	const executed = DayLogic.getExecutedPlayer(props.game, day);
	const exiledIDs = DayLogic.getExiledPlayerIDs(day);
	const exiled = DayLogic.getExiledPlayers(props.game, day);
	const getName = (id: string) => DayLogic.getPlayerName(props.game, id);
	const openID = props.action?.type === 'vote' ? props.action.nominationID : null;

	// Picking the nominator and nominee by tapping their seats
	const getNominating = () => {
		const action = props.action;
		if (action?.type !== 'nominate') {
			return null;
		}

		const prompt = action.nominatorID === null
			? (action.isExile ? 'Tap the player calling for the exile.' : 'Tap the player who is nominating.')
			: (action.nomineeID === null ? (action.isExile ? 'Tap the Traveller to exile.' : 'Tap the player being nominated.') : null);

		return (
			<Group>
				<Spacer>
					<Text type='h3'>{action.isExile ? 'New exile call' : 'New nomination'}</Text>
					{
						action.nominatorID ?
							<Text>{getName(action.nominatorID)} {action.isExile ? 'calls for the exile of' : 'nominates'} {action.nomineeID ? getName(action.nomineeID) : '…'}</Text>
							: null
					}
					{prompt ? <Callout type='information'>{prompt} Tap a picked seat again to change it.</Callout> : null}
					<div {...stylex.props(styles.buttons)}>
						<Button
							type='primary'
							icon={Hand}
							label='Start the vote'
							disabled={!action.nominatorID || !action.nomineeID}
							onClick={() => {
								if (action.nominatorID && action.nomineeID) {
									const updated = DayLogic.addNomination(props.game, action.nominatorID, action.nomineeID, action.isExile);
									const added = DayLogic.getDay(updated)?.nominations.slice(-1)[ 0 ];
									props.onChange(updated);
									props.onActionChange(added ? { type: 'vote', nominationID: added.id } : null);
								}
							}}
						/>
						<Button type='quiet' label='Cancel' onClick={() => props.onActionChange(null)} />
					</div>
				</Spacer>
			</Group>
		);
	};

	const getNomination = (nomination: Nomination) => {
		const needed = DayLogic.getVotesNeeded(props.game, nomination.isExile);
		const open = nomination.id === openID;
		const hands = DayLogic.getVotingOrder(props.game, nomination).filter(p => nomination.voterIDs.includes(p.id));
		const modified = nomination.votes !== nomination.voterIDs.length;

		return (
			<Group key={nomination.id}>
				<Spacer>
					<div {...stylex.props(styles.row)}>
						<Text type='h3'>
							{DayLogic.describeNomination(props.game, nomination)}
						</Text>
						<Button
							type='quiet'
							icon={X}
							iconOnly={true}
							label='Remove nomination'
							onClick={() => {
								if (open) {
									props.onActionChange(null);
								}
								props.onChange(DayLogic.removeNomination(props.game, nomination.id));
							}}
						/>
					</div>
					{open ? <Callout type='information'>Tap the seat of everyone with a hand up; tap again to lower it. A dead player's hand uses their ghost vote.</Callout> : null}
					<div {...stylex.props(styles.count)}>
						<span {...stylex.props(styles.countValue)}>{nomination.votes}</span>
						<Text type='dimmed'>of {needed} needed{modified ? ` (${nomination.voterIDs.length} hands, total adjusted)` : ''}</Text>
					</div>
					<Text type='dimmed'>{hands.length > 0 ? `Hands, in order round the circle: ${hands.map(p => DayLogic.getVoterLabel(p, nomination)).join(', ')}` : 'No hands yet'}</Text>
					{
						open ?
							<div {...stylex.props(styles.override)}>
								<Stepper label='Votes' value={nomination.votes} onChange={votes => props.onChange(DayLogic.setVotes(props.game, nomination.id, votes))} />
								<Text type='dimmed'>Adjust the total for vote modifiers</Text>
							</div>
							: null
					}
					<div {...stylex.props(styles.buttons)}>
						{
							open ?
								<Button label='Close the vote' onClick={() => props.onActionChange(null)} />
								:
								<Button type='quiet' icon={LockOpen} label='Reopen the vote' onClick={() => props.onActionChange({ type: 'vote', nominationID: nomination.id })} />
						}
						{
							nomination.isExile && (nomination.votes >= needed) && !exiledIDs.includes(nomination.nomineeID) ?
								<Button type='primary' label={`Exile ${getName(nomination.nomineeID)}`} onClick={() => props.onChange(DayLogic.exile(props.game, nomination.nomineeID))} />
								: null
						}
					</div>
				</Spacer>
			</Group>
		);
	};

	return (
		<div {...stylex.props(styles.dayTab)}>
			<Text type='h2'>Day {day.number}</Text>
			<Text>{DayLogic.getVotesNeeded(props.game, false)} votes needed to execute ({GameLogic.getAlivePlayers(props.game).length} alive)</Text>
			<Divider />
			{
				executed ?
					<Text type='h3'>{executed.name} was executed today</Text>
					:
					(
						block ?
							<Spacer>
								<Text type='h3'>On the block: {block.player.name} ({block.votes} votes)</Text>
								<Button type='primary' label={`Execute ${block.player.name}`} onClick={() => props.onChange(DayLogic.execute(props.game, block.player.id))} />
							</Spacer>
							:
							<Text type='h3'>{DayLogic.isTied(props.game, day) ? 'Tied: nobody is on the block' : 'Nobody is on the block'}</Text>
					)
			}
			{exiled.map(p => <Text key={p.id} type='h3'>{p.name} was exiled today</Text>)}
			<Divider />
			{
				props.action?.type === 'nominate' ?
					getNominating()
					:
					<div {...stylex.props(styles.buttons)}>
						<Button icon={Gavel} label='New nomination' onClick={() => props.onActionChange({ type: 'nominate', isExile: false, nominatorID: null, nomineeID: null })} />
						{hasTravellers ? <Button icon={Megaphone} label='Call for exile' onClick={() => props.onActionChange({ type: 'nominate', isExile: true, nominatorID: null, nomineeID: null })} /> : null}
					</div>
			}
			{[ ...day.nominations ].reverse().map(getNomination)}
		</div>
	);
};
