import * as stylex from '@stylexjs/stylex';
import { ChevronRight, Drama, type LucideIcon, Tags, UserPen } from 'lucide-react';
import { NightRail, type RailItem } from './night-rail';
import { Button } from '../../controls/button';
import { Callout } from '../../controls/callout';
import { CharacterPanel } from '../character-panel';
import { Chips } from '../../controls/chips';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import { Group } from '../../controls/group';
import { ModifierPanel } from '../modifier/modifier-panel';
import { PhaseLogic } from '../../../logic/phase-logic';
import { PhaseType } from '../../../enums/phase-type';
import { SeatingLogic } from '../../../logic/seating-logic';
import { SetupLogic } from '../../../logic/setup-logic';
import type { SetupSelection } from '../../../models/setup-selection';
import { Spacer } from '../../controls/spacer';
import { TargetOutline } from '../../controls/target-outline';
import { Text } from '../../controls/text';
import { TextBox } from '../../controls/textbox';
import { palette } from '../../../tokens.stylex';
import { useState } from 'react';

interface Props {
	game: Game;
	setupSelection: SetupSelection | null;
	onSetupSelectionChange: (selection: SetupSelection | null) => void;
	onChange: (game: Game) => void;
}

const styles = stylex.create({
	setup: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	},
	characters: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '5px'
	},
	// A modifier waiting to be placed on a seat during setup
	modifierCard: {
		padding: '10px 12px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '10px',
		backgroundColor: palette.controlFace
	}
});

type Step = 'names' | 'characters' | 'reminders';

const steps: { id: Step, title: string, icon: LucideIcon }[] = [
	{ id: 'names', title: 'Player Names', icon: UserPen },
	{ id: 'characters', title: 'Assign Characters', icon: Drama },
	{ id: 'reminders', title: 'Add Reminders', icon: Tags }
];

