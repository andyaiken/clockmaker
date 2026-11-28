import * as stylex from '@stylexjs/stylex';
import { ClipboardList, Eraser, Glasses, HeartPulse, History, Moon, PenLine, RotateCcw, RotateCw, Shapes, Skull, Sun, Users, Vote } from 'lucide-react';
import { type Seat, type SeatReminder, SeatRing } from './seat-ring';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { Button } from '../controls/button';
import type { Character } from '../../models/character';
import { CharacterLogic } from '../../logic/character-logic';
import { ClockMechanism } from './clock-mechanism';
import { ColourLogic } from '../../logic/colour-logic';
import type { DayAction } from '../../models/day-action';
import { DayLogic } from '../../logic/day-logic';
import type { DayTimer } from '../../hooks/use-day-timer';
import type { Game } from '../../models/game';
import { GameLogic } from '../../logic/game-logic';
import { GrimoireCentre } from './grimoire-centre';
import type { GrimoireView } from '../../logic/grimoire-view-logic';
import { GrimoireViewLogic } from '../../logic/grimoire-view-logic';
import { HistoryLogic } from '../../logic/history-logic';
import { PhaseType } from '../../enums/phase-type';
import type { Player } from '../../models/player';
import { PlayerState } from '../../enums/player-state';
import { Popover } from '../controls/popover';
import { RoleType } from '../../enums/role-type';
import type { SeatPick } from '../../models/seat-pick';
import { SetupLogic } from '../../logic/setup-logic';
import type { SetupSelection } from '../../models/setup-selection';
import clockRing from '../../assets/clock-ring.svg';
import { palette } from '../../tokens.stylex';
import { useMemo } from 'react';

interface Props {
	game: Game;
	selectedPlayerID: string | null;
	highlightedPlayerIDs?: string[];
	setupSelection: SetupSelection | null;
	onSetupSelectionChange: (selection: SetupSelection | null) => void;
	onChange: (game: Game) => void;
	onPlayerSelected: (id: string | null) => void;
	// Shows only names
	privacy?: boolean;
	// The gears and timer gauge are only drawn when this is given
	timer?: DayTimer;
	// Only the Storyteller's own grimoire can be turned, not a copy shown to a player
	turnable?: boolean;
	// When it's shown to a player, their seat goes at the bottom, as they see the table
	viewerID?: string | null;
	// While a nomination or vote is running, seat taps go to it rather than selecting the player
	dayAction?: DayAction | null;
	onDayActionChange?: (action: DayAction | null) => void;
	// Ink can be drawn on the circle when this is true; Apple Pencil always draws, a finger only in ink mode
	inkable?: boolean;
	// A seat tapped from the keyboard, by typing its number; n changes with each request
	tapRequest?: { index: number, n: number } | null;
	// The phase tint behind the circle, if any
	tint?: 'night' | 'day' | null;
	// Holding a seat for a moment opens its quick actions
	onSeatLongPress?: (player: Player, x: number, y: number) => void;
	// While a player's night choice is being made, seat taps pick players for it
	seatPick?: SeatPick | null;
	// The view selector is only shown when these are provided
	view?: GrimoireView;
	onViewChange?: (view: GrimoireView) => void;
	// Tapping the bluffs or Fabled / Loric corner opens its sheet; the corners can't be tapped without this
	onCornerClick?: (corner: 'bluffs' | 'fabled') => void;
	// The past phases the look-back button offers, oldest first; it's only shown when there are some
	lookBackPhases?: LookBackPhase[];
	// The phase being looked back at; null for now
	lookBackKey?: string | null;
	onLookBackChange?: (key: string | null) => void;
}

// A phase the grimoire can be shown as it stood at
export interface LookBackPhase {
	key: string;
	label: string;
	type: PhaseType;
}

const rotateClockRing = stylex.keyframes({
	from: { transform: 'rotate(-5.625deg)' },
	to: { transform: 'rotate(354.375deg)' }
});

