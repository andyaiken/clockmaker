import * as stylex from '@stylexjs/stylex';
import { BookOpen, CircleHelp, Play, Plus, Settings } from 'lucide-react';
import { MIN_SCREEN_HEIGHT, MIN_SCREEN_WIDTH, useScreenFit } from '../../hooks/use-screen-fit';
import { Button } from '../controls/button';
import { Callout } from '../controls/callout';
import type { Game } from '../../models/game';
import { GameLogic } from '../../logic/game-logic';
import { PhaseLogic } from '../../logic/phase-logic';
import { PlayerState } from '../../enums/player-state';
import { SeatRing } from '../panels/seat-ring';
import { SettingsPanel } from '../panels/settings-panel';
import { Sheet } from '../controls/sheet';
import { Text } from '../controls/text';
import clockRing from '../../assets/clock-ring.svg';
import { palette } from '../../tokens.stylex';
import { useState } from 'react';

interface Props {
	game: Game | null;
	onSetPage: (page: string) => void;
}

const styles = stylex.create({
	landingPage: {
		height: '100%',
		width: '100%',
		overflow: 'hidden',
		padding: '40px',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '60px',
		backgroundColor: palette.background,
		color: palette.text
	},
	side: {
		display: 'flex',
		flexDirection: 'column',
		gap: '28px',
		width: '320px'
	},
	brand: {
		display: 'flex',
		alignItems: 'center',
		gap: '14px'
	},
	logo: {
		width: '56px',
		height: '56px'
	},
	title: {
		fontSize: '40px',
		fontWeight: '700',
		letterSpacing: '-0.01em'
	},
	actions: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	},
	setting: {
		display: 'flex',
		flexDirection: 'column',
		gap: '6px'
	},
	// The saved game, with starting another under it
	gameColumn: {
		width: 'min(460px, 45vw)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		gap: '14px'
	},
	// The saved game, ready to carry on with one tap
	card: {
		appearance: 'none',
		margin: 0,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		gap: '14px',
		padding: '20px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '22px',
		backgroundColor: {
			'default': palette.controlFace,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		color: palette.text,
		fontFamily: 'inherit',
		textAlign: 'left',
		cursor: 'pointer',
		boxShadow: '0 10px 30px rgb(0 0 0 / 0.08)',
		outline: {
			'default': 'none',
			':focus-visible': `3px solid ${palette.controlBorderHighlight}`
		},
		transform: {
			'default': null,
			':active': 'scale(0.99)'
		}
	},
	thumbnail: {
		position: 'relative',
		width: '100%',
		aspectRatio: '1 / 1',
		pointerEvents: 'none'
	},
	ring: {
		position: 'absolute',
		left: '26%',
		top: '26%',
		width: '48%',
		height: '48%'
	},
	cardText: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px'
	},
	phase: {
		fontSize: '24px',
		fontWeight: '700'
	},
	resume: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px',
		padding: '12px 18px',
		borderRadius: '12px',
		backgroundColor: palette.controlFacePrimary,
		color: palette.textLight,
		fontWeight: '600',
		fontSize: '16px'
	}
});

export const LandingPage = (props: Props) => {
	const game = props.game;
	const [ showSettings, setShowSettings ] = useState(false);
	const screenFit = useScreenFit();

	return (
		<div {...stylex.props(styles.landingPage)}>
			<div {...stylex.props(styles.side)}>
				<div {...stylex.props(styles.brand)}>
					<img src={clockRing} alt='' {...stylex.props(styles.logo)} />
					<span {...stylex.props(styles.title)}>Clockmaker</span>
				</div>
				{
					screenFit === 'portrait' ?
						<Callout type='warning'>Clockmaker is laid out for an screen held sideways. Turn it to landscape before you start.</Callout>
						:
						screenFit === 'small' ?
							<Callout type='warning'>This screen is smaller than Clockmaker is designed for ({MIN_SCREEN_WIDTH} × {MIN_SCREEN_HEIGHT} or larger), so some parts of a game may be cramped or cut off.</Callout>
							: null
				}
				<div {...stylex.props(styles.actions)}>
					{game === null ? <Button type='primary' icon={Plus} label='New Game' onClick={() => props.onSetPage('setup')} /> : null}
					<Button icon={BookOpen} label='Browse Scripts' onClick={() => props.onSetPage('browse')} />
				</div>
				<Button type='quiet' icon={Settings} label='Settings' onClick={() => setShowSettings(true)} />
				<Button type='quiet' icon={CircleHelp} label='Help' onClick={() => props.onSetPage('help')} />
			</div>
			{
				game ?
					<div {...stylex.props(styles.gameColumn)}>
						<button
							type='button'
							aria-label={`Resume the game: ${PhaseLogic.getLabel(game.phase)}, ${game.script.name}`}
							{...stylex.props(styles.card)}
							onClick={() => props.onSetPage('game')}
						>
							{/* Names only, so a glance at the home screen gives nothing away */}
							<div aria-hidden='true' {...stylex.props(styles.thumbnail)}>
								<SeatRing
									seats={game.players.map(p => ({
										id: p.id,
										name: p.name,
										character: null,
										dead: p.state !== PlayerState.Alive,
										ghostVote: false,
										reminders: [],
										badge: null,
										selected: false,
										target: false,
										highlighted: false
									}))}
									topSeat={game.topSeat ?? 0}
									privacy={true}
									centre={<img src={clockRing} alt='' {...stylex.props(styles.ring)} />}
								/>
							</div>
							<div {...stylex.props(styles.cardText)}>
								<div>
									<div {...stylex.props(styles.phase)}>{PhaseLogic.getLabel(game.phase)}</div>
									<Text type='dimmed'>{game.script.name} · {GameLogic.getAlivePlayers(game).length} of {game.players.length} alive</Text>
								</div>
								<span {...stylex.props(styles.resume)}><Play size={18} aria-hidden='true' />Resume</span>
							</div>
						</button>
						<Button icon={Plus} label='Start a new game' block={true} onClick={() => props.onSetPage('setup')} />
					</div>
					: null
			}
			{showSettings ? <Sheet title='Settings' onClose={() => setShowSettings(false)}><SettingsPanel /></Sheet> : null}
		</div>
	);
};
