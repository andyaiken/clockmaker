import * as stylex from '@stylexjs/stylex';
import type { Reveal, RevealItem } from '../../../models/reveal';
import { useMemo, useState } from 'react';
import { AlignmentType } from '../../../enums/alignment-type';
import type { Character } from '../../../models/character';
import { CharacterLogic } from '../../../logic/character-logic';
import { ColourLogic } from '../../../logic/colour-logic';
import type { Game } from '../../../models/game';
import { GameLogic } from '../../../logic/game-logic';
import { GrimoirePanel } from './../grimoire-panel';
import { GrimoireViewLogic } from '../../../logic/grimoire-view-logic';
import { Hand } from 'lucide-react';
import { RevealMap } from './reveal-map';
import type { RoleType } from '../../../enums/role-type';
import { darkTheme } from '../../../themes';
import { palette } from '../../../tokens.stylex';
import { useSettings } from '../../settings-context';

interface Props {
	game: Game;
	reveal: Reveal;
	onClose: () => void;
}

const styles = stylex.create({
	// Always dark, so it never flashes a bright screen across a dark room
	overlay: {
		position: 'fixed',
		inset: 0,
		zIndex: 100,
		backgroundColor: '#000000',
		color: palette.text,
		display: 'flex',
		flexDirection: 'column',
		padding: '40px',
		overflowY: 'auto',
		cursor: 'pointer',
		userSelect: 'none'
	},
	content: {
		margin: 'auto',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		maxWidth: '100%',
		gap: '48px'
	},
	items: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
		alignItems: 'flex-start',
		gap: '64px',
		maxWidth: '100%'
	},
	item: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		maxWidth: '100%',
		gap: '28px'
	},
	title: {
		fontSize: '48px',
		fontWeight: '600',
		lineHeight: 1.15,
		textAlign: 'center',
		color: '#ffffff'
	},
	row: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
		maxWidth: '100%',
		gap: '40px'
	},
	// A character: big monogram, name, and (when it's theirs) their ability
	character: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '14px',
		maxWidth: '420px',
		textAlign: 'center'
	},
	disc: {
		width: '180px',
		height: '180px',
		borderRadius: '50%',
		display: 'grid',
		placeItems: 'center',
		fontSize: '72px',
		fontWeight: '700',
		letterSpacing: '-0.02em',
		color: '#ffffff'
	},
	discSmall: {
		width: '132px',
		height: '132px',
		fontSize: '52px'
	},
	characterName: {
		fontSize: '40px',
		fontWeight: '700',
		color: '#ffffff'
	},
	ability: {
		fontSize: '22px',
		lineHeight: 1.35,
		color: palette.textDimmed
	},
	// Team: a full field in the team's colour
	team: {
		minWidth: '420px',
		padding: '48px 64px',
		borderRadius: '28px',
		fontSize: '72px',
		fontWeight: '800',
		textAlign: 'center'
	},
	good: {
		backgroundColor: palette.roleTownsfolk,
		color: palette.onRoleTownsfolk
	},
	evil: {
		backgroundColor: palette.roleDemon,
		color: palette.onRoleDemon
	},
	role: {
		minWidth: '420px',
		padding: '40px 64px',
		borderRadius: '28px',
		fontSize: '64px',
		fontWeight: '800',
		textAlign: 'center'
	},
	// A number or yes / no: one huge figure
	huge: {
		fontSize: '220px',
		fontWeight: '800',
		lineHeight: 1,
		color: '#ffffff',
		fontVariantNumeric: 'tabular-nums'
	},
	names: {
		fontSize: '36px',
		fontWeight: '600',
		textAlign: 'center',
		color: '#ffffff'
	},
	grimoire: {
		width: 'min(90vw, 80vh)',
		height: 'min(90vw, 80vh)',
		borderRadius: '20px',
		overflow: 'hidden',
		pointerEvents: 'none'
	},
	hint: {
		fontSize: '15px',
		color: palette.textDimmed
	},
	// The hand-over cover, before and after the reveal
	cover: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '28px',
		color: '#ffffff',
		textAlign: 'center'
	},
	coverText: {
		fontSize: '52px',
		fontWeight: '700',
		lineHeight: 1.15
	}
});

