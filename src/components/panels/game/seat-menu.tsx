import * as stylex from '@stylexjs/stylex';
import { ArrowUpToLine, HeartPulse, PanelRightOpen, Skull } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../controls/button';
import type { Game } from '../../../models/game';
import { PhaseLogic } from '../../../logic/phase-logic';
import type { Player } from '../../../models/player';
import { PlayerState } from '../../../enums/player-state';
import { Text } from '../../controls/text';
import { palette } from '../../../tokens.stylex';

interface Props {
	game: Game;
	player: Player;
	// Where the seat was held
	x: number;
	y: number;
	onChange: (game: Game) => void;
	onDetails: () => void;
	onClose: () => void;
}

const styles = stylex.create({
	menu: {
		position: 'fixed',
		zIndex: 100,
		minWidth: '220px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		gap: '2px',
		padding: '8px',
		borderRadius: '14px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		backgroundColor: palette.controlFace,
		boxShadow: '0 10px 30px rgb(0 0 0 / 0.22)',
		outline: 'none'
	},
	title: {
		padding: '4px 10px 6px 10px'
	}
});

// Quick actions for a seat, opened by holding it
export const SeatMenu = (props: Props) => {
	const ref = useRef<HTMLDivElement>(null);
	const [ position, setPosition ] = useState<{ left: number, top: number } | null>(null);
	const { onClose } = props;
	const alive = props.player.state === PlayerState.Alive;
	const index = props.game.players.indexOf(props.player);

	// Next to the finger, kept inside the window
	useLayoutEffect(() => {
		const rect = ref.current?.getBoundingClientRect();
		if (!rect) {
			return;
		}
		setPosition({
			left: Math.min(Math.max(12, props.x + 12), window.innerWidth - rect.width - 12),
			top: Math.min(Math.max(12, props.y - 20), window.innerHeight - rect.height - 12)
		});
		ref.current?.focus();
	}, [ props.x, props.y ]);

	useEffect(() => {
		const onPointerDown = (e: PointerEvent) => {
			if (!ref.current?.contains(e.target as Node)) {
				onClose();
			}
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};
		// Wait for the long press itself to finish before listening for taps elsewhere
		const timer = window.setTimeout(() => document.addEventListener('pointerdown', onPointerDown), 0);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			window.clearTimeout(timer);
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [ onClose ]);

	const act = (game: Game) => {
		props.onChange(game);
		props.onClose();
	};

	return (
		<div
			ref={ref}
			role='menu'
			aria-label={`${props.player.name}, seat ${index + 1}`}
			tabIndex={-1}
			{...stylex.props(styles.menu)}
			style={{ left: position?.left ?? props.x, top: position?.top ?? props.y, visibility: position ? 'visible' : 'hidden' }}
			onClick={e => e.stopPropagation()}
		>
			<div {...stylex.props(styles.title)}>
				<Text type='h3'>{props.player.name}</Text>
				<Text type='dimmed'>Seat {index + 1}{props.player.character ? ` · ${props.player.character.name}` : ''}</Text>
			</div>
			{
				alive ?
					<Button type='quiet' icon={Skull} label='Mark dead' block={true} alignStart={true} onClick={() => act(PhaseLogic.setPlayerState(props.game, props.player.id, PlayerState.DeadWithGhostVote))} />
					: <Button type='quiet' icon={HeartPulse} label='Mark alive' block={true} alignStart={true} onClick={() => act(PhaseLogic.setPlayerState(props.game, props.player.id, PlayerState.Alive))} />
			}
			<Button type='quiet' icon={ArrowUpToLine} label='Put at top' block={true} alignStart={true} disabled={index === (props.game.topSeat ?? 0)} onClick={() => act({ ...props.game, topSeat: index })} />
			<Button
				type='quiet'
				icon={PanelRightOpen}
				label='Details, reminders and reveals'
				block={true}
				alignStart={true}
				onClick={() => {
					props.onDetails();
					props.onClose();
				}}
			/>
		</div>
	);
};
