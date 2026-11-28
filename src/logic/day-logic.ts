import type { Day, Nomination } from '../models/day';
import type { DayAction } from '../models/day-action';
import { Factory } from './factory';
import type { Game } from '../models/game';
import { PhaseLogic } from './phase-logic';
import { PhaseType } from '../enums/phase-type';
import type { Player } from '../models/player';
import { PlayerState } from '../enums/player-state';
import { RoleType } from '../enums/role-type';

export class DayLogic {
	// The current day, or null if it isn't daytime
	static getDay = (game: Game): Day | null => {
		if (game.phase.type !== PhaseType.Day) {
			return null;
		}

		return game.history.days.find(d => d.number === game.phase.number) ?? Factory.createDay({ number: game.phase.number });
	};

	static setDay = (game: Game, day: Day): Game => {
		return {
			...game,
			history: {
				...game.history,
				days: [ ...game.history.days.filter(d => d.number !== day.number), day ].sort((a, b) => a.number - b.number)
			}
		};
	};

	// An execution needs votes from at least half the living players; an exile needs half of all players
	static getVotesNeeded = (game: Game, isExile: boolean) => {
		const count = isExile ? game.players.length : game.players.filter(p => p.state === PlayerState.Alive).length;
		return Math.ceil(count / 2);
	};

	// The nominee with the most votes, if they reached the threshold and nobody tied with them
	static getOnTheBlock = (game: Game, day: Day): { player: Player, votes: number } | null => {
		const executions = day.nominations.filter(n => !n.isExile);
		const needed = DayLogic.getVotesNeeded(game, false);
		const highest = Math.max(0, ...executions.map(n => n.votes));
		if (highest < needed) {
			return null;
		}

		const top = executions.filter(n => n.votes === highest);
		if (top.length !== 1) {
			return null;
		}

		const player = game.players.find(p => p.id === top[ 0 ].nomineeID);
		return player ? { player: player, votes: highest } : null;
	};

	static isTied = (game: Game, day: Day) => {
		const executions = day.nominations.filter(n => !n.isExile);
		const highest = Math.max(0, ...executions.map(n => n.votes));
		return (highest >= DayLogic.getVotesNeeded(game, false)) && (executions.filter(n => n.votes === highest).length > 1);
	};

	// Living players who haven't nominated today (Travellers' exile calls don't count)
	static canNominate = (day: Day, player: Player, isExile: boolean) => {
		if (isExile) {
			return true;
		}
		return (player.state === PlayerState.Alive) && !day.nominations.some(n => !n.isExile && (n.nominatorID === player.id));
	};

	// Players who haven't been nominated today; only Travellers can be called for exile
	static canBeNominated = (day: Day, player: Player, isExile: boolean) => {
		if (isExile) {
			return (player.character?.role === RoleType.Traveller) && !day.nominations.some(n => n.isExile && (n.nomineeID === player.id));
		}
		return !day.nominations.some(n => !n.isExile && (n.nomineeID === player.id));
	};

	// The players in the order the vote goes round: clockwise, starting after the nominee
	static getVotingOrder = (game: Game, nomination: Nomination) => {
		const index = game.players.findIndex(p => p.id === nomination.nomineeID);
		return [ ...game.players.slice(index + 1), ...game.players.slice(0, index + 1) ];
	};

	// Whether this player may raise a hand: living players and dead players with a ghost vote; anyone for an exile
	static canVote = (player: Player, nomination: Nomination) => {
		if (nomination.isExile || nomination.voterIDs.includes(player.id)) {
			return true;
		}
		return player.state !== PlayerState.DeadWithoutGhostVote;
	};

	static addNomination = (game: Game, nominatorID: string, nomineeID: string, isExile: boolean): Game => {
		const day = DayLogic.getDay(game);
		if (!day) {
			return game;
		}

		const nominator = game.players.find(p => p.id === nominatorID);
		const nominee = game.players.find(p => p.id === nomineeID);
		const updated = DayLogic.setDay(game, { ...day, nominations: [ ...day.nominations, Factory.createNomination({ nominatorID, nomineeID, isExile }) ] });
		return PhaseLogic.addLog(updated, `${nominator?.name} ${isExile ? 'calls for the exile of' : 'nominates'} ${nominee?.name}`);
	};