// Naming the players, seating the bag and placing setup reminders, as three steps on a rail; Begin Game is in the panel's footer
export const SetupSection = (props: Props) => {
	const players = props.game.players;
	const named = players.filter(p => !SetupLogic.isDefaultName(p.name)).length;
	const mods = SetupLogic.getSetupModifiers(props.game);
	const unplaced = SetupLogic.getUnplacedModifiers(props.game).length;

	const done: Record<Step, boolean> = {
		names: named === players.length,
		characters: props.game.bag.length === 0,
		reminders: (props.game.bag.length === 0) && SetupLogic.isSetupComplete(props.game)
	};

	// Opens on the first step that isn't done yet, then stays where the Storyteller puts it
	const [ step, setStep ] = useState<Step>(() => steps.find(s => !done[ s.id ])?.id ?? 'reminders');

	if (props.game.phase.type !== PhaseType.Setup) {
		return null;
	}

	const goTo = (id: Step) => {
		// A character or reminder picked on one step means nothing on another
		props.onSetupSelectionChange(null);
		setStep(id);
	};

	const details: Record<Step, string> = {
		names: done.names ? 'All named' : `${named} of ${players.length}`,
		characters: done.characters ? 'All seated' : `${props.game.bag.length} to seat`,
		reminders: done.reminders ? (mods.length > 0 ? 'All placed' : 'None needed') : (props.game.bag.length > 0 ? 'After seating' : `${unplaced} to place`)
	};

	const railItems: RailItem[] = steps.map(s => ({
		id: s.id,
		monogram: null,
		icon: s.icon,
		role: null,
		title: s.title,
		detail: details[ s.id ],
		complete: done[ s.id ]
	}));

	const next = steps[ steps.findIndex(s => s.id === step) + 1 ];
	const nextButton = next ? <Button type={done[ step ] ? 'primary' : 'default'} icon={ChevronRight} label={`Next: ${next.title}`} onClick={() => goTo(next.id)} /> : null;

	const getNames = () => {
		const duplicates = SetupLogic.getDuplicateNames(props.game);

		// Return moves on to the next seat clockwise, so names can be typed straight round the table
		const focusSeat = (index: number) => {
			const field = document.getElementById(`player-name-${index}`);
			if (field) {
				field.focus();
			} else if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		};

		return (
			<>
				<Text>Name the players in seating order, clockwise from seat 1. Return moves to the next seat.</Text>
				{
					players.map((player, index) => (
						<TextBox
							key={player.id}
							id={`player-name-${index}`}
							value={SetupLogic.isDefaultName(player.name) ? '' : player.name}
							placeholder={`Seat ${index + 1}`}
							maxLength={30}
							enterKeyHint={index < players.length - 1 ? 'next' : 'done'}
							onChange={name => props.onChange(PhaseLogic.setPlayerName(props.game, player.id, name.trim() === '' ? `Seat ${index + 1}` : name))}
							onEnter={() => focusSeat(index + 1)}
						/>
					))
				}
				{duplicates.map(name => <Callout key={name} type='warning'>More than one player is called {name}.</Callout>)}
			</>
		);
	};

	const getCharacters = () => {
		const seatingProblems = SeatingLogic.getProblems(props.game);
		const seatingGuided = (props.game.bag.length > 0) && (props.setupSelection?.type === 'character')
			&& (SeatingLogic.getSuggestedPlayerIDs(props.game, props.setupSelection.characterID) !== null);

		return (
			<>
				{
					seatingProblems.map(problem => (
						<Callout key={`${problem.character.id}-${problem.text}`} type='warning'>
							Seating can't be met: {problem.character.name}: {problem.text}
						</Callout>
					))
				}
				{
					props.game.bag.length > 0 ?
						<>
							<Text>Select a character, then select a player seat.</Text>
							<Button
								label='Assign remaining characters randomly'
								onClick={() => {
									props.onSetupSelectionChange(null);
									props.onChange(SeatingLogic.assignRandomly(props.game));
								}}
							/>
							{seatingGuided ? <Text type='dimmed'>Outlined seats keep the seating modifiers possible.</Text> : null}
							<div {...stylex.props(styles.characters)}>
								{props.game.bag.map(character => {
									const selected = props.setupSelection?.type === 'character'
										&& props.setupSelection.characterID === character.id;
									return (
										<TargetOutline
											key={character.id}
											clickable={true}
											outlined={selected}
											onClick={() => props.onSetupSelectionChange(selected
												? null
												: {
													type: 'character',
													characterID: character.id
												})}
										>
											<CharacterPanel character={character} compact={true} />
										</TargetOutline>
									);
								})}
							</div>
						</>
						:
						<Callout type='information'>Every character has a seat.</Callout>
				}
			</>
		);
	};

	const getReminders = () => {
		if (props.game.bag.length > 0) {
			return <Callout type='information'>Seat every character first: the reminders to place depend on who is in play.</Callout>;
		}
		if (mods.length === 0) {
			return <Callout type='information'>No reminders need placing for these characters.</Callout>;
		}
		return (
			<>
				<Text>Select a reminder, then select a player seat to assign or remove it.</Text>
				{mods.map(({ player: owner, modifier }) => {
					const selected = props.setupSelection?.type === 'modifier'
						&& props.setupSelection.playerID === owner.id
						&& props.setupSelection.modifierID === modifier.id;
					return (
						<div key={`${owner.id}-${modifier.id}`} {...stylex.props(styles.setup)}>
							<TargetOutline
								clickable={true}
								outlined={selected}
								onClick={() => props.onSetupSelectionChange(selected
									? null
									: {
										type: 'modifier',
										playerID: owner.id,
										modifierID: modifier.id
									})}
							>
								<div {...stylex.props(styles.modifierCard)}>
									<ModifierPanel modifier={modifier} owner={owner.name} game={props.game} display='summary' />
								</div>
							</TargetOutline>
							{
								GameLogic.getCharacterEffects(modifier).map(effect => (
									<Chips
										key={effect.id}
										options={GameLogic.getCharacterEffectOptions(props.game, effect.data.restrictions).map(c => ({ id: c.id, label: c.name }))}
										selectedIDs={effect.data.characterID ? [ effect.data.characterID ] : []}
										onToggle={id => props.onChange(GameLogic.setEffectCharacter(props.game, owner.id, modifier.id, effect.id, effect.data.characterID === id ? '' : id))}
									/>
								))
							}
						</div>
					);
				})}
			</>
		);
	};

	return (
		<div {...stylex.props(styles.setup)}>
			<Text type='h2'>Setup</Text>
			<NightRail label='Setup steps' fill={true} items={railItems} selectedID={step} onSelect={id => goTo(id as Step)} />
			<Group>
				<Spacer>
					<Text type='h3'>{steps.find(s => s.id === step)?.title}</Text>
					{step === 'names' ? getNames() : null}
					{step === 'characters' ? getCharacters() : null}
					{step === 'reminders' ? getReminders() : null}
					{nextButton}
				</Spacer>
			</Group>
		</div>
	);
};
