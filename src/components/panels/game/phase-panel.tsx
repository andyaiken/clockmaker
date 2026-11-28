import * as stylex from '@stylexjs/stylex';
import { type NightDrafts, NightTab } from './night-tab';
import { Button } from '../../controls/button';
import { Callout } from '../../controls/callout';
import type { DayAction } from '../../../models/day-action';
import { DayLogic } from '../../../logic/day-logic';
import { DayTab } from './day-tab';
import type { Game } from '../../../models/game';
import { PhaseLogic } from '../../../logic/phase-logic';
import { PhaseType } from '../../../enums/phase-type';
import type { Reveal } from '../../../models/reveal';
import type { SeatPick } from '../../../models/seat-pick';
import { SetupLogic } from '../../../logic/setup-logic';
import { SetupSection } from './setup-section';
import type { SetupSelection } from '../../../models/setup-selection';
import { WatchOuts } from './watch-outs';
import { WinLogic } from '../../../logic/win-logic';
import { palette } from '../../../tokens.stylex';

interface Props {
	game: Game;
	setupSelection: SetupSelection | null;
	nightDrafts: NightDrafts;
	onNightDraftsChange: (drafts: NightDrafts) => void;
	onSetupSelectionChange: (selection: SetupSelection | null) => void;
	onChange: (game: Game) => void;
	onShowReveal: (reveal: Reveal) => void;
	onHighlightPlayersChange: (playerIDs: string[]) => void;
	dayAction: DayAction | null;
	onDayActionChange: (action: DayAction | null) => void;
	onSeatPickChange: (pick: SeatPick | null) => void;
}

const styles = stylex.create({
	panel: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		borderRadius: '14px',
		backgroundColor: palette.backgroundDark
	},
	header: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		padding: '10px 10px 0 10px'
	},
	body: {
		flex: '1 1 0',
		overflowY: 'auto',
		padding: '10px'
	},
	// Ending the phase is always in the same place
	footer: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		padding: '10px',
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: palette.controlBorder
	}
});

// What the current phase needs: setup, then the night's wakes, then the day's nominations
export const PhasePanel = (props: Props) => {
	const phase = props.game.phase.type;
	const phaseKey = `${props.game.phase.type}-${props.game.phase.number}`;

	const getContent = () => {
		switch (phase) {
			case PhaseType.Setup:
				return (
					<SetupSection
						game={props.game}
						setupSelection={props.setupSelection}
						onSetupSelectionChange={props.onSetupSelectionChange}
						onChange={props.onChange}
					/>
				);
			case PhaseType.Night:
				return (
					<NightTab
						game={props.game}
						drafts={props.nightDrafts}
						onDraftsChange={props.onNightDraftsChange}
						onChange={props.onChange}
						onShowReveal={props.onShowReveal}
						onHighlightPlayersChange={props.onHighlightPlayersChange}
						onSeatPickChange={props.onSeatPickChange}
					/>
				);
			default:
				return <DayTab game={props.game} action={props.dayAction} onChange={props.onChange} onActionChange={props.onDayActionChange} />;
		}
	};

	const getFooter = () => {
		if (phase === PhaseType.Setup) {
			// Until every character is seated and every reminder placed, the setup steps say what's left
			const ready = (props.game.bag.length === 0) && SetupLogic.isSetupComplete(props.game);
			return (
				<div {...stylex.props(styles.footer)}>
					<Button
						type='primary'
						block={true}
						label='Begin Game'
						disabled={!ready}
						onClick={() => {
							props.onSetupSelectionChange(null);
							props.onChange(SetupLogic.beginGame(props.game));
						}}
					/>
				</div>
			);
		}

		const suggestion = WinLogic.getSuggestedResult(props.game);
		const number = props.game.phase.number;

		// A reminder before ending the day with someone left on the block
		const day = DayLogic.getDay(props.game);
		const block = (day && !DayLogic.getExecutedPlayer(props.game, day)) ? DayLogic.getOnTheBlock(props.game, day) : null;

		return (
			<div {...stylex.props(styles.footer)}>
				{
					suggestion ?
						<Callout>
							{suggestion.winner} wins: {suggestion.reason}.
							{suggestion.caveat ? ` Check first: ${suggestion.caveat}.` : ''}
						</Callout>
						: null
				}
				{block ? <Callout type='warning'>{block.player.name} is on the block but has not been executed.</Callout> : null}
				{
					phase === PhaseType.Night ?
						<Button type={suggestion ? 'default' : 'primary'} block={true} label={`End Night ${number}`} onClick={() => props.onChange(PhaseLogic.endNight(props.game))} />
						:
						<Button type={suggestion ? 'default' : 'primary'} block={true} label={`End Day ${number}`} onClick={() => props.onChange(PhaseLogic.endDay(props.game))} />
				}
			</div>
		);
	};

	return (
		<div {...stylex.props(styles.panel)}>
			<div {...stylex.props(styles.header)}>
				<WatchOuts game={props.game} />
			</div>
			{/* Keyed so each phase starts scrolled to the top */}
			<div key={phaseKey} {...stylex.props(styles.body)}>
				{getContent()}
			</div>
			{getFooter()}
		</div>
	);
};
