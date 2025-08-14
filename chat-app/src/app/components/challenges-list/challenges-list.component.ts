import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerImpl } from '../../models/player.model';
import { TraitsService } from '../../services/traits.service';
import { ChallengeService } from '../../services/challenge.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-challenges-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenges-list.component.html',
  styleUrls: ['./challenges-list.component.css']
})
export class ChallengesListComponent {
  @Input() players: PlayerImpl[] = [];

  constructor(
    private traitsService: TraitsService,
    private challengeService: ChallengeService,
    protected i18n: I18nService
  ) {}

  getTraitIcon(player: PlayerImpl): string {
    return this.traitsService.getTraitIcon(player.trait.name);
  }

  getLocalizedChallenge(player: PlayerImpl): string {
    return this.traitsService.getLocalizedTraitChallenge(player.trait);
  }

  toggleChallengeResolved(player: PlayerImpl): void {
    this.challengeService.toggleChallengeResolved(player);
  }

  getChallengeStatus(player: PlayerImpl): string {
    return this.challengeService.getChallengeStatus(player);
  }
}