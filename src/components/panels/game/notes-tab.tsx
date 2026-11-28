import * as stylex from '@stylexjs/stylex';
import type { Game } from '../../../models/game';
import { Multiline } from '../../controls/multiline';

interface Props {
	game: Game;
	onChange: (game: Game) => void;
}

const styles = stylex.create({
	notesTab: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	}
});

export const NotesTab = (props: Props) => {
	return (
		<div {...stylex.props(styles.notesTab)}>
			<Multiline
				value={props.game.notes}
				placeholder='Notes'
				onChange={notes => props.onChange({ ...props.game, notes: notes })}
			/>
		</div>
	);
};
