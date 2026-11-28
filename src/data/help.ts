// The Help page's content: every feature, grouped by what you're doing.
// Screenshots live in public/help/<screenshot>.jpg and are made by `npm run help:screenshots`;
// a topic whose screenshot is missing still reads fine without it.

export interface HelpTopic {
	id: string;
	title: string;
	// What it is and why it's there
	summary: string;
	// How to use it
	steps?: string[];
	// Things that are easy to miss
	tips?: string[];
	screenshot?: string;
}

export interface HelpSection {
	id: string;
	title: string;
	intro: string;
	topics: HelpTopic[];
}

export const HelpContent: HelpSection[] = [
	{
		id: 'start',
		title: 'Getting started',
		intro: 'Clockmaker runs an in-person game of Blood on the Clocktower from one iPad, and builds homebrew scripts.',
		topics: [
			{
				id: 'home',
				title: 'Home',
				summary: 'Home opens on your saved game, so carrying on is one tap. The thumbnail shows only names, so a glance at the screen gives nothing away.',
				steps: [
					'Tap the game card to resume.',
					'With no game in progress, tap New Game to set one up.',
					'Browse Scripts opens the script browser and editor.',
					'Settings changes the appearance and a few preferences.'
				],
				screenshot: 'home'
			},
			{
				id: 'settings',
				title: 'Settings',
				summary: 'Settings are kept on this iPad. Open them from Home, or from the ⋯ menu during a game.',
				steps: [
					'Appearance: Auto follows the iPad\'s light or dark mode; Light and Dark override it.',
					'Phase tint (on by default): a cool night sky or a warm day behind the circle, so the phase is obvious from across the table.',
					'Chimes (off by default): a soft bell at dusk and dawn.',
					'Hand-over screen (off by default): reveals start with "Hand the iPad to …" and end with a cover, so you never have to look at what a player is shown.'
				],
				screenshot: 'settings'
			},
			{
				id: 'ipad',
				title: 'On the iPad',
				summary: 'Add Clockmaker to the Home Screen from Safari\'s share menu and it runs full screen, in landscape.',
				tips: [
					'Once it has been opened, it works without Wi-Fi.',
					'While a game is open, the screen stays on.',
					'Your game is saved as you go; closing the app loses nothing.'
				]
			}
		]
	},
	{
		id: 'setup',
		title: 'Setting up a game',
		intro: 'Setup has three steps, with a summary across the top that\'s always in view: the player count, the script, and a row of dots for each role that fills as characters go in.',
		topics: [
			{
				id: 'setup-players',
				title: 'Players and script',
				summary: 'Choose how many are playing (5 to 15), then the script. Only scripts that suit that many players are offered.',
				tips: [
					'You name the players once the game starts, so names can go round the table as people sit down.',
					'Re-racking keeps the players and script, and starts straight on the bag.'
				],
				screenshot: 'setup-players'
			},
			{
				id: 'setup-bag',
				title: 'The bag',
				summary: 'Tap a character on the left to put it in the bag; tap one on the right to take it out. Roles that are full dim their remaining characters.',
				steps: [
					'Switch to "Add to bluffs" to choose the Demon\'s three bluffs (good characters only). Teensyville games (5 or 6 players) have no bluffs.',
					'"Fill the rest randomly" completes the bag and the bluffs.',
					'Characters that change the bag, like the Baron, change the rows of dots and say why.',
					'Open Fabled and Loric at the bottom right to add any to the game.',
					'Start is ready once the bag is full.'
				],
				screenshot: 'setup-bag'
			},
			{
				id: 'seating',
				title: 'Names and seats',
				summary: 'Once the game starts, the panel on the right walks through seating it in three steps: Player Names, Assign Characters and Add Reminders. Each gets a tick when it\'s done, and you can tap any step to go to it.',
				steps: [
					'Player Names: type each player\'s name in seat order, clockwise from seat 1. Return moves to the next seat.',
					'Assign Characters: tap a character, then a seat, to seat that character; or assign the rest randomly. Outlined seats keep seating rules possible.',
					'Add Reminders: tap a setup reminder (like the Washerwoman\'s Townsfolk), then the seat it belongs on. Some reminders also ask for a character.',
					'Begin Game, at the bottom of the panel, is ready once everything is placed.'
				],
				screenshot: 'seating'
			}
		]
	},
	{
		id: 'grimoire',
		title: 'The grimoire',
		intro: 'The circle is the grimoire: one slice per player around the brass gears.',
		topics: [
			{
				id: 'seats',
				title: 'Reading a seat',
				summary: 'From the rim inwards: the character\'s monogram, the player\'s name and character, then reminders. The role\'s colour runs along the outer edge.',
				tips: [
					'Monograms are worked out from the name: initials for two words (FT), the first two letters for one (Oj).',
					'Each reminder shows the monogram of the character that placed it. With many players, reminders shrink to dots; at most two show, and the rest are counted.',
					'Dead players go grey, with a skull, and a ghost while they still have a ghost vote.'
				],
				screenshot: 'grimoire'
			},
			{
				id: 'lenses',
				title: 'Lenses',
				summary: 'The row under the circle changes what the seats say. Lenses show only what\'s unusual, so it stands out.',
				steps: [
					'Info: characters and reminders.',
					'Team: evil players, and anyone who might register as the other team.',
					'Type: each player\'s character type.',
					'Health: only the drunk, the poisoned and those without their ability.',
					'Alive: only the dead.',
					'Votes: only ghost votes, spent votes and modified votes.'
				],
				screenshot: 'lens-health'
			},
			{
				id: 'inspector',
				title: 'A player\'s details',
				summary: 'Tap a seat to open everything about that player in the panel: their character, editing, reminders, death and showing them things.',
				steps: [
					'Edit: change their name, character, team or state, or move their seat.',
					'Reminders: see what\'s on them, remove one, or add one.',
					'Show to player: build a reveal for them.',
					'Close it with ✕ or Esc.'
				],
				screenshot: 'inspector'
			},
			{
				id: 'long-press',
				title: 'Quick actions',
				summary: 'Hold a seat for a moment for quick actions: mark them dead or alive, put them at the top, or open their details.',
				screenshot: 'seat-menu'
			},
			{
				id: 'drag-reminder',
				title: 'Moving reminders',
				summary: 'Drag a reminder from one seat to another to move it, for example when the Poisoner\'s choice changes.',
				tips: [ 'A tap on a reminder is a tap on its seat.' ]
			},
			{
				id: 'turning',
				title: 'Turning the circle',
				summary: 'Turn the circle so the player you\'re facing is at the top. Seat numbers and order don\'t change, only where seats are drawn.',
				steps: [
					'Drag round the ring with one finger, or twist with two; it snaps to a seat.',
					'Or use the ↺ and ↻ buttons beside the lenses, or the [ and ] keys.',
					'Or choose "Put at top" for a player.'
				],
				tips: [ 'The rotation is saved with the game.' ]
			},
			{
				id: 'ink',
				title: 'Ink',
				summary: 'Write on the circle with Apple Pencil: ring two players claiming the same role, or note who\'s gone quiet. Ink never changes the game.',
				steps: [
					'Apple Pencil always draws.',
					'To draw with a finger, turn on the pen button beside the lenses.',
					'The eraser clears this phase\'s ink.'
				],
				tips: [ 'Each phase starts with a clean circle; earlier ink shows when you look back. Ink turns with its seats.' ],
				screenshot: 'ink'
			},
			{
				id: 'privacy',
				title: 'Hiding the grimoire',
				summary: 'Hide lowers an opaque curtain: characters, reminders and the panel are covered, and only names show.',
				steps: [
					'Tap Hide in the top bar, or press P.',
					'To lift the curtain, press and hold "Hold to show", so it can\'t be lifted by accident.'
				],
				tips: [ 'The curtain comes down by itself whenever the app goes into the background, so opening the iPad at the table never shows the grimoire.' ],
				screenshot: 'privacy'
			},
			{
				id: 'look-back',
				title: 'Looking back',
				summary: 'Tap Look back in the top bar to bring out a strip above the circle that steps back through the game. Pick a phase to see the circle as it stood when it ended, with what happened, including what each wake was shown.',
				tips: [ 'Looking back is read-only. Tap Now to come back but keep the strip out, or tap Look back again, the ✕, or press Esc to put it away.' ],
				screenshot: 'look-back'
			}
		]
	},
	{
		id: 'night',
		title: 'Running the night',
		intro: 'At night the panel runs the night order, one wake at a time.',
		topics: [
			{
				id: 'night-rail',
				title: 'The night order',
				summary: 'The rail across the top shows each wake as a monogram, with a tick when it\'s done. The players being woken are outlined on the circle and everyone else dims.',
				steps: [
					'Back and Next step through the wakes; so do the arrow keys, or a sideways swipe across the step.',
					'Tap a wake on the rail to jump to it.',
					'End Night is always at the bottom of the panel.'
				],
				screenshot: 'night'
			},
			{
				id: 'night-steps',
				title: 'Showing, ignoring and answers',
				summary: 'Each step says what to show the player. Show opens it full screen for them; Ignore skips it. Space shows the current step.',
				steps: [
					'When a player chooses players, tap their choice on the circle (or use the list in the panel), then mark it done.',
					'Choices that act on the grimoire, like the Poisoner\'s, end with switches: "Poisoned on Esme" starts on. Apply them with the button.'
				],
				screenshot: 'night-choice'
			},
			{
				id: 'worked-answers',
				title: 'Worked-out answers',
				summary: 'Information steps arrive with the true answer worked out from the grimoire, and the working shown: the Empath\'s count, the Chef\'s pairs, the Fortune Teller\'s yes or no, and others.',
				tips: [
					'If the player is drunk or poisoned, or someone involved might register as something else, it says so and leaves the answer to you.',
					'You can always give a different answer.'
				],
				screenshot: 'night-answer'
			}
		]
	},
	{
		id: 'day',
		title: 'Running the day',
		intro: 'By day the panel handles nominations and votes, and the top bar has the day timer.',
		topics: [
			{
				id: 'nominate',
				title: 'Nominations',
				summary: 'Tap New nomination (or press N), then tap the nominator\'s seat and the nominee\'s seat. An arrow joins them; tap Start the vote.',
				tips: [
					'Seats that can\'t nominate or be nominated dim. Tap a picked seat again to change it.',
					'With a Traveller in play, "Call for exile" works the same way.'
				],
				screenshot: 'day-nominate'
			},
			{
				id: 'vote',
				title: 'Votes',
				summary: 'While a vote is open, tap the seat of everyone with a hand up; tap again to lower it. Typing a seat number does the same.',
				steps: [
					'A dead player\'s hand uses their ghost vote; lowering it gives the vote back.',
					'The panel counts hands against the number needed. Adjust the total for vote modifiers like the Bureaucrat.',
					'Close the vote when it\'s done; Reopen it to correct it.',
					'Whoever has the most votes, over the threshold, is on the block; Execute them from the panel.'
				],
				screenshot: 'day-vote'
			},
			{
				id: 'timer',
				title: 'Day timer',
				summary: 'Tap Timer in the top bar to set the minutes and start it. The time left shows in the top bar and as a ring around the gears, and a bell rings at zero.'
			}
		]
	},
	{
		id: 'reveals',
		title: 'Showing players',
		intro: 'A reveal fills the screen with what a player is shown, in large type, with nothing of yours on screen. It\'s always dark, so it never lights up a dark room.',
		topics: [
			{
				id: 'reveal',
				title: 'Reveals',
				summary: 'Night steps open reveals with Show. To show a player something at any other time, tap their seat and use "Show to player".',
				tips: [
					'When a reveal names players, it shows a map of the table with their seats lit and the viewer\'s own seat at the bottom, marked "You".',
					'Tap anywhere to close it. With the hand-over screen on, it starts and ends with a cover.'
				],
				screenshot: 'reveal'
			}
		]
	},
	{
		id: 'tools',
		title: 'Tools and the menu',
		intro: 'The top bar holds the phase and the tools you need now and then.',
		topics: [
			{
				id: 'top-bar',
				title: 'The top bar',
				summary: 'The phase pill shows the phase, the script and how many are alive. Beside it: Timer, Script, Log, Notes and Hide.',
				steps: [
					'Script: the script as a sheet, with Fabled and Loric in play and the jinxes.',
					'Log: everything that has happened, by phase.',
					'Notes: your own notes, saved with the game.',
					'‹ goes Home; the game is saved.'
				],
				screenshot: 'script'
			},
			{
				id: 'menu',
				title: 'The ⋯ menu',
				summary: 'Things you need less often.',
				steps: [
					'Bluffs, Fabled and Loric, and Add a Traveller.',
					'Share a game summary: every player, their character and how the game went, to AirDrop, Messages or Files.',
					'Keyboard shortcuts and Settings.',
					'Re-Rack (a new game with the same players and script) and End Game. Both ask first, and both can be undone.'
				],
				screenshot: 'menu'
			},
			{
				id: 'watch-outs',
				title: 'Watch-outs',
				summary: 'Win conditions and jinxes in play are pinned to the top of the panel. When a win looks likely, the panel suggests it above the End button.'
			},
			{
				id: 'undo',
				title: 'Undo',
				summary: 'Anything you change can be undone. Changes that matter (ending a phase, a death, an outcome) show a note at the top with Undo for ten seconds.',
				tips: [ 'With a keyboard, ⌘Z undoes and ⇧⌘Z redoes.' ],
				screenshot: 'undo'
			}
		]
	},
	{
		id: 'scripts',
		title: 'Scripts',
		intro: 'Browse Scripts, from Home, shows the official scripts and your homebrew ones.',
		topics: [
			{
				id: 'browse',
				title: 'Browsing',
				summary: 'Pick a script to read it as a script sheet: every character\'s monogram, name and ability, grouped by role, with its jinxes.',
				steps: [
					'Share sends the script as a file to AirDrop, Messages or Files.',
					'Copy as homebrew makes an editable copy.'
				],
				screenshot: 'browse'
			},
			{
				id: 'homebrew',
				title: 'Homebrew scripts',
				summary: 'New script starts an empty homebrew script. Tap characters on the left to add them and ticked ones on the right to remove them; the counts are compared with what the script type suggests.',
				tips: [
					'Import JSON reads a script file; you can also drop a file onto the page.',
					'Delete asks first.'
				],
				screenshot: 'editor'
			}
		]
	},
	{
		id: 'keyboard',
		title: 'Keyboard shortcuts',
		intro: 'With a Magic Keyboard, the night and the votes run without touching the screen. Shortcuts pause while you\'re typing.',
		topics: [
			{
				id: 'keys',
				title: 'Keys',
				summary: 'Press ? in a game to see these.',
				steps: [
					'→ and ←: next and previous night step.',
					'Space: show the current night step to the player.',
					'A seat number: tap that seat, for a choice, a nomination or a hand.',
					'N: start a nomination.',
					'P: lower the privacy curtain.',
					'[ and ]: turn the circle.',
					'Esc: close a player\'s details, stop a nomination or vote, or stop looking back.',
					'⌘Z and ⇧⌘Z: undo and redo.'
				]
			}
		]
	}
];
