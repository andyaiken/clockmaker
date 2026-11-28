// The app's own preferences, kept on this iPad
export interface Settings {
	// A night or day tint behind the circle, so the phase is obvious from across the table
	phaseTint: boolean;
	// A soft bell at dusk and dawn
	chimes: boolean;
	// Reveals start with 'Hand the iPad to …' and end with a cover, so the Storyteller never has to look away
	handOver: boolean;
}

export const defaultSettings: Settings = {
	phaseTint: true,
	chimes: false,
	handOver: false
};
