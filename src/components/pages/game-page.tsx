import * as stylex from '@stylexjs/stylex';
import { ChevronLeft, Eye, EyeOff, X } from 'lucide-react';
import { sendNightCommand, useShortcuts } from '../../hooks/use-shortcuts';
import { useEffect, useRef, useState } from 'react';
import { Alarm } from '../../logic/alarm';
import { Button } from '../controls/button';
import type { DayAction } from '../../models/day-action';
import type { DayTimer } from '../../hooks/use-day-timer';
import type { Game } from '../../models/game';
import { GameLogic } from '../../logic/game-logic';
import { GrimoirePanel } from '../panels/grimoire-panel';
import type { GrimoireView } from '../../logic/grimoire-view-logic';
import { HistoryLogic } from '../../logic/history-logic';
import { HistoryStrip } from '../panels/game/history-strip';
import { HoldButton } from '../controls/hold-button';
import { LookBackPanel } from '../panels/game/look-back-panel';
import type { NightDrafts } from '../panels/game/night-tab';
import { PhaseLogic } from '../../logic/phase-logic';
import { PhasePanel } from '../panels/game/phase-panel';
import { PhaseType } from '../../enums/phase-type';
import type { Reveal } from '../../models/reveal';
import { RevealOverlay } from '../panels/reveal/reveal-overlay';
import { SeatInspector } from '../panels/game/seat-inspector';
import { SeatMenu } from '../panels/game/seat-menu';
import type { SeatPick } from '../../models/seat-pick';
import type { SetupSelection } from '../../models/setup-selection';
import { Sheet } from '../controls/sheet';
import { Text } from '../controls/text';
import { TopBar } from '../panels/game/top-bar';
import { palette } from '../../tokens.stylex';
import { useDayTimerExpiry } from '../../hooks/use-day-timer';
import { useSettings } from '../settings-context';
import { useWakeLock } from '../../hooks/use-wake-lock';

interface Props {
	game: Game | null;
	onChange: (game: Game) => void;
	onCancel: () => void;
	onEndGame: () => void;
	onReRack: () => void;
	onHelp?: () => void;
}

const styles = stylex.create({
	gamePage: {
		height: '100%',
		width: '100%',
		overflow: 'hidden',
		padding: '12px 20px 20px 20px',
		display: 'flex',
		flexDirection: 'column',
		gap: '10px',
		backgroundColor: palette.background,
		color: palette.text
	},
	main: {
		flex: '1 1 0',
		minHeight: 0,
		display: 'flex',
		flexDirection: 'row',
		gap: '16px'
	},
	grimoire: {
		flex: '2 2 0',
		minWidth: 0
	},
	side: {
		flex: '1 1 0',
		minWidth: 0,
		position: 'relative'
	},
	// The seat inspector lies over the phase panel; closing it shows the panel again
	inspector: {
		position: 'absolute',
		inset: 0,
		zIndex: 5,
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		borderRadius: '14px',
		backgroundColor: palette.background,
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		boxShadow: '0 8px 30px rgb(0 0 0 / 0.15)'
	},
	inspectorHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		padding: '6px 6px 6px 16px',
		borderBottomWidth: '1px',
		borderBottomStyle: 'solid',
		borderBottomColor: palette.controlBorder
	},
	inspectorTitle: {
		flex: '1 1 auto',
		minWidth: 0
	},
	inspectorBody: {
		flex: '1 1 0',
		overflowY: 'auto',
		padding: '12px'
	},
	// Privacy lowers an opaque curtain over the side panel; a blur would still leak colours and shapes
	curtain: {
		position: 'absolute',
		inset: 0,
		zIndex: 10,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '16px',
		borderRadius: '14px',
		backgroundColor: palette.backgroundDark,
		color: palette.textDimmed
	},
	sideContent: {
		position: 'relative',
		height: '100%'
	},
	shortcuts: {
		width: '100%',
		borderCollapse: 'collapse',
		marginBottom: '12px',
		fontSize: '16px'
	},
	shortcutKey: {
		width: '160px',
		padding: '8px 12px 8px 0',
		textAlign: 'left',
		fontWeight: '600',
		verticalAlign: 'top'
	},
	lookBack: {
		position: 'absolute',
		inset: 0,
		zIndex: 6
	}
});

