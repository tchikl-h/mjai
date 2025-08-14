import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerImpl } from '../../models/player.model';
import { I18nService } from '../../services/i18n.service';
import { GameEndReason, GameStatus } from '../../services/game-state.service';

@Component({
  selector: 'app-game-over-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-over-screen.component.html',
  styleUrls: ['./game-over-screen.component.css']
})
export class GameOverScreenComponent {
  @Input() players: PlayerImpl[] = [];
  @Input() endReason!: GameEndReason;
  @Input() finalTurn: number = 0;
  @Output() restart = new EventEmitter<void>();

  readonly GameStatus = GameStatus;

  constructor(protected i18n: I18nService) {}

  getDeadPlayers(): PlayerImpl[] {
    return this.players.filter(player => !player.isAlive());
  }

  getAlivePlayers(): PlayerImpl[] {
    return this.players.filter(player => player.isAlive());
  }

  getCompletedChallenges(): PlayerImpl[] {
    return this.players.filter(player => player.challengeResolved);
  }

  onRestart(): void {
    this.restart.emit();
  }

  getFailureIcon(): string {
    switch (this.endReason.status) {
      case GameStatus.LOST_ALL_DEAD:
        return '💀';
      case GameStatus.LOST_TOO_MANY_TURNS:
        return '⏰';
      default:
        return '❌';
    }
  }

  getGameStats() {
    return {
      totalPlayers: this.players.length,
      survivedPlayers: this.getAlivePlayers().length,
      eliminatedPlayers: this.getDeadPlayers().length,
      completedChallenges: this.getCompletedChallenges().length,
      finalTurn: this.finalTurn
    };
  }
}