const styles = stylex.create({
	grimoirePanel: {
		position: 'relative',
		isolation: 'isolate',
		height: '100%',
		width: '100%',
		borderRadius: '24px',
		backgroundColor: palette.background,
		color: palette.text
	},
	// The phase tint: a sky behind the circle that fades between night and day over a second and a half
	sky: {
		position: 'absolute',
		inset: 0,
		zIndex: -1,
		borderRadius: '24px',
		pointerEvents: 'none',
		opacity: 0,
		transition: {
			'default': 'opacity 1500ms ease-in-out',
			'@media (prefers-reduced-motion: reduce)': 'none'
		}
	},
	night: {
		backgroundImage: `radial-gradient(circle at 50% 40%, color-mix(in srgb, #3a4f9e 26%, ${palette.background}), color-mix(in srgb, #0b1238 42%, ${palette.background}))`
	},
	day: {
		backgroundImage: `radial-gradient(circle at 50% 35%, color-mix(in srgb, #ffcf73 24%, ${palette.background}), color-mix(in srgb, #e9d2ae 14%, ${palette.background}))`
	},
	skyShown: {
		opacity: 1
	},
	// The circle has the whole panel, bar a thin margin; the corners and the controls float over the space it leaves.
	// The padding comes off the container's content box, so the circle below sizes itself to what's left
	circleArea: {
		position: 'absolute',
		inset: 0,
		overflow: 'hidden',
		display: 'grid',
		placeItems: 'center',
		padding: '10px',
		containerType: 'size'
	},
	// As large as the panel allows
	playerCircle: {
		position: 'relative',
		width: 'min(100cqw, 100cqh)',
		aspectRatio: '1 / 1'
	},
	artwork: {
		position: 'absolute',
		left: '26%', // The middle of the seat ring, as in seat-ring.tsx
		top: '26%',
		width: '48%',
		height: '48%',
		pointerEvents: 'none',
		transform: 'rotate(-5.625deg)',
		animationName: {
			'default': rotateClockRing,
			'@media (prefers-reduced-motion: reduce)': 'none'
		},
		animationDuration: '600s',
		animationTimingFunction: 'linear',
		animationIterationCount: 'infinite'
	},
	// The bottom row, mirroring the top: the lens and look-back buttons at the left, the circle's own controls at the right
	bottom: {
		position: 'absolute',
		// Over the seat ring's own layers (its svg, seat labels and ink), but under a dragged reminder's ghost
		zIndex: 5,
		right: 0,
		bottom: 0,
		left: 0,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		gap: '8px',
		padding: '12px',
		// Only the controls themselves take taps; the rest of the row is the circle's
		pointerEvents: 'none'
	},
	bottomGroup: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		minWidth: 0,
		pointerEvents: 'auto'
	},
	menu: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		gap: '2px',
		minWidth: '140px',
		maxHeight: '50vh',
		overflowY: 'auto'
	},
	// The top row: bluffs at the left, Fabled and Loric at the right.
	// The side columns are the same width, so neither corner can grow across the other
	top: {
		position: 'absolute',
		zIndex: 5,
		top: 0,
		right: 0,
		left: 0,
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 196px) minmax(0, 1fr) minmax(0, 196px)',
		alignItems: 'start',
		gap: '8px',
		padding: '12px',
		// As with the bottom row, the gaps belong to the circle underneath
		pointerEvents: 'none'
	},
	corner: {
		appearance: 'none',
		pointerEvents: 'auto',
		margin: '-6px',
		padding: '6px',
		borderWidth: 0,
		borderRadius: '12px',
		backgroundColor: 'transparent',
		fontFamily: 'inherit',
		textAlign: 'inherit',
		justifySelf: 'start',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		gap: '4px',
		minWidth: 0
	},
	cornerClickable: {
		cursor: 'pointer',
		backgroundColor: {
			'default': 'transparent',
			':hover': { 'default': null, '@media (hover: hover)': `color-mix(in srgb, ${palette.controlFace} 70%, transparent)` },
			':active': palette.controlFace
		},
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		}
	},
	cornerEnd: {
		alignItems: 'flex-end',
		justifySelf: 'end'
	},
	cornerTokens: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '6px',
		margin: 0,
		padding: 0,
		listStyle: 'none'
	},
	cornerTokensEnd: {
		justifyContent: 'flex-end'
	},
	cornerToken: {
		width: '60px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '3px'
	},
	cornerDisc: {
		width: '38px',
		height: '38px',
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		color: palette.text,
		fontSize: '14px',
		fontWeight: '700',
		letterSpacing: '-0.02em'
	},
	cornerName: {
		width: '100%',
		fontSize: '11px',
		lineHeight: 1.15,
		textAlign: 'center',
		color: palette.text,
		overflow: 'hidden',
		display: '-webkit-box',
		WebkitLineClamp: 2,
		WebkitBoxOrient: 'vertical',
		overflowWrap: 'break-word'
	}
});

// An icon for each lens; 'characters' is the grimoire as it is, so it keeps the lens button's own icon
const lensIcons: Record<GrimoireView, typeof Glasses> = {
	characters: Glasses,
	alignment: Users,
	role: Shapes,
	drunk: HeartPulse,
	alive: Skull,
	votes: Vote
};