export const GamePage = (props: Props) => {
	const [ selectedPlayerID, setSelectedPlayerID ] = useState<string | null>(null);
	const [ highlightedPlayerIDs, setHighlightedPlayerIDs ] = useState<string[]>([]);
	const [ setupSelection, setSetupSelection ] = useState<SetupSelection | null>(null);
	const [ reveal, setReveal ] = useState<Reveal | null>(null);
	const [ privacy, setPrivacy ] = useState(false);
	const [ view, setView ] = useState<GrimoireView>('characters');
	const [ timer, setTimer ] = useState<DayTimer>({ duration: 5 * 60, endsAt: null });
	// Answers being filled in during the night, kept while the Storyteller looks at other things
	const [ nightDrafts, setNightDrafts ] = useState<NightDrafts>({});
	// A nomination being set up, or a vote being counted, on the circle
	const [ dayAction, setDayAction ] = useState<DayAction | null>(null);
	// A player's night choice being made by tapping seats
	const [ seatPick, setSeatPick ] = useState<SeatPick | null>(null);

	// A nomination or vote belongs to its day
	const phaseKey = props.game ? `${props.game.phase.type}-${props.game.phase.number}` : '';
	useEffect(() => setDayAction(null), [ phaseKey ]);
	const { settings } = useSettings();
	useWakeLock(props.game !== null);

	// A soft bell at dusk and dawn, if chimes are on
	const previousPhase = useRef(props.game?.phase.type ?? null);
	useEffect(() => {
		const before = previousPhase.current;
		const now = props.game?.phase.type ?? null;
		previousPhase.current = now;
		if (!settings.chimes || !before || (before === now)) {
			return;
		}
		if (now === PhaseType.Night) {
			Alarm.chime('dusk');
		} else if (now === PhaseType.Day) {
			Alarm.chime('dawn');
		}
	}, [ props.game?.phase.type, settings.chimes ]);

	// A seat number typed on the keyboard, passed to the grimoire as if it were tapped
	const [ tapRequest, setTapRequest ] = useState<{ index: number, n: number } | null>(null);
	// A grimoire corner asking the top bar to open the bluffs or Fabled / Loric sheet
	const [ sheetRequest, setSheetRequest ] = useState<{ id: 'bluffs' | 'fabled', n: number } | null>(null);
	const [ showShortcuts, setShowShortcuts ] = useState(false);

	// The curtain comes down whenever the app goes into the background, so opening the iPad at the table never shows the grimoire
	useEffect(() => {
		const onVisibility = () => {
			if (document.visibilityState === 'hidden') {
				setPrivacy(true);
				setSelectedPlayerID(null);
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		window.addEventListener('pagehide', onVisibility);
		return () => {
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('pagehide', onVisibility);
		};
	}, []);

	// Quick actions for a held seat
	const [ seatMenu, setSeatMenu ] = useState<{ playerID: string, x: number, y: number } | null>(null);
	// The past phase being looked back at, if any
	const [ lookBackKey, setLookBackKey ] = useState<string | null>(null);
	useEffect(() => setLookBackKey(null), [ phaseKey ]);
	// Whether the look-back strip is out; it stays out of the way until it's wanted
	const [ lookBackOpen, setLookBackOpen ] = useState(false);
	const closeLookBack = () => {
		setLookBackOpen(false);
		setLookBackKey(null);
	};

	// When the day timer runs out, sound the alarm and reset it, ready to start again
	useDayTimerExpiry(timer, () => {
		Alarm.play();
		setTimer(t => ({ ...t, endsAt: null }));
	});

	const live = props.game;
	useShortcuts({
		keys: {
			'p': () => {
				setPrivacy(true);
				setSelectedPlayerID(null);
			},
			'[': () => live && props.onChange({ ...live, topSeat: ((live.topSeat ?? 0) + 1) % live.players.length }),
			']': () => live && props.onChange({ ...live, topSeat: ((live.topSeat ?? 0) - 1 + live.players.length) % live.players.length }),
			'?': () => setShowShortcuts(true),
			'n': () => {
				if (live?.phase.type === PhaseType.Day) {
					setDayAction({ type: 'nominate', isExile: false, nominatorID: null, nomineeID: null });
					setSelectedPlayerID(null);
				}
			},
			'ArrowRight': () => sendNightCommand('next'),
			'ArrowLeft': () => sendNightCommand('previous'),
			'space': () => sendNightCommand('show'),
			'Escape': () => {
				setSelectedPlayerID(null);
				setDayAction(null);
				closeLookBack();
			}
		},
		digit: value => {
			if (live && (value >= 1) && (value <= live.players.length)) {
				setTapRequest(current => ({ index: value - 1, n: (current?.n ?? 0) + 1 }));
			}
		}
	}, !!live && !privacy && !reveal && !showShortcuts);

	if (!props.game) {
		return (
			<div {...stylex.props(styles.gamePage)}>
				<Text>No saved game is available.</Text>
				<Button type='quiet' icon={ChevronLeft} label='Back' onClick={props.onCancel} />
			</div>
		);
	}

	const game = props.game;
	// The phase tint behind the circle: night or day, if it's on
	const getTint = (phase: PhaseType) => settings.phaseTint ? (phase === PhaseType.Night ? 'night' : (phase === PhaseType.Day ? 'day' : null)) : null;
	const selectedPlayer = GameLogic.findPlayer(game, selectedPlayerID);
	const snapshots = HistoryLogic.getSnapshots(game);
	const lookBack = snapshots.find(s => HistoryLogic.getPhaseKey(s.phase) === lookBackKey) ?? null;
	const historyStrip = (lookBackOpen && (snapshots.length > 0)) ?
		<HistoryStrip
			phases={snapshots.map(s => ({ key: HistoryLogic.getPhaseKey(s.phase), label: PhaseLogic.getLabel(s.phase) }))}
			selectedKey={lookBack ? lookBackKey : null}
			onSelect={key => {
				setLookBackKey(key);
				setSelectedPlayerID(null);
			}}
		/>
		: null;

	return (
		<div {...stylex.props(styles.gamePage)}>
			<TopBar
				game={game}
				privacy={privacy}
				timer={timer}
				onTogglePrivacy={() => {
					setPrivacy(current => !current);
					setSelectedPlayerID(null);
				}}
				onTimerChange={setTimer}
				lookBackOpen={snapshots.length > 0 ? lookBackOpen : null}
				onToggleLookBack={() => {
					if (lookBackOpen) {
						closeLookBack();
					} else {
						setLookBackOpen(true);
					}
				}}
				onChange={props.onChange}
				onHome={props.onCancel}
				onEndGame={props.onEndGame}
				onReRack={props.onReRack}
				onShowShortcuts={() => setShowShortcuts(true)}
				onHelp={props.onHelp}
				sheetRequest={sheetRequest}
			/>
			<div {...stylex.props(styles.main)}>
				<div {...stylex.props(styles.grimoire)}>
					{
						lookBack ?
							<GrimoirePanel
								game={HistoryLogic.getGameAt(game, lookBack)}
								selectedPlayerID={null}
								setupSelection={null}
								onSetupSelectionChange={() => null}
								onChange={() => null}
								onPlayerSelected={() => null}
								privacy={privacy}
								timer={timer}
								view={view}
								onViewChange={setView}
								header={historyStrip}
								tint={getTint(lookBack.phase.type)}
							/>
							:
							<GrimoirePanel
								game={game}
								selectedPlayerID={selectedPlayerID}
								highlightedPlayerIDs={highlightedPlayerIDs}
								setupSelection={setupSelection}
								onSetupSelectionChange={setSetupSelection}
								onChange={props.onChange}
								onPlayerSelected={id => {
									if (!privacy) {
										setSelectedPlayerID(id);
									}
								}}
								privacy={privacy}
								timer={timer}
								turnable={true}
								dayAction={privacy ? null : dayAction}
								seatPick={privacy ? null : seatPick}
								onDayActionChange={setDayAction}
								view={view}
								onViewChange={setView}
								inkable={true}
								header={historyStrip}
								tint={getTint(game.phase.type)}
								onSeatLongPress={(player, x, y) => setSeatMenu({ playerID: player.id, x, y })}
								tapRequest={tapRequest}
								onCornerClick={corner => setSheetRequest(current => ({ id: corner, n: (current?.n ?? 0) + 1 }))}
							/>
					}
				</div>
				<div {...stylex.props(styles.side)}>
					{
						privacy ?
							<div {...stylex.props(styles.curtain)}>
								<EyeOff size={40} aria-hidden='true' />
								<Text type='h3'>The grimoire is hidden</Text>
								<HoldButton icon={Eye} label='Hold to show' onHold={() => setPrivacy(false)} />
							</div>
							: null
					}
					<div {...stylex.props(styles.sideContent)} inert={privacy} aria-hidden={privacy}>
						{/* Looking back lies over the phase panel, which keeps its place underneath */}
						{
							lookBack ?
								<div {...stylex.props(styles.lookBack)}>
									<LookBackPanel game={game} snapshot={lookBack} onClose={closeLookBack} />
								</div>
								: null
						}
						<PhasePanel
							game={game}
							setupSelection={setupSelection}
							nightDrafts={nightDrafts}
							onNightDraftsChange={setNightDrafts}
							onSetupSelectionChange={selection => {
								setSetupSelection(selection);
								if (selection?.type === 'character') {
									setSelectedPlayerID(null);
								}
							}}
							onChange={props.onChange}
							onShowReveal={setReveal}
							onHighlightPlayersChange={setHighlightedPlayerIDs}
							dayAction={dayAction}
							onSeatPickChange={setSeatPick}
							onDayActionChange={action => {
								setDayAction(action);
								setSelectedPlayerID(null);
							}}
						/>
						{
							selectedPlayer ?
								<div {...stylex.props(styles.inspector)} role='region' aria-label={`${selectedPlayer.name}, seat ${game.players.indexOf(selectedPlayer) + 1}`}>
									<div {...stylex.props(styles.inspectorHeader)}>
										<div {...stylex.props(styles.inspectorTitle)}>
											<Text type='h2'>{selectedPlayer.name}</Text>
											<Text type='dimmed'>Seat {game.players.indexOf(selectedPlayer) + 1}</Text>
										</div>
										<Button type='quiet' icon={X} iconOnly={true} label='Close' onClick={() => setSelectedPlayerID(null)} />
									</div>
									<div {...stylex.props(styles.inspectorBody)}>
										<SeatInspector key={selectedPlayer.id} game={game} player={selectedPlayer} onChange={props.onChange} onShowReveal={setReveal} />
									</div>
								</div>
								: null
						}
					</div>
				</div>
			</div>
			{
				seatMenu && !privacy && GameLogic.findPlayer(game, seatMenu.playerID) ?
					<SeatMenu
						game={game}
						player={GameLogic.findPlayer(game, seatMenu.playerID)!}
						x={seatMenu.x}
						y={seatMenu.y}
						onChange={props.onChange}
						onDetails={() => setSelectedPlayerID(seatMenu.playerID)}
						onClose={() => setSeatMenu(null)}
					/>
					: null
			}
			{
				showShortcuts ?
					<Sheet title='Keyboard shortcuts' onClose={() => setShowShortcuts(false)}>
						<table {...stylex.props(styles.shortcuts)}>
							<tbody>
								{
									[
										[ '→ and ←', 'Next and previous night step' ],
										[ 'Space', 'Show the current night step to the player' ],
										[ 'Seat number', 'Tap that seat: for a choice, a nomination or a hand' ],
										[ 'N', 'Start a nomination' ],
										[ 'P', 'Lower the privacy curtain' ],
										[ '[ and ]', 'Turn the circle one seat anticlockwise or clockwise' ],
										[ 'Esc', 'Close the seat details, or stop a nomination or vote' ],
										[ '?', 'Show these shortcuts' ]
									].map(([ key, does ]) => (
										<tr key={key}>
											<th scope='row' {...stylex.props(styles.shortcutKey)}><kbd>{key}</kbd></th>
											<td>{does}</td>
										</tr>
									))
								}
							</tbody>
						</table>
						<Text type='dimmed'>Shortcuts pause while you're typing in a text field.</Text>
					</Sheet>
					: null
			}
			{reveal ? <RevealOverlay game={game} reveal={reveal} onClose={() => setReveal(null)} /> : null}
		</div>
	);
};
