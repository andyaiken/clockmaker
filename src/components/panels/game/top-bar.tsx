import * as stylex from '@stylexjs/stylex';
import { AddTravellerPanel, BluffsPanel, FabledLoricPanel } from './other-characters';
import { BookOpen, ChevronLeft, CircleHelp, ClipboardList, Ellipsis, Eye, EyeOff, Keyboard, Moon, NotebookPen, ScrollText, Settings, Share, Sparkles, Sun, UserPlus, VenetianMask } from 'lucide-react';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { Button } from '../../controls/button';
import { ConfirmButton } from '../../controls/confirm-button';
import type { DayTimer } from '../../../hooks/use-day-timer';
import { Divider } from '../../controls/divider';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import { HistoryLogic } from '../../../logic/history-logic';
import { HoldButton } from '../../controls/hold-button';
import { LogTab } from './log-tab';
import { NotesTab } from './notes-tab';
import { PhaseLogic } from '../../../logic/phase-logic';
import { PhaseType } from '../../../enums/phase-type';
import { Popover } from '../../controls/popover';
import { ScriptTab } from './script-tab';
import { SettingsPanel } from '../settings-panel';
import { Sheet } from '../../controls/sheet';
import { TimerTool } from './timer-tool';
import { Toolbar } from '../../controls/toolbar';
import { Utility } from '../../../utils/utility';
import { palette } from '../../../tokens.stylex';

interface Props {
	game: Game;
	privacy: boolean;
	timer: DayTimer;
	onTogglePrivacy: () => void;
	onTimerChange: (timer: DayTimer) => void;
	onChange: (game: Game) => void;
	onHome: () => void;
	onEndGame: () => void;
	onReRack: () => void;
	onShowShortcuts?: () => void;
	onHelp?: () => void;
	// Opens one of the other-character sheets from elsewhere, eg a grimoire corner; n changes with each request
	sheetRequest?: { id: 'bluffs' | 'fabled', n: number } | null;
}

type SheetID = 'script' | 'log' | 'notes' | 'bluffs' | 'fabled' | 'traveller' | 'settings';

const sheetTitles: Record<SheetID, string> = {
	script: 'Script',
	log: 'Log',
	notes: 'Notes',
	bluffs: 'Bluffs',
	fabled: 'Fabled and Loric',
	traveller: 'Add a Traveller',
	settings: 'Settings'
};

const styles = stylex.create({
	topBar: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
		minHeight: '56px'
	},
	phase: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: '10px',
		justifyContent: 'center',
		minHeight: '50px',
		padding: '4px 16px',
		borderRadius: '25px',
		backgroundColor: palette.controlFace,
		marginRight: 'auto'
	},
	phaseName: {
		fontSize: '18px',
		fontWeight: '700',
		lineHeight: 1.2
	},
	phaseDetail: {
		fontSize: '13px',
		color: palette.textDimmed
	},
	menu: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		gap: '2px',
		minWidth: '240px'
	},
	menuItem: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch'
	}
});

