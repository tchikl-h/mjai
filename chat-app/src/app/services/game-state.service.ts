import { Injectable, signal, computed } from '@angular/core';
import { PlayerImpl } from '../models/player.model';
import { I18nService } from './i18n.service';

export enum GameStatus {
  PLAYING = 'playing',
  WON = 'won',
  LOST_ALL_DEAD = 'lost_all_dead',
  LOST_TOO_MANY_TURNS = 'lost_too_many_turns'
}

export interface GameEndReason {
  status: GameStatus;
  message: string;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly MAX_TURNS = 10;
  
  private gameStatus = signal<GameStatus>(GameStatus.PLAYING);
  private currentTurn = signal<number>(1);
  private gameEndReason = signal<GameEndReason | null>(null);

  // Computed signals for reactive state
  status = computed(() => this.gameStatus());
  turn = computed(() => this.currentTurn());
  endReason = computed(() => this.gameEndReason());
  isGameOver = computed(() => this.gameStatus() !== GameStatus.PLAYING);

  constructor(private i18n: I18nService) {}

  checkGameConditions(players: PlayerImpl[], turnNumber: number): GameEndReason | null {
    // Check if all players are dead
    const alivePlayers = players.filter(player => player.isAlive());
    if (alivePlayers.length === 0) {
      return {
        status: GameStatus.LOST_ALL_DEAD,
        message: this.i18n.translate('game.over.all.dead'),
        details: this.i18n.translate('game.over.all.dead.details')
      };
    }

    // Check if too many turns have passed
    if (turnNumber > this.MAX_TURNS) {
      return {
        status: GameStatus.LOST_TOO_MANY_TURNS,
        message: this.i18n.translate('game.over.too.many.turns'),
        details: this.i18n.translateWithParams('game.over.turn.limit.details', { 
          maxTurns: this.MAX_TURNS.toString() 
        })
      };
    }

    // Check if all alive players have completed their challenges
    const alivePlayersWithChallenges = alivePlayers.filter(player => player.trait.challenge);
    const completedChallenges = alivePlayersWithChallenges.filter(player => player.challengeResolved);
    
    if (alivePlayersWithChallenges.length > 0 && 
        completedChallenges.length === alivePlayersWithChallenges.length) {
      return {
        status: GameStatus.WON,
        message: this.i18n.translate('game.won.all.challenges'),
        details: this.i18n.translateWithParams('game.won.challenges.details', {
          playerCount: alivePlayers.length.toString(),
          turnNumber: turnNumber.toString()
        })
      };
    }

    return null;
  }

  updateGameState(players: PlayerImpl[], turnNumber: number): void {
    this.currentTurn.set(turnNumber);
    
    const endCondition = this.checkGameConditions(players, turnNumber);
    if (endCondition) {
      this.gameStatus.set(endCondition.status);
      this.gameEndReason.set(endCondition);
      
      // Log game end for debugging
      console.log(`Game ended: ${endCondition.status}`, endCondition);
    } else {
      // Game continues
      this.gameStatus.set(GameStatus.PLAYING);
      this.gameEndReason.set(null);
    }
  }

  resetGame(): void {
    this.gameStatus.set(GameStatus.PLAYING);
    this.currentTurn.set(1);
    this.gameEndReason.set(null);
    console.log('Game reset');
  }

  getGameStats(players: PlayerImpl[]): {
    totalPlayers: number;
    alivePlayers: number;
    completedChallenges: number;
    remainingChallenges: number;
    currentTurn: number;
    maxTurns: number;
  } {
    const alive = players.filter(p => p.isAlive());
    const completed = players.filter(p => p.challengeResolved && p.isAlive());
    
    return {
      totalPlayers: players.length,
      alivePlayers: alive.length,
      completedChallenges: completed.length,
      remainingChallenges: alive.length - completed.length,
      currentTurn: this.currentTurn(),
      maxTurns: this.MAX_TURNS
    };
  }

  getTurnsRemaining(): number {
    return Math.max(0, this.MAX_TURNS - this.currentTurn() + 1);
  }

  isLastTurn(): boolean {
    return this.currentTurn() === this.MAX_TURNS;
  }

  getProgressPercentage(players: PlayerImpl[]): number {
    const alive = players.filter(p => p.isAlive());
    const completed = players.filter(p => p.challengeResolved && p.isAlive());
    
    if (alive.length === 0) return 0;
    return Math.round((completed.length / alive.length) * 100);
  }
}