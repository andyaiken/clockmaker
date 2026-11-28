import * as stylex from '@stylexjs/stylex';
import type { Game, PhaseSnapshot } from '../../../models/game';
import { History, X } from 'lucide-react';
import { Button } from '../../controls/button';
import { Callout } from '../../controls/callout';
import { HistoryLogic } from '../../../logic/history-logic';
import { PhaseLogic } from '../../../logic/phase-logic';
import { PhaseType } from '../../../enums/phase-type';
import { Text } from '../../controls/text';
import { Utility } from '../../../utils/utility';
import { palette } from '../../../tokens.stylex';

interface Props {
	game: Game;
	snapshot: PhaseSnapshot;
	onClose: () => void;
}

const styles = stylex.create({
	panel: {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		borderRadius: '14px',
		backgroundColor: palette.backgroundDark
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		padding: '8px 8px 8px 14px',
		borderBottomWidth: '1px',
		borderBottomStyle: 'solid',
		borderBottomColor: palette.controlBorder
	},
	title: {
		flex: '1 1 auto'
	},
	body: {
		flex: '1 1 0',
		overflowY: 'auto',
		padding: '12px',
		display: 'flex',
		flexDirection: 'column',
		gap: '14px'
	},
	list: {
		margin: 0,
		padding: 0,
		listStyle: 'none',
		display: 'flex',
		flexDirection: 'column',
		gap: '6px'
	},
	entry: {
		display: 'flex',
		gap: '10px',
		alignItems: 'baseline',
		padding: '8px 10px',
		borderRadius: '10px',
		backgroundColor: palette.controlFace,
		fontSize: '15px'
	},
	time: {
		flex: '0 0 auto',
		fontSize: '12px',
		color: palette.textDimmed,
		fontVariantNumeric: 'tabular-nums'
	}
});

// A past phase: what happened in it, beside the circle as it stood when it ended
export const LookBackPanel = (props: Props) => {
	const phase = props.snapshot.phase;
	const events = HistoryLogic.getEvents(props.game, phase);
	const records = phase.type === PhaseType.Night ? HistoryLogic.getNightRecords(props.game, phase.number) : [];

	return (
		<div {...stylex.props(styles.panel)} role='region' aria-label={`Looking back at ${PhaseLogic.getLabel(phase)}`}>
			<div {...stylex.props(styles.header)}>
				<History size={22} aria-hidden='true' />
				<div {...stylex.props(styles.title)}>
					<Text type='h2'>{PhaseLogic.getLabel(phase)}</Text>
					<Text type='dimmed'>Looking back</Text>
				</div>
				<Button type='quiet' icon={X} iconOnly={true} label='Back to now' onClick={props.onClose} />
			</div>
			<div {...stylex.props(styles.body)}>
				<Callout>The circle shows how things stood at the end of {PhaseLogic.getLabel(phase)}. Nothing can be changed while looking back.</Callout>
				{
					records.length > 0 ?
						<>
							<Text type='h3'>Wakes</Text>
							<ul {...stylex.props(styles.list)}>
								{records.map((r, n) => <li key={n} {...stylex.props(styles.entry)}>{r}</li>)}
							</ul>
						</>
						: null
				}
				<Text type='h3'>Events</Text>
				{
					events.length > 0 ?
						<ul {...stylex.props(styles.list)}>
							{
								events.map(e => (
									<li key={e.id} {...stylex.props(styles.entry)}>
										<span {...stylex.props(styles.time)}>{Utility.formatTime(e.timestamp)}</span>
										<span>{e.text}</span>
									</li>
								))
							}
						</ul>
						: <Text type='dimmed'>Nothing was logged in this phase.</Text>
				}
				<div>
					<Button type='primary' label='Back to now' onClick={props.onClose} />
				</div>
			</div>
		</div>
	);
};
