import * as stylex from '@stylexjs/stylex';
import { ChevronLeft, ChevronRight, Dices, type LucideIcon, Play, ScrollText, ShoppingBag, Users } from 'lucide-react';
import { NightRail, type RailItem } from '../panels/game/night-rail';
import { useMemo, useState } from 'react';
import { Button } from '../controls/button';
import { Callout } from '../controls/callout';
import type { Character } from '../../models/character';
import { CharacterLogic } from '../../logic/character-logic';
import { CharacterRow } from '../panels/character-row';
import { Chips } from '../controls/chips';
import { ColourLogic } from '../../logic/colour-logic';
import { ConfirmButton } from '../controls/confirm-button';
import { Divider } from '../controls/divider';
import { Expander } from '../controls/expander';
import { GameLogic } from '../../logic/game-logic';
import { JinxList } from '../panels/jinx-list';
import { ListPicker } from '../controls/list-picker';
import { ModifierPanel } from '../panels/modifier/modifier-panel';
import { RoleType } from '../../enums/role-type';
import type { Script } from '../../models/script';
import { ScriptLogic } from '../../logic/script-logic';
import { Segmented } from '../controls/segmented';
import { SetupLogic } from '../../logic/setup-logic';
import { Spacer } from '../controls/spacer';
import { Stepper } from '../controls/stepper';
import { Text } from '../controls/text';
import { Utility } from '../../utils/utility';
import { palette } from '../../tokens.stylex';

interface Props {
	setupInfo: { playerNames: string[], scriptID: string, otherCharacterIDs: string[] } | null;
	scripts: Script[];
	onStart: (players: number, script: Script, bagIDs: string[], bluffIDs: string[], otherCharacterIDs: string[]) => void;
	onCancel: () => void;
	// Starting replaces the saved game, so it asks first
	replacesGame: boolean;
}

type Step = 'players' | 'script' | 'bag';

const steps: { id: Step, title: string, icon: LucideIcon }[] = [
	{ id: 'players', title: 'Players', icon: Users },
	{ id: 'script', title: 'Script', icon: ScrollText },
	{ id: 'bag', title: 'Bag', icon: ShoppingBag }
];

const bagRoles = [ RoleType.Townsfolk, RoleType.Outsider, RoleType.Minion, RoleType.Demon ];

const styles = stylex.create({
	setupPage: {
		height: '100%',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		padding: '16px 20px 20px 20px',
		gap: '14px',
		backgroundColor: palette.background,
		color: palette.text
	},
	// The summary stays in view whichever step is showing
	header: {
		display: 'flex',
		alignItems: 'center',
		gap: '16px',
		padding: '10px 14px',
		borderRadius: '16px',
		backgroundColor: palette.controlFace
	},
	summary: {
		flex: '1 1 auto',
		minWidth: 0,
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: '8px 22px'
	},
	fact: {
		display: 'flex',
		flexDirection: 'column'
	},
	factLabel: {
		fontSize: '12px',
		color: palette.textDimmed
	},
	dots: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '4px',
		alignItems: 'center',
		minHeight: '16px'
	},
	dot: {
		width: '12px',
		height: '12px',
		borderRadius: '50%',
		borderWidth: '2px',
		borderStyle: 'solid'
	},
	// The three steps share out a rail of modest width, rather than stretching across the whole page
	steps: {
		width: '100%',
		maxWidth: '560px',
		margin: '0 auto'
	},
	body: {
		flex: '1 1 0',
		minHeight: 0,
		overflowY: 'auto'
	},
	centred: {
		maxWidth: '760px',
		margin: '0 auto',
		display: 'flex',
		flexDirection: 'column',
		gap: '16px'
	},
	columns: {
		height: '100%',
		display: 'flex',
		flexDirection: 'row',
		gap: '16px'
	},
	column: {
		flex: '1 1 0',
		minWidth: 0,
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: '12px',
		padding: '12px',
		borderRadius: '14px',
		backgroundColor: palette.backgroundDark
	},
	group: {
		display: 'flex',
		flexDirection: 'column',
		gap: '4px'
	},
	groupHeading: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px',
		padding: '0 10px'
	},
	groupTitle: {
		fontSize: '13px',
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: '0.06em',
		color: palette.textDimmed
	},
	error: {
		color: palette.textError
	},
	unavailable: {
		opacity: 0.45
	},
	split: {
		display: 'flex',
		gap: '18px',
		flexWrap: 'wrap'
	}
});

