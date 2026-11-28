import * as stylex from '@stylexjs/stylex';
import { ChevronLeft, ChevronRight, Flame, Moon, Sun, Users } from 'lucide-react';
import { NIGHT_COMMAND_EVENT, type NightCommand } from '../../../hooks/use-shortcuts';
import { NightRail, type RailItem } from './night-rail';
import type { Reveal, RevealItem } from '../../../models/reveal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../controls/button';
import { Callout } from '../../controls/callout';
import type { Game } from '../../../models/game';
import { GrimoireViewLogic } from '../../../logic/grimoire-view-logic';
import { NightLogic } from '../../../logic/night-logic';
import { RevealLogic } from '../../../logic/reveal-logic';
import type { SeatPick } from '../../../models/seat-pick';
import { Text } from '../../controls/text';
import type { Wake } from '../../../logic/night-logic';
import { WakePanel } from '../wake-panel';
import { palette } from '../../../tokens.stylex';

export type NightDrafts = Record<string, (RevealItem | null)[]>;

interface Props {
	game: Game;
	drafts: NightDrafts;
	onDraftsChange: (drafts: NightDrafts) => void;
	onChange: (game: Game) => void;
	onShowReveal: (reveal: Reveal) => void;
	onHighlightPlayersChange: (playerIDs: string[]) => void;
	// A player's choice being made by tapping seats on the circle
	onSeatPickChange: (pick: SeatPick | null) => void;
}

const styles = stylex.create({
	nightTab: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	},
	// Back and Next stay in the same place however long the step is
	navigation: {
		position: 'sticky',
		bottom: '-10px',
		zIndex: 2,
		display: 'flex',
		gap: '8px',
		margin: '0 -10px -10px -10px',
		padding: '10px',
		backgroundColor: palette.backgroundDark,
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
		borderTopColor: palette.controlBorder
	}
});

