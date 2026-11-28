import * as stylex from '@stylexjs/stylex';
import { SIZE, polar, sector } from '../seat-ring';
import type { Game } from '../../../models/game';
import { palette } from '../../../tokens.stylex';

interface Props {
	game: Game;
	// The seats to light up
	litIDs: string[];
	// The player looking, whose seat is marked 'You' and drawn at the bottom, as they see the table
	viewerID: string | null;
}

const R_IN = 250;
const R_OUT = 490;

const styles = stylex.create({
	map: {
		width: 'min(70vh, 80vw)',
		height: 'min(70vh, 80vw)'
	},
	seat: {
		fill: palette.controlFace,
		stroke: palette.background,
		strokeWidth: 6
	},
	lit: {
		fill: palette.controlFacePrimary
	},
	you: {
		stroke: palette.text,
		strokeWidth: 10
	},
	name: {
		fill: palette.textDimmed,
		fontSize: '30px',
		fontWeight: 600
	},
	litName: {
		fill: palette.textLight,
		fontSize: '40px',
		fontWeight: 700
	},
	youLabel: {
		fill: palette.text,
		fontSize: '44px',
		fontWeight: 800
	}
});

// The table with some seats lit, turned so the viewer's own seat is at the bottom
export const RevealMap = (props: Props) => {
	const players = props.game.players;
	const count = Math.max(players.length, 1);
	const span = 360 / count;
	const viewerIndex = props.viewerID ? players.findIndex(p => p.id === props.viewerID) : -1;
	const angle = (index: number) => viewerIndex >= 0 ? ((index - viewerIndex) * span) + 180 : index * span;
	const lit = (id: string) => props.litIDs.includes(id);
	const names = players.filter(p => lit(p.id)).map(p => p.name).join(' and ');

	return (
		<svg {...stylex.props(styles.map)} viewBox={`0 0 ${SIZE} ${SIZE}`} role='img' aria-label={`A map of the table with ${names || 'nobody'} lit${viewerIndex >= 0 ? ', and your seat marked' : ''}`}>
			{
				players.map((p, index) => {
					const mid = angle(index);
					return (
						<path
							key={p.id}
							d={sector(R_IN, R_OUT, mid - (span / 2), mid + (span / 2))}
							{...stylex.props(styles.seat, lit(p.id) && styles.lit, (index === viewerIndex) && styles.you)}
						/>
					);
				})
			}
			{
				players.map((p, index) => {
					const at = polar((R_IN + R_OUT) / 2, angle(index));
					const isYou = index === viewerIndex;
					return (
						<text
							key={p.id}
							x={at.x}
							y={at.y}
							textAnchor='middle'
							dominantBaseline='central'
							{...stylex.props(styles.name, isYou && styles.youLabel, lit(p.id) && styles.litName)}
						>
							{isYou ? 'You' : p.name}
						</text>
					);
				})
			}
		</svg>
	);
};
