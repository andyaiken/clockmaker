import * as stylex from '@stylexjs/stylex';
import { useCallback, useState } from 'react';
import { Button } from './button';
import type { LucideIcon } from 'lucide-react';
import { Popover } from './popover';
import { Text } from './text';

interface Props {
	label: string;
	// The button that asks; a danger button unless the action is the main one on the page, eg Start
	type?: 'primary' | 'danger';
	icon?: LucideIcon;
	// The label of the button that carries out the action; defaults to 'Confirm'
	confirmLabel?: string;
	// Explains what will happen; defaults to saying it can't be undone
	message?: string;
	disabled?: boolean;
	// Fills the width it's given, eg in a menu
	block?: boolean;
	onConfirm: () => void;
}

const styles = stylex.create({
	content: {
		display: 'flex',
		flexDirection: 'column',
		gap: '12px'
	},
	actions: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: '8px'
	}
});

// A button for actions that can't be undone: it asks in a popover before carrying the action out
export const ConfirmButton = (props: Props) => {
	const [ asking, setAsking ] = useState<boolean>(false);
	const close = useCallback(() => setAsking(false), []);
	const confirmLabel = props.confirmLabel ?? 'Confirm';

	const question = (
		<div {...stylex.props(styles.content)}>
			<Text>{props.message ?? 'This can\'t be undone.'}</Text>
			<div {...stylex.props(styles.actions)}>
				<Button type='quiet' label='Cancel' onClick={close} />
				<Button
					type='danger'
					label={confirmLabel}
					onClick={() => {
						setAsking(false);
						props.onConfirm();
					}}
				/>
			</div>
		</div>
	);

	return (
		<Popover
			open={asking}
			label={confirmLabel}
			anchor={<Button type={props.type ?? 'danger'} icon={props.icon} label={props.label} disabled={props.disabled} block={props.block} onClick={() => setAsking(value => !value)} />}
			onClose={close}
		>
			{question}
		</Popover>
	);
};
