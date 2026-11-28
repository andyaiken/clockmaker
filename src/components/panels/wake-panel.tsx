import * as stylex from '@stylexjs/stylex';
import { type ReactNode, useState } from 'react';
import { AnswerLogic } from '../../logic/answer-logic';
import { Button } from '../controls/button';
import { Callout } from '../controls/callout';
import { CharacterLogic } from '../../logic/character-logic';
import { Chips } from '../controls/chips';
import { Divider } from '../controls/divider';
import { Expander } from '../controls/expander';
import type { Game } from '../../models/game';
import { Group } from '../controls/group';
import { ModifierPanel } from './modifier/modifier-panel';
import { NightLogic } from '../../logic/night-logic';
import { PhaseType } from '../../enums/phase-type';
import type { RevealItem } from '../../models/reveal';
import { RevealItemEditor } from './reveal/reveal-item-editor';
import { ShowPlayerType } from '../../enums/show-player-type';
import { Spacer } from '../controls/spacer';
import { Sparkles } from 'lucide-react';
import { Tag } from '../controls/tag';
import { Text } from '../controls/text';
import { Toggle } from '../controls/toggle';
import { Utility } from '../../utils/utility';
import type { Wake } from '../../logic/night-logic';
import { WarningLogic } from '../../logic/warning-logic';
import { palette } from '../../tokens.stylex';

interface Props {
	game: Game;
	wake: Wake;
	items: (RevealItem | null)[];
	onItemsChange: (items: (RevealItem | null)[]) => void;
	// Shows (and records) the steps at these indices
	onShow: (indices: number[]) => void;
	onIgnore: (indices: number[]) => void;
	onAnswerChange: (index: number, item: RevealItem) => void;
	onAnswerDone: (index: number, item: RevealItem) => void;
	onApplyOutcome: (index: number, playerIDs: string[]) => void;
}

const styles = stylex.create({
	wakePanel: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px',
		padding: '10px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		borderRadius: '5px',
		backgroundColor: palette.controlFace
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: '5px'
	},
	stage: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	},
	// The answer the app worked out, set apart from what the Storyteller is editing
	worked: {
		display: 'flex',
		flexDirection: 'column',
		gap: '6px',
		padding: '10px 12px',
		borderRadius: '10px',
		backgroundColor: `color-mix(in srgb, ${palette.ok} 10%, ${palette.controlFace})`
	},
	workedHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px'
	},
	workedValue: {
		fontSize: '22px',
		fontWeight: '700'
	},
	working: {
		margin: 0,
		paddingLeft: '18px',
		color: palette.textDimmed,
		fontSize: '14px'
	}
});

const ChoiceOutcome = (props: { game: Game; wake: Wake; index: number; chosenIDs: string[]; onApply: (ids: string[]) => void }) => {
	const [ selectedIDs, setSelectedIDs ] = useState(props.chosenIDs);
	const choice = NightLogic.getChoiceOutcome(props.game, props.wake, props.index);
	if (!choice) {
		return null;
	}

	const { outcome, modifier } = choice;
	const labels = NightLogic.getOutcomeLabels(outcome.action, modifier);
	const options = NightLogic.getOutcomeTargets(props.game, outcome.action).map(p => ({ id: p.id, label: p.name, badge: `${props.game.players.indexOf(p) + 1}` }));
	const selected = selectedIDs.filter(id => options.some(option => option.id === id));
	const valid = NightLogic.isOutcomeSelectionValid(modifier, selected);

	// Who the outcome applies to: the players chosen, as switches that start on, plus anyone else the Storyteller adds
	const shownIDs = [ ...props.chosenIDs, ...selected ].filter((id, n, all) => all.indexOf(id) === n && options.some(o => o.id === id));
	const others = options.filter(o => !shownIDs.includes(o.id));
	const verb = outcome.action === 'kill' ? 'Kill' : (outcome.action === 'revive' ? 'Revive' : `${modifier.label} on`);

	return (
		<Group>
			<Spacer>
				<Text type='h3'>{labels.title}</Text>
				{outcome.action === 'place' ? <ModifierPanel modifier={modifier} display='summary' /> : null}
				<Text type='dimmed'>Check abilities and protection before applying. Undoing the wake does not undo applied outcomes.</Text>
				{modifier.data.max !== null ? <Text type='dimmed'>Up to {modifier.data.max}.</Text> : null}
				{
					shownIDs.map(id => {
						const option = options.find(o => o.id === id);
						return option ?
							<Toggle
								key={id}
								block={true}
								label={`${verb} ${option.label}`}
								description={props.chosenIDs.includes(id) ? 'Their choice' : 'Added by you'}
								checked={selected.includes(id)}
								onChange={() => setSelectedIDs(Utility.toggle(selected, id))}
							/>
							: null;
					})
				}
				{
					others.length > 0 ?
						<Expander label='Someone else'>
							<Chips
								options={others}
								selectedIDs={[]}
								onToggle={id => setSelectedIDs([ ...selected, id ])}
							/>
						</Expander>
						: null
				}
				<Button
					type='primary'
					label={labels.button}
					disabled={!valid || props.game.phase.type !== PhaseType.Night}
					onClick={() => props.onApply(selected)}
				/>
			</Spacer>
		</Group>
	);
};