export const NightTab = (props: Props) => {
	const [ selectedKey, setSelectedKey ] = useState<string | null>(null);

	const wakes = NightLogic.getWakes(props.game);
	const getItems = (wake: Wake) => props.drafts[ wake.key ] ?? NightLogic.createItems(props.game, wake);
	const isComplete = (wake: Wake) => NightLogic.isWakeComplete(props.game, wake, getItems(wake));

	// Until the Storyteller picks one, show the first wake that isn't done yet
	const selected = NightLogic.getSelectedWake(props.game, wakes, selectedKey, getItems);
	const selectedIndex = selected ? wakes.indexOf(selected) : -1;
	const playerIDsKey = JSON.stringify(selected?.players.map(player => player.id) ?? []);

	const { onHighlightPlayersChange, onSeatPickChange } = props;
	useEffect(() => {
		onHighlightPlayersChange(JSON.parse(playerIDsKey) as string[]);
		return () => onHighlightPlayersChange([]);
	}, [ playerIDsKey, onHighlightPlayersChange ]);

	// Choices are usually filled in after the prompt has been shown; keep the records of answered steps up to date
	const changeAnswer = (wake: Wake, items: (RevealItem | null)[], index: number, item: RevealItem) => {
		const updated = items.map((current, i) => i === index ? item : current);
		props.onDraftsChange({ ...props.drafts, [ wake.key ]: updated });
		props.onChange(NightLogic.recordAnswer(props.game, wake, updated, index));
	};

	// While the selected wake is waiting for a player's choice of players, it's made by tapping their seats
	const pick = (() => {
		if (!selected) {
			return null;
		}
		const items = getItems(selected);
		for (const stage of NightLogic.getStages(items)) {
			const { questionIndex } = NightLogic.getStageInfo(items, stage);
			const question = questionIndex === null ? null : items[ questionIndex ];
			if ((questionIndex !== null) && (question?.content.type === 'choose_players')
				&& NightLogic.isStarted(props.game, selected, stage) && !NightLogic.isComplete(props.game, selected, stage)) {
				const content = question.content;
				return {
					wake: selected,
					items: items,
					index: questionIndex,
					item: question,
					pickedIDs: content.playerIDs,
					availableIDs: RevealLogic.getChoosablePlayers(props.game, content.restrictions, selected.playerID).map(p => p.id),
					max: content.max
				};
			}
		}
		return null;
	})();

	// The latest handler, so the one given to the circle never goes stale
	const pickRef = useRef<(id: string) => void>(() => null);
	pickRef.current = (id: string) => {
		if (!pick || !pick.availableIDs.includes(id) || (pick.item.content.type !== 'choose_players')) {
			return;
		}
		const current = pick.item.content.playerIDs;
		let playerIDs: string[];
		if (current.includes(id)) {
			playerIDs = current.filter(p => p !== id);
		} else if (pick.max === 1) {
			playerIDs = [ id ];
		} else if (current.length < pick.max) {
			playerIDs = [ ...current, id ];
		} else {
			return;
		}
		changeAnswer(pick.wake, pick.items, pick.index, { ...pick.item, content: { ...pick.item.content, playerIDs: playerIDs } });
	};

	const pickKey = pick ? JSON.stringify([ pick.wake.key, pick.index, pick.pickedIDs, pick.availableIDs ]) : '';
	useEffect(() => {
		if (!pickKey) {
			onSeatPickChange(null);
			return;
		}
		const [ , , pickedIDs, availableIDs ] = JSON.parse(pickKey) as [ string, number, string[], string[] ];
		onSeatPickChange({ pickedIDs, availableIDs, onPick: id => pickRef.current(id) });
	}, [ pickKey, onSeatPickChange ]);

	useEffect(() => () => onSeatPickChange(null), [ onSeatPickChange ]);

	const monograms = useMemo(() => GrimoireViewLogic.getMonograms(props.game), [ props.game ]);
	const getRailItem = (w: Wake): RailItem => {
		const icons: Record<string, RailItem[ 'icon' ]> = { 'Dusk': Moon, 'Dawn': Sun, 'Minion info': Users, 'Demon info': Flame };
		return {
			id: w.key,
			monogram: w.character ? (monograms.get(w.character.id) ?? w.character.name.slice(0, 2)) : null,
			icon: w.character ? null : (icons[ w.title ] ?? Users),
			role: w.character?.role ?? null,
			title: w.title,
			detail: w.players.map(p => p.name).join(', '),
			complete: isComplete(w)
		};
	};

	// Shows (and records) the steps at these indices
	const showStage = (wake: Wake, items: (RevealItem | null)[], indices: number[]) => {
		const toShow = NightLogic.getItemsToShow(items, indices);
		if (toShow.length > 0) {
			// A group wake with only one player (eg the Demon's info) still has a viewer to orient maps to
			props.onShowReveal({ items: toShow, playerID: wake.playerID ?? (wake.players.length === 1 ? wake.players[ 0 ].id : null) });
		}
		props.onChange(NightLogic.recordShown(props.game, wake, items, indices));
	};

	const goTo = (offset: number) => {
		const target = wakes[ selectedIndex + offset ];
		if (target) {
			setSelectedKey(target.key);
		}
	};

	// Keyboard shortcuts: arrows step through the night, space shows the current step
	const commandRef = useRef<(command: NightCommand) => void>(() => null);
	commandRef.current = (command: NightCommand) => {
		if (command === 'next') {
			goTo(1);
		} else if (command === 'previous') {
			goTo(-1);
		} else if (selected) {
			const items = getItems(selected);
			const stage = NightLogic.getStages(items).find(st => !NightLogic.isComplete(props.game, selected, st));
			if (stage) {
				showStage(selected, items, stage);
			}
		}
	};
	useEffect(() => {
		const listener = (e: Event) => commandRef.current((e as CustomEvent<NightCommand>).detail);
		window.addEventListener(NIGHT_COMMAND_EVENT, listener);
		return () => window.removeEventListener(NIGHT_COMMAND_EVENT, listener);
	}, []);

	// A sideways swipe across the step moves back or on; the buttons stay for anyone who prefers them
	const swipe = useRef<{ x: number, y: number } | null>(null);

	const getWake = (wake: Wake) => {
		const items = getItems(wake);
		return (
			<WakePanel
				key={wake.key}
				game={props.game}
				wake={wake}
				items={items}
				onItemsChange={updated => {
					props.onDraftsChange({ ...props.drafts, [ wake.key ]: updated });
					// Choices are usually filled in after the prompt has been shown; keep the records of shown stages up to date
					const shownIndices = NightLogic.getShownIndices(props.game, wake, updated);
					if (shownIndices.length > 0) {
						props.onChange(NightLogic.recordShown(props.game, wake, updated, shownIndices));
					}
				}}
				onShow={indices => showStage(wake, items, indices)}
				onIgnore={indices => props.onChange(NightLogic.recordIgnored(props.game, wake, items, indices))}
				onAnswerChange={(index, item) => changeAnswer(wake, items, index, item)}
				onAnswerDone={(index, item) => {
					if (NightLogic.hasOutcomeToApply(wake, index, item)) {
						setSelectedKey(wake.key);
					}
					// Answers that depend on this choice (eg the Fortune Teller's yes or no) can now be worked out
					const answered = items.map((current, i) => i === index ? item : current);
					props.onDraftsChange({ ...props.drafts, [ wake.key ]: NightLogic.fillChosenAnswers(props.game, wake, answered, index) });
					props.onChange(NightLogic.completeAnswer(props.game, wake, item, index));
				}}
				onApplyOutcome={(index, playerIDs) => props.onChange(NightLogic.applyChoiceOutcome(props.game, wake, index, playerIDs))}
			/>
		);
	};

	return (
		<div {...stylex.props(styles.nightTab)}>
			<Text type='h2'>Night {NightLogic.getNightNumber(props.game)}</Text>
			{
				wakes.length === 0 ?
					<Callout type='information'>No-one is due to wake tonight.</Callout>
					:
					null
			}
			<NightRail
				items={wakes.map(getRailItem)}
				selectedID={selected?.key ?? null}
				onSelect={setSelectedKey}
			/>
			{pick ? <Callout type='information'>Tap the seats {pick.wake.players.map(p => p.name).join(', ')} chose{pick.max > 1 ? ` (up to ${pick.max})` : ''}; tap again to un-pick.</Callout> : null}
			<div
				onPointerDown={e => {
					swipe.current = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null;
				}}
				onPointerUp={e => {
					const start = swipe.current;
					swipe.current = null;
					if (!start) {
						return;
					}
					const dx = e.clientX - start.x;
					const dy = e.clientY - start.y;
					if ((Math.abs(dx) > 80) && (Math.abs(dy) < Math.abs(dx) / 2)) {
						goTo(dx < 0 ? 1 : -1);
					}
				}}
			>
				{selected ? getWake(selected) : null}
			</div>
			<div {...stylex.props(styles.navigation)}>
				<Button icon={ChevronLeft} label='Back' disabled={selectedIndex <= 0} onClick={() => goTo(-1)} />
				<Button
					type='primary'
					icon={ChevronRight}
					label='Next'
					disabled={(selectedIndex < 0) || (selectedIndex >= wakes.length - 1)}
					onClick={() => goTo(1)}
				/>
			</div>
		</div>
	);
};
