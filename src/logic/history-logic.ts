import type { Game, InkStroke, PhaseSnapshot } from '../models/game';
import { CharacterLogic } from './character-logic';
import type { Phase } from '../models/phase';
import { PhaseLogic } from './phase-logic';
import { PhaseType } from '../enums/phase-type';
import { PlayerState } from '../enums/player-state';

export class HistoryLogic {
	static getPhaseKey = (phase: Phase) => `${phase.type}-${phase.number}`;

	// Keeps a copy of the grimoire as it stands at the end of the current phase
	static recordSnapshot = (game: Game): Game => {
		const key = HistoryLogic.getPhaseKey(game.phase);
		const snapshot: PhaseSnapshot = {
			phase: game.phase,
			players: game.players,
			modifiers: game.modifiers,
			otherCharacters: game.otherCharacters
		};
		const snapshots = (game.history.snapshots ?? []).filter(s => HistoryLogic.getPhaseKey(s.phase) !== key);
		return { ...game, history: { ...game.history, snapshots: [ ...snapshots, snapshot ] } };
	};

	static getSnapshots = (game: Game) => game.history.snapshots ?? [];

	// The game as it stood at the end of a past phase, for showing read-only
	static getGameAt = (game: Game, snapshot: PhaseSnapshot): Game => {
		return {
			...game,
			phase: snapshot.phase,
			players: snapshot.players,
			modifiers: snapshot.modifiers,
			otherCharacters: snapshot.otherCharacters
		};
	};

	// What happened in a phase, from the log
	static getEvents = (game: Game, phase: Phase) => {
		const label = PhaseLogic.getLabel(phase);
		return game.history.log.filter(e => PhaseLogic.getLabel(e.phase) === label);
	};

	// What each wake of a night showed or recorded, one line each, eg 'Esme (Empath): Evil living neighbours: 1'
	static getNightRecords = (game: Game, number: number): string[] => {
		const night = game.history.nights.find(n => n.number === number);
		if (!night) {
			return [];
		}

		const steps = CharacterLogic.getCharacters().flatMap(c => [ ...c.wakesFirstNight, ...c.wakesOtherNights ].map(step => ({ step, character: c })));
		const name = (id: string) => game.players.find(p => p.id === id)?.name ?? '?';
		const character = (id: string) => CharacterLogic.getCharacters().find(c => c.id === id)?.name ?? '?';

		return night.steps.map(record => {
			const found = steps.find(s => s.step.id === record.stepID);
			const who = record.playerID ? name(record.playerID) : 'Group';
			const label = found ? `${who} (${found.character.name}): ${found.step.note || found.step.text}` : `${who}: ${record.stepID.replace(/_/g, ' ').trim()}`;
			if (record.ignored) {
				return `${label}: not shown`;
			}
			const values = [
				...record.playerIDs.map(name),
				...record.characterIDs.map(character),
				record.number !== null ? `${record.number}` : null,
				record.yesNo !== null ? (record.yesNo ? 'Yes' : 'No') : null,
				record.alignment
			].filter(v => (v !== null) && (v !== ''));
			return values.length > 0 ? `${label}: ${values.join(', ')}` : label;
		});
	};

	static getInk = (game: Game, phase: Phase): InkStroke[] => game.ink?.[ HistoryLogic.getPhaseKey(phase) ] ?? [];

	static addInk = (game: Game, stroke: InkStroke): Game => {
		const key = HistoryLogic.getPhaseKey(game.phase);
		return { ...game, ink: { ...(game.ink ?? {}), [ key ]: [ ...(game.ink?.[ key ] ?? []), stroke ] } };
	};

	static clearInk = (game: Game): Game => {
		const key = HistoryLogic.getPhaseKey(game.phase);
		const ink = { ...(game.ink ?? {}) };
		delete ink[ key ];
		return { ...game, ink: ink };
	};

	// A plain-text account of the game so far, to share with the table
	static getSummary = (game: Game): string => {
		const lines: string[] = [];
		lines.push(`${game.script.name}: ${PhaseLogic.getLabel(game.phase)}`);
		lines.push('');
		lines.push('Players');
		game.players.forEach((p, n) => {
			const dead = p.state !== PlayerState.Alive ? ` (died ${p.death ? `${PhaseLogic.getLabel(p.death.phase)}: ${p.death.cause}` : ''})` : '';
			lines.push(`${n + 1}. ${p.name}: ${p.character?.name ?? 'no character'}, ${p.alignment}${dead}`);
		});
		if (game.bluffs.length > 0) {
			lines.push('');
			lines.push(`Bluffs: ${game.bluffs.map(c => c.name).join(', ')}`);
		}
		const demonIDs = game.bluffs.map(c => c.id).join(',');
		game.players
			.filter(p => p.bluffs && (p.bluffs.map(c => c.id).join(',') !== demonIDs))
			.forEach(p => lines.push(`${p.name}'s bluffs: ${(p.bluffs ?? []).map(c => c.name).join(', ') || 'none'}`));
		if (game.otherCharacters.length > 0) {
			lines.push(`Fabled and Loric: ${game.otherCharacters.map(c => c.name).join(', ')}`);
		}
		PhaseLogic.getLogGroups(game).forEach(group => {
			if (group.label === PhaseType.Setup) {
				return;
			}
			lines.push('');
			lines.push(group.label);
			group.entries.forEach(e => lines.push(`- ${e.text}`));
		});
		return lines.join('\n');
	};
}
