import * as stylex from '@stylexjs/stylex';
import { type Appearance, useSettings } from '../settings-context';
import { Segmented } from '../controls/segmented';
import { Text } from '../controls/text';
import { Toggle } from '../controls/toggle';

const styles = stylex.create({
	panel: {
		display: 'flex',
		flexDirection: 'column',
		gap: '14px'
	},
	group: {
		display: 'flex',
		flexDirection: 'column',
		gap: '6px'
	}
});

// Appearance, the phase tint, chimes and the hand-over screen
export const SettingsPanel = () => {
	const { settings, appearance, onSettingsChange, onAppearanceChange } = useSettings();

	return (
		<div {...stylex.props(styles.panel)}>
			<div {...stylex.props(styles.group)}>
				<Text type='dimmed'>Appearance</Text>
				<Segmented
					label='Appearance'
					block={true}
					options={[ { id: 'auto', label: 'Auto' }, { id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' } ]}
					selectedID={appearance}
					onChange={id => onAppearanceChange(id as Appearance)}
				/>
				<Text type='dimmed'>Auto follows the iPad.</Text>
			</div>
			<Toggle
				block={true}
				label='Phase tint'
				description='A cool night sky or a warm day behind the circle, so the phase is obvious from across the table'
				checked={settings.phaseTint}
				onChange={value => onSettingsChange({ ...settings, phaseTint: value })}
			/>
			<Toggle
				block={true}
				label='Chimes'
				description='A soft bell at dusk and dawn'
				checked={settings.chimes}
				onChange={value => onSettingsChange({ ...settings, chimes: value })}
			/>
			<Toggle
				block={true}
				label='Hand-over screen'
				description='Reveals start with ‘Hand the iPad to …’ and end with a cover, so you never have to look at the screen'
				checked={settings.handOver}
				onChange={value => onSettingsChange({ ...settings, handOver: value })}
			/>
		</div>
	);
};
