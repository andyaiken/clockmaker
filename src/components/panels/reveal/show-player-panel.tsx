import * as stylex from '@stylexjs/stylex';
import type { ShowPlayer } from '../../../models/show-player';
import { Tag } from '../../controls/tag';
import { Text } from '../../controls/text';

interface Props {
	showPlayer: ShowPlayer;
}

const styles = stylex.create({
	showPlayerPanel: {
		display: 'flex',
		alignItems: 'center',
		gap: '5px'
	}
});

export const ShowPlayerPanel = (props: Props) => {
	return (
		<div {...stylex.props(styles.showPlayerPanel)}>
			<Text>{`"${props.showPlayer.text}"`}</Text>
			<Tag>{props.showPlayer.type}</Tag>
		</div>
	);
};
