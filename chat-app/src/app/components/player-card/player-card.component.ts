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
  @Input() size: 'small' | 'normal' = 'normal';
  @Output() healthToggle = new EventEmitter<{ player: PlayerImpl, heartIndex: number }>();

  constructor(
    private traitsService: TraitsService,
    protected i18n: I18nService
  ) {}

  onHealthToggle(heartIndex: number): void {
    if (this.showControls) {
      this.healthToggle.emit({ player: this.player, heartIndex });
    }
  }

  getTraitIcon(): string {
    return this.traitsService.getTraitIcon(this.player.trait.name);
  }

  getTraitTooltip(): string {
    const name = this.traitsService.getLocalizedTraitName(this.player.trait);
    const description = this.traitsService.getLocalizedTraitDescription(this.player.trait);
    return `${name}: ${description}`;
  }
}