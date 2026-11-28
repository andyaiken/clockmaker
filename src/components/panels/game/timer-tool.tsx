import * as stylex from '@stylexjs/stylex';
import { type DayTimer, useDayTimerRemaining } from '../../../hooks/use-day-timer';
import { Play, Square, Timer } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Alarm } from '../../../logic/alarm';
import { Button } from '../../controls/button';
import { Popover } from '../../controls/popover';
import { Stepper } from '../../controls/stepper';
import { Text } from '../../controls/text';

interface Props {
	timer: DayTimer;
	disabled?: boolean;
	onTimerChange: (timer: DayTimer) => void;
}

const styles = stylex.create({
	content: {
		display: 'flex',
		flexDirection: 'column',
		gap: '12px'
	},
	row: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px'
	}
});

// The day timer, as a top bar tool: it shows the time left while running, and opens to set, start or stop it
export const TimerTool = (props: Props) => {
	const [ open, setOpen ] = useState(false);
	const close = useCallback(() => setOpen(false), []);
	const remaining = useDayTimerRemaining(props.timer);
	const seconds = Math.max(0, Math.ceil(remaining));
	const time = `${Math.floor(seconds / 60)}:${`${seconds % 60}`.padStart(2, '0')}`;
	const running = props.timer.endsAt !== null;

	return (
		<Popover
			open={open}
			label='Day timer'
			anchor={
				<Button
					type={running ? 'default' : 'quiet'}
					icon={Timer}
					label={running ? time : 'Timer'}
					disabled={props.disabled}
					onClick={() => setOpen(value => !value)}
				/>
			}
			onClose={close}
		>
			<div {...stylex.props(styles.content)}>
				<Text type='h3'>Day timer</Text>
				{
					running ?
						<div {...stylex.props(styles.row)}>
							<div role='timer' aria-live='off'><Text type='h1'>{time}</Text></div>
							<Button icon={Square} label='Stop' onClick={() => props.onTimerChange({ ...props.timer, endsAt: null })} />
						</div>
						:
						<>
							<div {...stylex.props(styles.row)}>
								<Stepper label='Minutes' value={props.timer.duration / 60} min={1} onChange={minutes => props.onTimerChange({ duration: minutes * 60, endsAt: null })} />
								<Text type='dimmed'>min</Text>
							</div>
							<Button
								type='primary'
								icon={Play}
								label='Start'
								onClick={() => {
									Alarm.prime();
									props.onTimerChange({ ...props.timer, endsAt: Date.now() + (props.timer.duration * 1000) });
									setOpen(false);
								}}
							/>
						</>
				}
			</div>
		</Popover>
	);
};