	static removeNomination = (game: Game, nominationID: string): Game => {
		const day = DayLogic.getDay(game);
		const nomination = day?.nominations.find(n => n.id === nominationID);
		if (!day || !nomination) {
			return game;
		}

		// Give back any ghost votes spent on it
		let updated = game;
		nomination.voterIDs.forEach(id => updated = DayLogic.toggleVoter(updated, nominationID, id));
		const updatedDay = DayLogic.getDay(updated) ?? day;
		return DayLogic.setDay(updated, { ...updatedDay, nominations: updatedDay.nominations.filter(n => n.id !== nominationID) });
	};

	// Adds or removes a vote; a dead player's vote spends (or gives back) their ghost vote
	static toggleVoter = (game: Game, nominationID: string, playerID: string): Game => {
		const day = DayLogic.getDay(game);
		const nomination = day?.nominations.find(n => n.id === nominationID);
		const player = game.players.find(p => p.id === playerID);
		if (!day || !nomination || !player) {
			return game;
		}

		const voting = !nomination.voterIDs.includes(playerID);
		if (voting && !DayLogic.canVote(player, nomination)) {
			return game;
		}

		const voterIDs = voting ? [ ...nomination.voterIDs, playerID ] : nomination.voterIDs.filter(id => id !== playerID);
		const updatedNomination: Nomination = {
			...nomination,
			voterIDs: voterIDs,
			votes: Math.max(0, nomination.votes + (voting ? 1 : -1))
		};

		let updated = DayLogic.setDay(game, { ...day, nominations: day.nominations.map(n => n.id === nominationID ? updatedNomination : n) });

		if (!nomination.isExile) {
			if (voting && (player.state === PlayerState.DeadWithGhostVote)) {
				updated = { ...updated, players: updated.players.map(p => p.id === playerID ? { ...p, state: PlayerState.DeadWithoutGhostVote } : p) };
			} else if (!voting && (player.state === PlayerState.DeadWithoutGhostVote)) {
				updated = { ...updated, players: updated.players.map(p => p.id === playerID ? { ...p, state: PlayerState.DeadWithGhostVote } : p) };
			}
		}

		return updated;
	};

	// For vote modifiers such as the Bureaucrat or Thief: the Storyteller sets the total directly
	static setVotes = (game: Game, nominationID: string, votes: number): Game => {
		const day = DayLogic.getDay(game);
		if (!day) {
			return game;
		}
		return DayLogic.setDay(game, { ...day, nominations: day.nominations.map(n => n.id === nominationID ? { ...n, votes: votes } : n) });
	};

	static execute = (game: Game, playerID: string): Game => {
		const day = DayLogic.getDay(game);
		const player = game.players.find(p => p.id === playerID);
		if (!day || !player) {
			return game;
		}

		let updated = DayLogic.setDay(game, { ...day, executedPlayerID: playerID });
		updated = PhaseLogic.addLog(updated, `${player.name} is executed`);
		updated = PhaseLogic.setPlayerState(updated, playerID, PlayerState.DeadWithGhostVote);
		return PhaseLogic.setCauseOfDeath(updated, playerID, 'Executed');
	};

	static getPlayerName = (game: Game, playerID: string) => {
		return game.players.find(p => p.id === playerID)?.name ?? '?';
	};

	static getExecutedPlayer = (game: Game, day: Day) => {
		return game.players.find(p => p.id === day.executedPlayerID) ?? null;
	};

	static getExiledPlayers = (game: Game, day: Day) => {
		const ids = DayLogic.getExiledPlayerIDs(day);
		return game.players.filter(p => ids.includes(p.id));
	};

	// Exiles are only possible while a Traveller is in the game
	static hasTravellers = (game: Game) => {
		return game.players.some(p => p.character?.role === RoleType.Traveller);
	};

	static getNominators = (game: Game, day: Day, isExile: boolean) => {
		return game.players.filter(p => DayLogic.canNominate(day, p, isExile));
	};

	static getNominees = (game: Game, day: Day, isExile: boolean) => {
		return game.players.filter(p => DayLogic.canBeNominated(day, p, isExile));
	};

	// A dead player's vote spends their ghost vote, except in an exile
	static getVoterLabel = (player: Player, nomination: Nomination) => {
		return (player.state === PlayerState.Alive) || nomination.isExile ? player.name : `${player.name} (ghost)`;
	};