// The phase, and the tools needed now and then: the timer, the script, the log, notes, privacy and the menu
export const TopBar = (props: Props) => {
	const [ sheet, setSheet ] = useState<SheetID | null>(null);
	const [ menuOpen, setMenuOpen ] = useState(false);
	const closeSheet = useCallback(() => setSheet(null), []);
	const closeMenu = useCallback(() => setMenuOpen(false), []);

	const onSheetRequest = useEffectEvent(() => {
		if (props.sheetRequest) {
			setMenuOpen(false);
			setSheet(props.sheetRequest.id);
		}
	});
	useEffect(() => onSheetRequest(), [ props.sheetRequest?.n ]);

	const alive = GameLogic.getAlivePlayers(props.game).length;
	const isSetup = props.game.phase.type === PhaseType.Setup;

	const openSheet = (id: SheetID) => {
		setMenuOpen(false);
		setSheet(id);
	};

	const getSheetContent = (id: SheetID) => {
		switch (id) {
			case 'script':
				return <ScriptTab game={props.game} />;
			case 'log':
				return <LogTab game={props.game} />;
			case 'notes':
				return <NotesTab game={props.game} onChange={props.onChange} />;
			case 'bluffs':
				return <BluffsPanel game={props.game} onChange={props.onChange} />;
			case 'fabled':
				return <FabledLoricPanel game={props.game} onChange={props.onChange} />;
			case 'traveller':
				return <AddTravellerPanel game={props.game} onChange={props.onChange} />;
			case 'settings':
				return <SettingsPanel />;
		}
	};

	const menuItem = (id: SheetID, icon: typeof BookOpen) => (
		<div {...stylex.props(styles.menuItem)}>
			<Button type='quiet' icon={icon} label={sheetTitles[ id ]} block={true} alignStart={true} onClick={() => openSheet(id)} />
		</div>
	);

	return (
		<div {...stylex.props(styles.topBar)}>
			<Button type='quiet' icon={ChevronLeft} iconOnly={true} label='Home (the game is saved)' disabled={props.privacy} onClick={props.onHome} />
			<div {...stylex.props(styles.phase)}>
				{props.game.phase.type === PhaseType.Night ? <Moon size={22} aria-hidden='true' /> : (props.game.phase.type === PhaseType.Day ? <Sun size={22} aria-hidden='true' /> : <ClipboardList size={22} aria-hidden='true' />)}
				<div>
					<div {...stylex.props(styles.phaseName)}>{PhaseLogic.getLabel(props.game.phase)}</div>
					<div {...stylex.props(styles.phaseDetail)}>{props.game.script.name} · {alive} of {props.game.players.length} alive</div>
				</div>
			</div>
			<Toolbar label='Game tools'>
				{isSetup ? null : <TimerTool timer={props.timer} disabled={props.privacy} onTimerChange={props.onTimerChange} />}
				<Button type='quiet' icon={BookOpen} label='Script' disabled={props.privacy} onClick={() => openSheet('script')} />
				<Button type='quiet' icon={ScrollText} label='Log' disabled={props.privacy} onClick={() => openSheet('log')} />
				<Button type='quiet' icon={NotebookPen} label='Notes' disabled={props.privacy} onClick={() => openSheet('notes')} />
				{
					props.privacy ?
						<HoldButton icon={Eye} label='Hold to show' onHold={props.onTogglePrivacy} />
						:
						<Button icon={EyeOff} label='Hide' onClick={props.onTogglePrivacy} />
				}
				<Popover
					open={menuOpen}
					label='More'
					anchor={<Button type='quiet' icon={Ellipsis} iconOnly={true} label='More' disabled={props.privacy} onClick={() => setMenuOpen(value => !value)} />}
					onClose={closeMenu}
				>
					<div {...stylex.props(styles.menu)}>
						{menuItem('bluffs', VenetianMask)}
						{menuItem('fabled', Sparkles)}
						{menuItem('traveller', UserPlus)}
						<div {...stylex.props(styles.menuItem)}>
							<Button
								type='quiet'
								icon={Share}
								label='Share a game summary'
								block={true}
								alignStart={true}
								onClick={() => {
									setMenuOpen(false);
									void Utility.share(`${Utility.toFilename(props.game.script.name, 'game')}-summary.txt`, HistoryLogic.getSummary(props.game), 'text/plain');
								}}
							/>
						</div>
						{
							props.onShowShortcuts ?
								<div {...stylex.props(styles.menuItem)}>
									<Button
										type='quiet'
										icon={Keyboard}
										label='Keyboard shortcuts'
										block={true}
										alignStart={true}
										onClick={() => {
											setMenuOpen(false);
											props.onShowShortcuts?.();
										}}
									/>
								</div>
								: null
						}
						{menuItem('settings', Settings)}
						{
							props.onHelp ?
								<div {...stylex.props(styles.menuItem)}>
									<Button
										type='quiet'
										icon={CircleHelp}
										label='Help'
										block={true}
										alignStart={true}
										onClick={() => {
											setMenuOpen(false);
											props.onHelp?.();
										}}
									/>
								</div>
								: null
						}
						<Divider />
						<ConfirmButton block={true} label='Re-Rack' confirmLabel='Re-rack the game' message='This ends the game and sets up a new one with the same players and script.' onConfirm={props.onReRack} />
						<ConfirmButton block={true} label='End Game' confirmLabel='End the game' onConfirm={props.onEndGame} />
					</div>
				</Popover>
			</Toolbar>
			{sheet ? <Sheet title={sheetTitles[ sheet ]} onClose={closeSheet}>{getSheetContent(sheet)}</Sheet> : null}
		</div>
	);
};
