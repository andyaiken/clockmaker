import { type Settings, defaultSettings } from '../models/settings';
import { createContext, useContext } from 'react';

export type Appearance = 'auto' | 'light' | 'dark';

export interface SettingsContextValue {
	settings: Settings;
	appearance: Appearance;
	onSettingsChange: (settings: Settings) => void;
	onAppearanceChange: (appearance: Appearance) => void;
}

// Settings reach every screen without being passed down through each component
export const SettingsContext = createContext<SettingsContextValue>({
	settings: defaultSettings,
	appearance: 'auto',
	onSettingsChange: () => null,
	onAppearanceChange: () => null
});

export const useSettings = () => useContext(SettingsContext);