const phaseIcon = (type: PhaseType) => (type === PhaseType.Night ? Moon : (type === PhaseType.Day ? Sun : ClipboardList));

export const GrimoirePanel = (props: Props) => {
	const monograms = useMemo(() => GrimoireViewLogic.getMonograms(props.game), [ props.game ]);
	const getMonogram = (id: string, name: string) => monograms.get(id) ?? CharacterLogic.getMonogram(name);

	const onPlayerClicked = (player: Player) => {
		if (props.seatPick) {
			props.seatPick.onPick(player.id);
			return;
		}

		if (props.dayAction && props.onDayActionChange) {
			const tapped = DayLogic.tapSeat(props.game, props.dayAction, player.id);
			if (tapped.game !== props.game) {
				props.onChange(tapped.game);
			}
			props.onDayActionChange(tapped.action);
			return;
		}

		const result = SetupLogic.selectSeat(props.game, props.setupSelection, player);
		if (result) {
			props.onChange(result.game);
			if (result.clearSelection) {
				props.onSetupSelectionChange(null);
			}
			return;
		}

		props.onPlayerSelected(props.selectedPlayerID === player.id ? null : player.id);
	};

	// Typing a seat number does what tapping the seat would
	const onTapRequest = useEffectEvent(() => {
		const player = props.tapRequest ? props.game.players[ props.tapRequest.index ] : undefined;
		if (player) {
			onPlayerClicked(player);
		}
	});
	useEffect(() => onTapRequest(), [ props.tapRequest?.n ]);

	// The seats where clicking would do something with the current setup selection
	const targetPlayerIDs = SetupLogic.getTargetPlayerIDs(props.game, props.setupSelection);

	const view = props.privacy ? 'characters' : (props.view ?? 'characters');
	const spotlight = !props.privacy && ((props.highlightedPlayerIDs?.length ?? 0) > 0);

	// Reminders that can be dragged to another seat, by key; only on the live grimoire
	const movable = new Map<string, { ownerID: string, modifierID: string }>();
	const canMove = (props.turnable ?? false) && !props.privacy;

	const seats: Seat[] = props.game.players.map(player => {
		const reminders: SeatReminder[] = GameLogic.getModifiersOnPlayer(props.game, player)
			.map(pm => {
				const owner = pm.player.character;
				const key = `${pm.player.id}-${pm.modifier.id}`;
				if (canMove) {
					movable.set(key, { ownerID: pm.player.id, modifierID: pm.modifier.id });
				}
				return {
					movable: canMove,
					key: key,
					monogram: owner ? getMonogram(owner.id, owner.name) : CharacterLogic.getMonogram(pm.player.name),
					role: owner?.role ?? null,
					label: pm.modifier.label || pm.modifier.data.text
				};
			});
		const believed = GrimoireViewLogic.getBelieved(props.game, player);
		if (believed) {
			reminders.push({ movable: false, key: 'believed', monogram: getMonogram(believed.id, believed.name), role: believed.role, label: `Thinks ${believed.name}` });
		}

		const dayState = DayLogic.getSeatState(props.game, props.dayAction ?? null, player);
		const woken = props.highlightedPlayerIDs?.includes(player.id) ?? false;

		return {
			id: player.id,
			name: player.name,
			character: player.character ? { name: player.character.name, monogram: getMonogram(player.character.id, player.character.name), role: player.character.role } : null,
			dead: player.state !== PlayerState.Alive,
			ghostVote: player.state === PlayerState.DeadWithGhostVote,
			reminders: reminders,
			badge: GrimoireViewLogic.getBadge(props.game, player, view),
			selected: player.id === props.selectedPlayerID,
			highlighted: woken || dayState.picked,
			target: targetPlayerIDs.includes(player.id) || (props.seatPick?.pickedIDs.includes(player.id) ?? false),
			// A spotlight: while players are being woken, everyone else dims
			dimmed: !dayState.available || (props.seatPick ? !props.seatPick.availableIDs.includes(player.id) : (spotlight && !woken)),
			hand: dayState.hand
		};
	});

	// The lens menu, opened from the button at the bottom left
	const [ lensOpen, setLensOpen ] = useState(false);
	const closeLens = useCallback(() => setLensOpen(false), []);
	const lensView = GrimoireViewLogic.views.find(v => v.id === view) ?? GrimoireViewLogic.views[ 0 ];
	const lensOn = view !== 'characters';
	// The look-back menu, opened from the button beside it
	const [ lookBackOpen, setLookBackOpen ] = useState(false);
	const closeLookBack = useCallback(() => setLookBackOpen(false), []);
	const lookBackPhases = props.lookBackPhases ?? [];
	const lookBack = lookBackPhases.find(p => p.key === props.lookBackKey) ?? null;
	const canLookBack = !!props.onLookBackChange && (lookBackPhases.length > 0);
	// Neither can be left open behind a hidden grimoire
	useEffect(() => {
		if (props.privacy) {
			setLensOpen(false);
			setLookBackOpen(false);
		}
	}, [ props.privacy ]);

	const [ fingerInk, setFingerInk ] = useState(false);
	const strokes = HistoryLogic.getInk(props.game, props.game.phase);
	const inkable = (props.inkable ?? false) && !props.privacy;

	const link = DayLogic.getLink(props.game, props.dayAction ?? null);
	const indexOf = (id: string) => props.game.players.findIndex(p => p.id === id);

	const viewerIndex = props.viewerID ? props.game.players.findIndex(p => p.id === props.viewerID) : -1;
	const topSeat = viewerIndex >= 0 ? (viewerIndex + Math.round(props.game.players.length / 2)) % props.game.players.length : (props.game.topSeat ?? 0);
	// Kept between 0 and the number of seats, so 'is this seat at the top?' is a simple comparison
	const onTurn = (seat: number) => props.onChange({ ...props.game, topSeat: ((seat % props.game.players.length) + props.game.players.length) % props.game.players.length });
	const turnable = props.turnable ?? false;

	// Bluffs and any Fabled or Loric sit in the top corners; like characters, they're hidden while the grimoire is
	const bluffs = props.privacy ? [] : props.game.bluffs;
	const others = props.privacy ? [] : props.game.otherCharacters;
	const othersLabel = others.every(c => c.role === RoleType.Fabled) ? 'Fabled' : (others.every(c => c.role === RoleType.Loric) ? 'Loric' : 'Fabled & Loric');

	const getCorner = (corner: 'bluffs' | 'fabled', label: string, characters: Character[], end: boolean) => {
		if (characters.length === 0) {
			return <div />;
		}
		const tokens = characters.map(c => (
			<span key={c.id} {...stylex.props(styles.cornerToken)}>
				<span
					aria-hidden='true'
					{...stylex.props(styles.cornerDisc)}
					style={{ backgroundColor: ColourLogic.tint(ColourLogic.roleColour(c.role), 18), boxShadow: `inset 0 0 0 2px ${ColourLogic.roleColour(c.role)}` }}
				>
					{getMonogram(c.id, c.name)}
				</span>
				<span {...stylex.props(styles.cornerName)}>{c.name}</span>
			</span>
		));
		const content = <span {...stylex.props(styles.cornerTokens, end && styles.cornerTokensEnd)}>{tokens}</span>;
		const description = `${label}: ${characters.map(c => c.name).join(', ')}`;
		if (props.onCornerClick) {
			return (
				<button
					type='button'
					aria-label={description}
					{...stylex.props(styles.corner, styles.cornerClickable, end && styles.cornerEnd)}
					onClick={e => {
						e.stopPropagation();
						props.onCornerClick?.(corner);
					}}
				>
					{content}
				</button>
			);
		}
		return <div role='group' aria-label={description} {...stylex.props(styles.corner, end && styles.cornerEnd)}>{content}</div>;
	};
	const hasCorners = (bluffs.length > 0) || (others.length > 0);

	return (
		<div {...stylex.props(styles.grimoirePanel)} onClick={() => props.onPlayerSelected(null)}>
			<div aria-hidden='true' {...stylex.props(styles.sky, styles.night, (props.tint === 'night') && styles.skyShown)} />
			<div aria-hidden='true' {...stylex.props(styles.sky, styles.day, (props.tint === 'day') && styles.skyShown)} />
			{
				hasCorners ?
					<div {...stylex.props(styles.top)}>
						{getCorner('bluffs', 'Bluffs', bluffs, false)}
						<div />
						{getCorner('fabled', othersLabel, others, true)}
					</div>
					: null
			}
			<div {...stylex.props(styles.circleArea)}>
				<div {...stylex.props(styles.playerCircle)}>
					<SeatRing
						seats={seats}
						topSeat={topSeat}
						privacy={props.privacy}
						centre={
							props.timer ?
								<>
									<ClockMechanism />
									<img src={clockRing} alt='' {...stylex.props(styles.artwork)} />
									<GrimoireCentre timer={props.timer} />
								</>
								: null
						}
						link={link ? { from: indexOf(link.fromID), to: indexOf(link.toID) } : null}
						onSeatClick={index => onPlayerClicked(props.game.players[ index ])}
						onTurn={turnable ? onTurn : undefined}
						onSeatLongPress={props.onSeatLongPress && !props.privacy ? (index, x, y) => props.onSeatLongPress?.(props.game.players[ index ], x, y) : undefined}
						onMoveReminder={canMove
							? (key, from, to) => {
								const found = movable.get(key);
								const source = props.game.players[ from ];
								const target = props.game.players[ to ];
								if (found && source && target) {
									const moved = GameLogic.placeModifier(GameLogic.removeModifier(props.game, found.ownerID, found.modifierID, source.id), found.ownerID, found.modifierID, target.id);
									props.onChange(moved);
								}
							}
							: undefined}
						ink={{
							strokes: strokes,
							fingerInk: inkable && fingerInk,
							onStroke: inkable ? stroke => props.onChange(HistoryLogic.addInk(props.game, stroke)) : undefined
						}}
					/>
				</div>
			</div>
			{
				(turnable || props.onViewChange || canLookBack || inkable) && !props.privacy ?
					<div {...stylex.props(styles.bottom)} onClick={e => e.stopPropagation()}>
						<div {...stylex.props(styles.bottomGroup)}>
							{
								props.onViewChange ?
									<Popover
										open={lensOpen}
										label='Lens'
										anchor={
											<Button
												type={lensOn ? 'primary' : 'quiet'}
												icon={lensIcons[ view ]}
												label={lensOn ? lensView.label : ''}
												description={lensOn ? `The ${lensView.label} lens; tap for Info` : 'Choose a lens'}
												onClick={() => {
													// A tap while a lens is on puts the seats back to Info, rather than opening the menu again
													if (lensOn) {
														setLensOpen(false);
														props.onViewChange?.('characters');
													} else {
														setLensOpen(value => !value);
													}
												}}
											/>
										}
										onClose={closeLens}
									>
										<div {...stylex.props(styles.menu)}>
											{
												GrimoireViewLogic.views
													.filter(v => v.id !== 'characters')
													.map(v => (
														<Button
															key={v.id}
															type='quiet'
															icon={lensIcons[ v.id ]}
															label={v.label}
															block={true}
															alignStart={true}
															onClick={() => {
																setLensOpen(false);
																props.onViewChange?.(v.id);
															}}
														/>
													))
											}
										</div>
									</Popover>
									: null
							}
							{
								canLookBack ?
									<Popover
										open={lookBackOpen}
										label='Look back'
										anchor={
											<Button
												type={lookBack ? 'primary' : 'quiet'}
												icon={lookBack ? phaseIcon(lookBack.type) : History}
												label={lookBack ? lookBack.label : ''}
												description={lookBack ? `Looking back at ${lookBack.label}; tap for now` : 'Look back at a past phase'}
												onClick={() => {
													// As with the lens, a tap while looking back comes back to now
													if (lookBack) {
														setLookBackOpen(false);
														props.onLookBackChange?.(null);
													} else {
														setLookBackOpen(value => !value);
													}
												}}
											/>
										}
										onClose={closeLookBack}
									>
										<div {...stylex.props(styles.menu)}>
											{
												lookBackPhases.map(phase => (
													<Button
														key={phase.key}
														type='quiet'
														icon={phaseIcon(phase.type)}
														label={phase.label}
														block={true}
														alignStart={true}
														onClick={() => {
															setLookBackOpen(false);
															props.onLookBackChange?.(phase.key);
														}}
													/>
												))
											}
										</div>
									</Popover>
									: null
							}
						</div>
						<div {...stylex.props(styles.bottomGroup)}>
							{turnable ? <Button type='quiet' icon={RotateCcw} iconOnly={true} label='Turn the circle anticlockwise' disabled={props.game.players.length < 2} onClick={() => onTurn(topSeat + 1)} /> : null}
							{turnable ? <Button type='quiet' icon={RotateCw} iconOnly={true} label='Turn the circle clockwise' disabled={props.game.players.length < 2} onClick={() => onTurn(topSeat - 1)} /> : null}
							{
								inkable ?
									<>
										<Button
											type={fingerInk ? 'primary' : 'quiet'}
											icon={PenLine}
											iconOnly={true}
											label={fingerInk ? 'Stop drawing with a finger' : 'Draw with a finger (Apple Pencil always draws)'}
											onClick={() => setFingerInk(value => !value)}
										/>
										{strokes.length > 0 ? <Button type='quiet' icon={Eraser} iconOnly={true} label={'Clear this phase\'s ink'} onClick={() => props.onChange(HistoryLogic.clearInk(props.game))} /> : null}
									</>
									: null
							}
						</div>
					</div>
					: null
			}
		</div>
	);
};
