import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerImpl } from '../../models/player.model';
import { TraitsService } from '../../services/traits.service';
import { I18nService } from '../../services/i18n.service';

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
  @Input() clickable: boolean = false;
  @Input() size: 'small' | 'normal' = 'normal';
  @Output() healthToggle = new EventEmitter<{ player: PlayerImpl, heartIndex: number }>();
  @Output() playerClick = new EventEmitter<PlayerImpl>();
  @Output() playerSpeak = new EventEmitter<PlayerImpl>();

  constructor(
    private traitsService: TraitsService,
    protected i18n: I18nService
  ) {}

  onHealthToggle(heartIndex: number): void {
    if (this.showControls) {
      this.healthToggle.emit({ player: this.player, heartIndex });
    }
  }

  onClick(): void {
    if (this.clickable) {
      this.playerClick.emit(this.player);
    }
  }

  onSpeakClick(event: Event): void {
    event.stopPropagation();
    if (this.player.isAlive()) {
      this.playerSpeak.emit(this.player);
    }
  }

  // Trait methods - DEACTIVATED
  /*
  getTraitIcon(): string {
    return this.traitsService.getTraitIcon(this.player.trait.name);
  }

  getTraitTooltip(): string {
    const name = this.traitsService.getLocalizedTraitName(this.player.trait);
    const description = this.traitsService.getLocalizedTraitDescription(this.player.trait);
    return `${name}: ${description}`;
  }
  */
}