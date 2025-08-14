import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerImpl } from '../../models/player.model';
import { TraitsService } from '../../services/traits.service';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.css']
})
export class PlayerCardComponent {
  @Input() player!: PlayerImpl;
  @Input() isCurrentPlayer: boolean = false;
  @Input() showControls: boolean = true;
  @Input() size: 'small' | 'normal' = 'normal';
  @Output() healthToggle = new EventEmitter<{ player: PlayerImpl, heartIndex: number }>();

  constructor(private traitsService: TraitsService) {}

  onHealthToggle(heartIndex: number): void {
    if (this.showControls) {
      this.healthToggle.emit({ player: this.player, heartIndex });
    }
  }

  getTraitIcon(): string {
    return this.traitsService.getTraitIcon(this.player.trait.name);
  }
}