export const SetupPage = (props: Props) => {
	const setupInfo = props.setupInfo;
	const initialScript = setupInfo === null
		? null
		: props.scripts.find(s => s.id === setupInfo.scriptID) ?? null;
	const [ players, setPlayers ] = useState<number>(setupInfo?.playerNames.length ?? 8);
	const [ script, setScript ] = useState<Script | null>(() => initialScript ? Utility.copy(initialScript) : null);
	const [ bagIDs, setBagIDs ] = useState<string[]>([]);
	const [ bluffIDs, setBluffIDs ] = useState<string[]>([]);
	const [ otherIDs, setOtherIDs ] = useState<string[]>(setupInfo?.otherCharacterIDs ?? []);
	// Re-racking keeps the players and script, so it starts on the bag
	const [ step, setStep ] = useState<Step>(initialScript ? 'bag' : 'players');
	const [ pot, setPot ] = useState<'bag' | 'bluffs'>('bag');

	// While re-racking with the script found, the player count and script are fixed
	const fixed = (setupInfo !== null) && (initialScript !== null);
	const counts = GameLogic.getRoleCounts(players, bagIDs.map(CharacterLogic.getCharacter));
	const scriptCharacters = useMemo(() => script ? ScriptLogic.getCharacters(script) : [], [ script ]);
	const monograms = useMemo(() => CharacterLogic.getMonograms(scriptCharacters), [ scriptCharacters ]);
	// Teensyville games have no bluffs, so there's nothing to add them to
	const bluffCount = SetupLogic.getBluffCount(players);
	const addTo = bluffCount > 0 ? pot : 'bag';

	const onSelectPlayers = (value: number) => {
		setPlayers(value);
		if ((script !== null) && !SetupLogic.isScriptSuitable(script, value)) {
			setScript(null);
			setBagIDs([]);
			setBluffIDs([]);
		}
	};

	const onSelectScript = (id: string) => {
		const s = props.scripts.find(s => s.id === id);
		setScript(s || null);
		setBagIDs([]);
		setBluffIDs([]);
		if (s) {
			setStep('bag');
		}
	};

	// A role has room while fewer of its characters are in the bag than it needs; bluffs are good characters, up to three
	const hasRoom = (c: Character) => addTo === 'bag'
		? SetupLogic.getSelectedCharacters(scriptCharacters, bagIDs, c.role).length < counts.counts[ c.role ]
		: SetupLogic.bluffRoles.includes(c.role) && (bluffIDs.length < bluffCount);

	const onAdd = (c: Character) => {
		if (!hasRoom(c)) {
			return;
		}
		if (addTo === 'bag') {
			setBagIDs(ids => SetupLogic.addToBag(ids, c.id));
		} else {
			setBluffIDs(ids => SetupLogic.addToBluffs(players, ids, c.id));
		}
	};

	const onRemove = (c: Character) => {
		setBagIDs(ids => Utility.remove(ids, c.id));
		setBluffIDs(ids => Utility.remove(ids, c.id));
	};

	// A dot per slot, filled in the role's colour as characters go in; extras beyond the slots show as errors
	const getDots = (filled: number, total: number, role: RoleType | null) => {
		const colour = role ? ColourLogic.roleColour(role) : palette.textDimmed;
		const count = Math.max(total, filled);
		return (
			<span role='img' {...stylex.props(styles.dots)} aria-label={`${filled} of ${total}`}>
				{
					Array.from({ length: count }, (_, i) => (
						<span
							key={i}
							{...stylex.props(styles.dot)}
							style={{ borderColor: i < total ? colour : palette.textError, backgroundColor: i < filled ? (i < total ? colour : palette.textError) : 'transparent' }}
						/>
					))
				}
			</span>
		);
	};

	const getRow = (c: Character, action: 'add' | 'included', onClick?: () => void) => (
		<CharacterRow key={c.id} character={c} monogram={monograms.get(c.id) ?? CharacterLogic.getMonogram(c.name)} action={onClick ? action : null} onClick={onClick} />
	);

	const getSummary = () => (
		<div {...stylex.props(styles.summary)}>
			{
				bagRoles.map(r => (
					<div key={r} {...stylex.props(styles.fact)}>
						<span {...stylex.props(styles.factLabel)}>{CharacterLogic.getPlural(r)}</span>
						{getDots(SetupLogic.getSelectedCharacters(scriptCharacters, bagIDs, r).length, counts.counts[ r ], r)}
					</div>
				))
			}
			{
				bluffCount > 0 ?
					<div {...stylex.props(styles.fact)}>
						<span {...stylex.props(styles.factLabel)}>Bluffs</span>
						{getDots(bluffIDs.length, bluffCount, null)}
					</div>
					: null
			}
		</div>
	);

	const getPlayersStep = () => (
		<div {...stylex.props(styles.centred)}>
			{
				setupInfo ?
					<Callout>Re-racking for {setupInfo.playerNames.join(', ')}.</Callout>
					: null
			}
			{
				fixed ?
					null
					:
					<>
						<Text type='h2'>How many players?</Text>
						<Stepper label='Players' value={players} min={5} max={15} onChange={onSelectPlayers} />
						<div {...stylex.props(styles.split)}>
							{bagRoles.map(r => <Text key={r}>{CharacterLogic.getPlural(r)}: {GameLogic.getBaseRoleCounts(players)[ r ]}</Text>)}
						</div>
						<Text type='dimmed'>You name the players and seat them once the game starts, so names can go round the table as people sit down.</Text>
						<div>
							<Button type='primary' icon={ChevronRight} label='Next: script' onClick={() => setStep('script')} />
						</div>
					</>
			}
		</div>
	);

	const getScriptStep = () => (
		<div {...stylex.props(styles.centred)}>
			{
				fixed ?
					<Callout>Re-racking keeps the script: {script?.name}.</Callout>
					:
					<>
						<Text type='h2'>Which script?</Text>
						<ListPicker
							layout='grid'
							options={
								SetupLogic.getScriptsForPlayers(props.scripts, players)
									.map(s => ({
										id: s.id,
										label: (
											<Spacer>
												<Text>{s.name}</Text>
												<Text type='dimmed'>{s.author}</Text>
												<Text type='dimmed'>{s.type}</Text>
											</Spacer>
										)
									}))
							}
							selectedID={script ? script.id : null}
							onChange={onSelectScript}
						/>
						<div>
							<Button type='quiet' icon={ChevronLeft} label='Back: players' onClick={() => setStep('players')} />
						</div>
					</>
			}
		</div>
	);

	const getBagStep = () => {
		if (!script) {
			return <div {...stylex.props(styles.centred)}><Callout>Choose a script first.</Callout></div>;
		}

		return (
			<div {...stylex.props(styles.columns)}>
				<div {...stylex.props(styles.column)}>
					<div {...stylex.props(styles.groupHeading)}>
						<Text type='h3'>Characters</Text>
						{
							bluffCount > 0 ?
								<Segmented
									label='Add to'
									options={[ { id: 'bag', label: 'Add to bag' }, { id: 'bluffs', label: 'Add to bluffs' } ]}
									selectedID={pot}
									onChange={id => setPot(id as 'bag' | 'bluffs')}
								/>
								: null
						}
					</div>
					{
						bagRoles.map(r => {
							const list = SetupLogic.getUnselectedCharacters(scriptCharacters, r, bagIDs, bluffIDs);
							if (list.length === 0) {
								return null;
							}
							return (
								<section key={r} {...stylex.props(styles.group)}>
									<div {...stylex.props(styles.groupHeading)}><span {...stylex.props(styles.groupTitle)}>{CharacterLogic.getPlural(r)}</span></div>
									{
										list.map(c => hasRoom(c) ?
											getRow(c, 'add', () => onAdd(c))
											: <div key={c.id} {...stylex.props(styles.unavailable)}>{getRow(c, 'add')}</div>)
									}
								</section>
							);
						})
					}
				</div>
				<div {...stylex.props(styles.column)}>
					<div {...stylex.props(styles.groupHeading)}>
						<Text type='h3'>Chosen</Text>
						<Button
							icon={Dices}
							label='Fill the rest randomly'
							disabled={(bagIDs.length >= players) && (bluffIDs.length >= bluffCount)}
							onClick={() => {
								const filled = SetupLogic.fillBag(players, scriptCharacters, bagIDs, bluffIDs);
								setBagIDs(filled.bagIDs);
								setBluffIDs(filled.bluffIDs);
							}}
						/>
					</div>
					{counts.modifiers.map(m => <Callout key={`${m.characterID}-${m.modifier.id}`}><ModifierPanel modifier={m.modifier} owner={CharacterLogic.getCharacter(m.characterID).name} /></Callout>)}
					<JinxList
						characters={[
							...SetupLogic.getSelectedCharacters(scriptCharacters, [ ...bagIDs, ...bluffIDs ]),
							...SetupLogic.getSelectedCharacters(CharacterLogic.getFabledAndLoric(), otherIDs)
						]}
					/>
					{
						bagRoles.map(r => {
							const count = counts.counts[ r ];
							const list = SetupLogic.getSelectedCharacters(scriptCharacters, bagIDs, r);
							if ((count === 0) && (list.length === 0)) {
								return null;
							}
							const over = SetupLogic.isRoleOverfull(scriptCharacters, bagIDs, r, count);
							return (
								<section key={r} {...stylex.props(styles.group)}>
									<div {...stylex.props(styles.groupHeading)}>
										<span {...stylex.props(styles.groupTitle, over && styles.error)}>{CharacterLogic.getPlural(r)}: {list.length} of {count}</span>
										{getDots(list.length, count, r)}
									</div>
									{list.map(c => getRow(c, 'included', () => onRemove(c)))}
								</section>
							);
						})
					}
					{
						bluffCount > 0 ?
							<section {...stylex.props(styles.group)}>
								<div {...stylex.props(styles.groupHeading)}>
									<span {...stylex.props(styles.groupTitle)}>Bluffs: {bluffIDs.length} of {bluffCount}</span>
									{getDots(bluffIDs.length, bluffCount, null)}
								</div>
								{SetupLogic.getSelectedCharacters(scriptCharacters, bluffIDs).map(c => getRow(c, 'included', () => onRemove(c)))}
							</section>
							: null
					}
					{/* Most games use no Fabled or Loric, so they're tucked away; a re-rack that carries some over starts open */}
					<Divider />
					<Expander label='Fabled and Loric' secondary={otherIDs.length > 0 ? `${otherIDs.length} chosen` : undefined} startOpen={otherIDs.length > 0}>
						<Chips
							options={CharacterLogic.getFabledAndLoric().map(c => ({ id: c.id, label: c.name }))}
							selectedIDs={otherIDs}
							onToggle={id => setOtherIDs(ids => Utility.toggle(ids, id))}
						/>
					</Expander>
				</div>
			</div>
		);
	};

	const canStart = (script !== null) && (bagIDs.length === players);
	const start = () => props.onStart(players, script!, bagIDs, bluffIDs, otherIDs);

	// The rail shows each step's choice so far, ticking it off once it's made
	const done: Record<Step, boolean> = {
		players: fixed || (script !== null),
		script: script !== null,
		bag: canStart
	};
	const details: Record<Step, string> = {
		players: `${players} players`,
		script: script ? script.name : 'Not chosen',
		bag: script ? `${bagIDs.length} of ${players}` : 'After script'
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

	return (
		<div {...stylex.props(styles.setupPage)}>
			<div {...stylex.props(styles.header)}>
				<Text type='h1'>New Game</Text>
				{getSummary()}
				<Button label='Cancel' onClick={props.onCancel} />
				{
					props.replacesGame ?
						<ConfirmButton
							type='primary'
							icon={Play}
							label='Start'
							confirmLabel='Replace it'
							message='There is a game in progress. Starting this one replaces it.'
							disabled={!canStart}
							onConfirm={start}
						/>
						:
						<Button type='primary' icon={Play} label='Start' disabled={!canStart} onClick={start} />
				}
			</div>
			<div {...stylex.props(styles.steps)}>
				<NightRail label='Setup steps' fill={true} items={railItems} selectedID={step} onSelect={id => setStep(id as Step)} />
			</div>
			<div {...stylex.props(styles.body)}>
				{step === 'players' ? getPlayersStep() : null}
				{step === 'script' ? getScriptStep() : null}
				{step === 'bag' ? getBagStep() : null}
			</div>
		</div>
	);
};
