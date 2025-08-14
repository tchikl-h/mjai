import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerImpl } from '../../models/player.model';
import { I18nService } from '../../services/i18n.service';
import { GameEndReason } from '../../services/game-state.service';

@Component({
  selector: 'app-win-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './win-screen.component.html',
  styleUrls: ['./win-screen.component.css']
})
export class WinScreenComponent {
  @Input() players: PlayerImpl[] = [];
  @Input() endReason!: GameEndReason;
  @Input() finalTurn: number = 0;
  @Output() restart = new EventEmitter<void>();

  constructor(protected i18n: I18nService) {}

  getAlivePlayers(): PlayerImpl[] {
    return this.players.filter(player => player.isAlive());
  }

  getCompletedChallenges(): PlayerImpl[] {
    return this.players.filter(player => player.challengeResolved && player.isAlive());
  }

  onRestart(): void {
    this.restart.emit();
  }

  getGameStats() {
    const alive = this.getAlivePlayers();
    const completed = this.getCompletedChallenges();
    
    return {
      totalPlayers: this.players.length,
      survivedPlayers: alive.length,
      completedChallenges: completed.length,
      finalTurn: this.finalTurn
    };
  }
}