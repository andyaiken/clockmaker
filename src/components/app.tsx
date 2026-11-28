import * as stylex from '@stylexjs/stylex';
import { type Appearance, SettingsContext } from './settings-context';
import { type ReactNode, useEffect, useState } from 'react';
import { type Settings, defaultSettings } from '../models/settings';
import { darkTheme, lightTheme } from '../themes';
import { BrowsePage } from './pages/browse-page';
import type { Game } from '../models/game';
import { GamePage } from './pages/game-page';
import { HelpPage } from './pages/help-page';
import { LandingPage } from './pages/landing-page';
import type { Script } from '../models/script';
import { ScriptLogic } from '../logic/script-logic';
import { SetupLogic } from '../logic/setup-logic';
import { SetupPage } from './pages/setup-page';
import { Toast } from './controls/toast';
import { usePersistentState } from '../hooks/use-persistent-state';
import { useUndoable } from '../hooks/use-undoable';

export type { Appearance } from './settings-context';

const styles = stylex.create({
	root: {
		height: '100%',
		width: '100%'
	}
});

export const App = () => {
	const [ page, setPage ] = useState<string>('landing');
	// Where Help goes back to
	const [ helpReturn, setHelpReturn ] = useState<string>('landing');
	const openHelp = () => {
		setHelpReturn(page);
		setPage('help');
	};
	const [ setupInfo, setSetupInfo ] = useState<{ playerNames: string[], scriptID: string, otherCharacterIDs: string[] } | null>(null);
	const [ game, setGame ] = usePersistentState<Game | null>('clockmaker-game', null);
	const [ homebrew, setHomebrew ] = usePersistentState<Script[]>('clockmaker-scripts', []);
	// 'auto' follows the iPad's appearance
	const [ appearance, setAppearance ] = usePersistentState<Appearance>('clockmaker-appearance', 'auto');
	const [ storedSettings, setSettings ] = usePersistentState<Settings>('clockmaker-settings', defaultSettings);
	// Settings saved before a setting existed get its default
	const settings = { ...defaultSettings, ...storedSettings };
	// Every change to the game goes through here, so it can be undone
	const history = useUndoable(game, setGame);

	// Undo brings back a game that was ended or re-racked, so go back to it
	const undo = () => {
		const restored = history.undo();
		if (restored && (page !== 'game')) {
			setSetupInfo(null);
			setPage('game');
		}
	};

	// Command-Z and Shift-Command-Z, except while typing, where they undo the text instead
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			const typing = !!target && ((target.tagName === 'INPUT') || (target.tagName === 'TEXTAREA') || target.isContentEditable);
			if (typing || !(e.metaKey || e.ctrlKey) || (e.key.toLowerCase() !== 'z') || (page !== 'game')) {
				return;
			}
			e.preventDefault();
			if (e.shiftKey) {
				history.redo();
			} else {
				history.undo();
			}
		};
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [ history, page ]);

	// Tells the browser which appearance to use for scrollbars and form controls
	useEffect(() => {
		document.documentElement.style.colorScheme = appearance === 'auto' ? 'light dark' : appearance;
	}, [ appearance ]);

	const onStart = (players: number, script: Script, bagIDs: string[], bluffIDs: string[], otherCharacterIDs: string[]) => {
		history.change(SetupLogic.createGame({ players, script, bagIDs, bluffIDs, otherCharacterIDs, playerNames: setupInfo?.playerNames ?? null }));
		setSetupInfo(null);
		setPage('game');
	};

	const onCancel = () => {
		setSetupInfo(null);
		setPage('landing');
	};

	const onEndGame = () => {
		history.change(null, 'The game has ended');
		setSetupInfo(null);
		setPage('landing');
	};

	const onReRack = () => {
		if (game === null) {
			return;
		}

		setSetupInfo(SetupLogic.getReRackInfo(game));
		history.change(null, 'The game was re-racked');
		setPage('setup');
	};

	const pages: { key: string, content: ReactNode }[] = [
		{ key: 'browse', content: <BrowsePage homebrew={homebrew} onHomebrewChange={setHomebrew} onCancel={onCancel} /> },
		{ key: 'game', content: <GamePage game={game} onChange={history.change} onCancel={onCancel} onEndGame={onEndGame} onReRack={onReRack} onHelp={openHelp} /> },
		{ key: 'landing', content: <LandingPage game={game} onSetPage={id => id === 'help' ? openHelp() : setPage(id)} /> },
		{ key: 'help', content: <HelpPage onBack={() => setPage(helpReturn)} /> },
		{ key: 'setup', content: <SetupPage setupInfo={setupInfo} scripts={ScriptLogic.getScripts(homebrew)} onStart={onStart} onCancel={onCancel} replacesGame={game !== null} /> }
	];

	const currentPage = pages.find(p => p.key === page);
	return (
		<SettingsContext.Provider value={{ settings, appearance, onSettingsChange: setSettings, onAppearanceChange: setAppearance }}>
			<div {...stylex.props(styles.root, (appearance === 'light') && lightTheme, (appearance === 'dark') && darkTheme)}>
				{currentPage ? currentPage.content : null}
				{history.toast ? <Toast key={history.toast.id} text={history.toast.text} onUndo={undo} onDismiss={history.dismissToast} /> : null}
			</div>
		</SettingsContext.Provider>
	);
};