// What a player is shown: big type for across a table, with nothing of the Storyteller's on screen
export const RevealOverlay = (props: Props) => {
	const { settings } = useSettings();
	const viewer = props.reveal.playerID ? GameLogic.findPlayer(props.game, props.reveal.playerID) : null;
	// With the hand-over screen on: a cover naming who to hand it to, then the reveal, then a cover to hand it back
	const [ stage, setStage ] = useState<'before' | 'reveal' | 'after'>(settings.handOver && viewer ? 'before' : 'reveal');
	const handOver = settings.handOver && !!viewer;

	const onTap = () => {
		if (stage === 'before') {
			setStage('reveal');
		} else if ((stage === 'reveal') && handOver) {
			setStage('after');
		} else {
			props.onClose();
		}
	};

	const getCover = (text: string, hint: string) => (
		<div {...stylex.props(styles.cover)}>
			<Hand size={72} aria-hidden='true' />
			<div {...stylex.props(styles.coverText)}>{text}</div>
			<div {...stylex.props(styles.hint)}>{hint}</div>
		</div>
	);

	const monograms = useMemo(() => GrimoireViewLogic.getMonograms(props.game), [ props.game ]);

	const getCharacter = (character: Character, small: boolean, showAbility: boolean) => {
		const colour = ColourLogic.roleColour(character.role);
		return (
			<div key={character.id} {...stylex.props(styles.character)}>
				<div {...stylex.props(styles.disc, small && styles.discSmall)} style={{ backgroundColor: ColourLogic.tint(colour, 35), boxShadow: `inset 0 0 0 6px ${colour}` }}>
					{monograms.get(character.id) ?? CharacterLogic.getMonogram(character.name)}
				</div>
				<div {...stylex.props(styles.characterName)}>{character.name}</div>
				{showAbility ? <div {...stylex.props(styles.ability)}>{character.ability}</div> : null}
			</div>
		);
	};

	const findCharacter = (id: string) => GameLogic.findCharacter(props.game, id);

	const getTeam = (alignment: AlignmentType) => (
		<div {...stylex.props(styles.team, alignment === AlignmentType.Good ? styles.good : styles.evil)}>{alignment}</div>
	);

	const getRole = (role: RoleType) => (
		<div {...stylex.props(styles.role)} style={{ backgroundColor: ColourLogic.roleColour(role), color: '#0b0b0d' }}>{role}</div>
	);

	const getContent = (item: RevealItem) => {
		const content = item.content;
		switch (content.type) {
			case 'none':
			case 'choose_players':
			case 'choose_characters':
			case 'choose_yes_no':
				return null;
			case 'you_are': {
				const character = content.characterID ? findCharacter(content.characterID) : null;
				return (
					<div {...stylex.props(styles.row)}>
						{character ? getCharacter(character, false, true) : null}
						{content.alignment ? getTeam(content.alignment) : null}
					</div>
				);
			}
			case 'characters':
				return (
					<div {...stylex.props(styles.row)}>
						{
							content.characterIDs
								.map(findCharacter)
								.filter(c => c !== null)
								.map(c => getCharacter(c, content.characterIDs.length > 2, false))
						}
					</div>
				);
			case 'players': {
				const players = GameLogic.getPlayers(props.game, content.playerIDs);
				return (
					<>
						<RevealMap game={props.game} litIDs={content.playerIDs} viewerID={props.reveal.playerID ?? null} />
						<div {...stylex.props(styles.names)}>{players.map(p => p.name).join(', ')}</div>
					</>
				);
			}
			case 'role':
				return getRole(content.role);
			case 'alignment':
				return getTeam(content.alignment);
			case 'number':
				return <div {...stylex.props(styles.huge)}>{content.value}</div>;
			case 'yes_no':
				return <div {...stylex.props(styles.huge)}>{content.value ? 'Yes' : 'No'}</div>;
			case 'grimoire':
				return (
					<div {...stylex.props(styles.grimoire)}>
						<GrimoirePanel
							game={props.game}
							selectedPlayerID={null}
							setupSelection={null}
							onSetupSelectionChange={() => null}
							onChange={() => null}
							onPlayerSelected={() => null}
							viewerID={props.reveal.playerID ?? null}
						/>
					</div>
				);
		}
	};

	return (
		<div
			role='dialog'
			aria-modal='true'
			aria-label='Shown to player'
			{...stylex.props(darkTheme, styles.overlay)}
			onClick={onTap}
		>
			{stage === 'before' ? <div {...stylex.props(styles.content)}>{getCover(`Hand the iPad to ${viewer?.name}`, 'Tap when they have it')}</div> : null}
			{stage === 'after' ? <div {...stylex.props(styles.content)}>{getCover('Hand the iPad back to the Storyteller', 'Tap to close')}</div> : null}
			{stage !== 'reveal'
				? null :
				<div {...stylex.props(styles.content)}>
					<div {...stylex.props(styles.items)}>
						{
							props.reveal.items.map(item => (
								<div key={item.id} {...stylex.props(styles.item)}>
									{item.text ? <div {...stylex.props(styles.title)}>{item.text}</div> : null}
									{getContent(item)}
								</div>
							))
						}
					</div>
					<div {...stylex.props(styles.hint)}>{handOver ? 'Tap when you\'re done' : 'Tap anywhere to close'}</div>
				</div>}
		</div>
	);
};