export const WakePanel = (props: Props) => {
	const stages = NightLogic.getStages(props.items);
	const allComplete = NightLogic.isWakeComplete(props.game, props.wake, props.items);
	const allShown = NightLogic.isWakeShown(props.game, props.wake, props.items);

	// Players picked in this wake who might register as something else (eg the Recluse as a Minion)
	const pickedIDs = NightLogic.getPickedPlayerIDs(props.items);

	// The true answer worked out from the grimoire, how it was reached, and any reason to give a different one
	const getWorkedAnswer = (index: number) => {
		const item = props.items[ index ];
		const answer = item ? AnswerLogic.workOut(props.game, props.wake, props.items, index) : null;
		if (!item || !answer) {
			return null;
		}

		const matches = AnswerLogic.matches(item, answer);
		const ownWarnings = props.wake.players.flatMap(p => WarningLogic.getWarnings(props.game, p));
		const otherCautions = answer.cautions.filter(c => !ownWarnings.includes(c));
		return (
			<div {...stylex.props(styles.worked)}>
				<div {...stylex.props(styles.workedHeader)}>
					<div>
						<Text type='dimmed'>Worked out from the grimoire</Text>
						<div {...stylex.props(styles.workedValue)}>{AnswerLogic.describeAnswer(answer, id => CharacterLogic.getCharacter(id).name)}</div>
					</div>
					{
						matches ?
							<Tag>Filled in</Tag>
							: <Button icon={Sparkles} label='Use this answer' onClick={() => props.onItemsChange(props.items.map((i, n) => (n === index) && i ? AnswerLogic.apply(i, answer) : i))} />
					}
				</div>
				<ul {...stylex.props(styles.working)}>
					{answer.working.map(w => <li key={w}>{w}</li>)}
				</ul>
				{
					// Warnings about the waking player are already shown at the top of the wake, so only point to them here
					ownWarnings.length > 0 ?
						<Text type='dimmed'>Not filled in automatically, because of the warning above.</Text>
						: null
				}
				{otherCautions.map(c => <Callout key={c} type='warning'>{c} You can give a different answer.</Callout>)}
			</div>
		);
	};

	const getStep = (index: number, actions: ReactNode) => {
		const step = props.wake.steps[ index ];
		const item = props.items[ index ];
		return (
			<Group key={step.id}>
				<Spacer>
					{step.note ? <Text type='h3'>{step.note}</Text> : null}
					{
						step.type === ShowPlayerType.StorytellerAction ?
							<Text>{step.data.action || step.text}</Text>
							: null
					}
					{
						item ?
							<RevealItemEditor
								game={props.game}
								item={item}
								ownerID={props.wake.playerID}
								part={NightLogic.isQuestion(item) ? 'prompt' : 'all'}
								onChange={updated => props.onItemsChange(props.items.map((i, n) => n === index ? updated : i))}
							/>
							: null
					}
					{getWorkedAnswer(index)}
					{actions}
				</Spacer>
			</Group>
		);
	};

	// Each stage is shown on its own, so the player can answer before the next part
	const getStage = (stage: number[], stageIndex: number) => {
		const shown = NightLogic.isShown(props.game, props.wake, stage);
		const started = NightLogic.isStarted(props.game, props.wake, stage);
		const complete = NightLogic.isComplete(props.game, props.wake, stage);
		const { hasAnythingToShow, questionIndex } = NightLogic.getStageInfo(props.items, stage);
		const question = questionIndex === null ? null : props.items[ questionIndex ];

		// The buttons act on the whole stage, so they sit at the end of its last step
		const actions = (
			<Spacer orientation='horizontal'>
				{
					hasAnythingToShow ?
						<>
							<Button type='primary' label={shown ? 'Show again' : 'Show'} onClick={() => props.onShow(stage)} />
							<Button label={started && !shown ? 'Ignored' : 'Ignore'} disabled={started && !shown} onClick={() => props.onIgnore(stage)} />
						</>
						: <Button label='Done' disabled={complete} onClick={() => props.onShow(stage)} />
				}
			</Spacer>
		);

		return (
			<div key={stageIndex} {...stylex.props(styles.stage)}>
				{stage.map((index, n) => getStep(index, n === stage.length - 1 ? actions : null))}
				{
					started && question && questionIndex !== null ?
						<Group>
							<Spacer>
								<RevealItemEditor
									game={props.game}
									item={question}
									ownerID={props.wake.playerID}
									part='answer'
									onChange={updated => props.onAnswerChange(questionIndex, updated)}
								/>
								{
									started && !shown && !NightLogic.hasAnswer(question) ?
										<Button label={complete ? 'Done' : 'Done (no answer)'} disabled={complete} onClick={() => props.onAnswerDone(questionIndex, question)} />
										:
										<Button label={complete ? 'Done' : 'Done recording answer'} disabled={complete || !NightLogic.isAnswerValid(question)} onClick={() => props.onAnswerDone(questionIndex, question)} />
								}
							</Spacer>
						</Group>
						: null
				}
				{
					complete && question?.content.type === 'choose_players' && question.content.playerIDs.length > 0 && questionIndex !== null ?
						<ChoiceOutcome
							key={`${questionIndex}-${JSON.stringify(question.content.playerIDs)}`}
							game={props.game}
							wake={props.wake}
							index={questionIndex}
							chosenIDs={question.content.playerIDs}
							onApply={ids => props.onApplyOutcome(questionIndex, ids)}
						/>
						: null
				}
			</div>
		);
	};

	return (
		<div {...stylex.props(styles.wakePanel)}>
			{
				props.wake.character ?
					<>
						<Text>{props.wake.character.name}: {props.wake.character.ability}</Text>
						<Divider />
					</>
					: null
			}
			<div {...stylex.props(styles.header)}>
				<Text type='h3'>{props.wake.title}: {props.wake.players.map(p => p.name).join(', ')}</Text>
				{allComplete ? <Tag>{allShown ? 'Shown' : 'Done'}</Tag> : null}
			</div>
			<Spacer>
				{
					props.wake.players
						.flatMap(player => {
							const list = WarningLogic.getWarnings(props.game, player);
							return props.wake.players.length > 1 ? list.map(w => `${player.name}: ${w}`) : list;
						})
						.map(w => <Callout key={w} type='warning'><Text>{w}</Text></Callout>)
				}
			</Spacer>
			{stages.map(getStage)}
			<Spacer>
				{
					WarningLogic.getRegistrationNotes(props.game, pickedIDs)
						.map((note, n) => <Callout key={n} type='information'><Text>{note}</Text></Callout>)
				}
			</Spacer>
		</div>
	);
};