	// eg 'Ann nominates Ben', or 'Ann calls for the exile of Hal'
	static describeNomination = (game: Game, nomination: Nomination) => {
		return `${DayLogic.getPlayerName(game, nomination.nominatorID)} ${nomination.isExile ? 'calls for the exile of' : 'nominates'} ${DayLogic.getPlayerName(game, nomination.nomineeID)}`;
	};

	// The players who can raise a hand, in the order the vote goes round
	static getVoters = (game: Game, nomination: Nomination) => {
		return DayLogic.getVotingOrder(game, nomination).filter(p => DayLogic.canVote(p, nomination));
	};

	// What tapping a player's seat does while a nomination or vote is running; returns the updated game and action
	static tapSeat = (game: Game, action: DayAction, playerID: string): { game: Game, action: DayAction | null } => {
		const day = DayLogic.getDay(game);
		const player = game.players.find(p => p.id === playerID);
		if (!day || !player) {
			return { game, action };
		}

		if (action.type === 'vote') {
			return { game: DayLogic.toggleVoter(game, action.nominationID, playerID), action };
		}

		// Tapping a seat that's already picked un-picks it
		if (action.nomineeID === playerID) {
			return { game, action: { ...action, nomineeID: null } };
		}
		if ((action.nominatorID === playerID) && (action.nomineeID === null)) {
			return { game, action: { ...action, nominatorID: null } };
		}

		if ((action.nominatorID === null) && DayLogic.canNominate(day, player, action.isExile)) {
			return { game, action: { ...action, nominatorID: playerID } };
		}
		if ((action.nominatorID !== null) && (action.nomineeID === null) && DayLogic.canBeNominated(day, player, action.isExile)) {
			return { game, action: { ...action, nomineeID: playerID } };
		}

		return { game, action };
	};

	// How a seat looks while a nomination or vote is running
	static getSeatState = (game: Game, action: DayAction | null, player: Player) => {
		const day = DayLogic.getDay(game);
		if (!day || !action) {
			return { available: true, picked: false, hand: false };
		}

		if (action.type === 'vote') {
			const nomination = day.nominations.find(n => n.id === action.nominationID);
			if (!nomination) {
				return { available: true, picked: false, hand: false };
			}
			return {
				available: DayLogic.canVote(player, nomination),
				picked: (player.id === nomination.nominatorID) || (player.id === nomination.nomineeID),
				hand: nomination.voterIDs.includes(player.id)
			};
		}

		const picked = (player.id === action.nominatorID) || (player.id === action.nomineeID);
		let available = picked;
		if (action.nominatorID === null) {
			available = DayLogic.canNominate(day, player, action.isExile);
		} else if (action.nomineeID === null) {
			available = picked || DayLogic.canBeNominated(day, player, action.isExile);
		}
		return { available, picked, hand: false };
	};

	// The nominator and nominee to join with an arrow on the circle, if there are both
	static getLink = (game: Game, action: DayAction | null): { fromID: string, toID: string } | null => {
		if (!action) {
			return null;
		}
		if (action.type === 'nominate') {
			return (action.nominatorID && action.nomineeID) ? { fromID: action.nominatorID, toID: action.nomineeID } : null;
		}
		const nomination = DayLogic.getDay(game)?.nominations.find(n => n.id === action.nominationID);
		return nomination ? { fromID: nomination.nominatorID, toID: nomination.nomineeID } : null;
	};

	// Games saved when only one exile a day was allowed have exiledPlayerID instead
	static getExiledPlayerIDs = (day: Day): string[] => {
		const legacy = (day as Day & { exiledPlayerID?: string | null }).exiledPlayerID;
		return day.exiledPlayerIDs ?? (legacy ? [ legacy ] : []);
	};

	static exile = (game: Game, playerID: string): Game => {
		const day = DayLogic.getDay(game);
		const player = game.players.find(p => p.id === playerID);
		if (!day || !player || DayLogic.getExiledPlayerIDs(day).includes(playerID)) {
			return game;
		}

		let updated = DayLogic.setDay(game, { ...day, exiledPlayerIDs: [ ...DayLogic.getExiledPlayerIDs(day), playerID ] });
		updated = PhaseLogic.addLog(updated, `${player.name} is exiled`);
		updated = PhaseLogic.setPlayerState(updated, playerID, PlayerState.DeadWithGhostVote);
		return PhaseLogic.setCauseOfDeath(updated, playerID, 'Exiled');
	};
}
