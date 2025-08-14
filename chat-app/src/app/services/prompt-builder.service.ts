import { Injectable } from '@angular/core';
import { PlayerImpl } from '../models/player.model';
import { PROMPT_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PromptBuilderService {

  constructor() {}

  buildPlayerPrompt(player: PlayerImpl): string {
    const traitSection = this.buildTraitSection(player);
    const descriptionSection = this.buildDescriptionSection(player);
    
    return `${PROMPT_CONFIG.BASE_PREPROMPT} ${traitSection} ${descriptionSection}`.trim();
  }

  private buildTraitSection(player: PlayerImpl): string {
    return `Your main trait is ${player.trait.name}, which means: ${player.trait.description}.`;
  }

  private buildDescriptionSection(player: PlayerImpl): string {
    return `You are ${player.description}`;
  }

  buildMessagePrompt(mjMessage: string): string {
    return `${mjMessage.trim()}. What do you do?`;
  }

  getRandomFallbackResponse(playerName: string): string {
    const responses = PROMPT_CONFIG.FALLBACK_RESPONSES;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex].replace('{playerName}', playerName);
  }

  formatHealthContext(player: PlayerImpl): string {
    if (player.health <= 1) {
      return " You are badly wounded and struggling to stay conscious.";
    } else if (player.health <= 2) {
      return " You are injured but still fighting.";
    }
    return " You are in good health.";
  }

  buildFullPlayerDescription(player: PlayerImpl, includeHealth: boolean = false): string {
    let description = this.buildPlayerPrompt(player);
    
    if (includeHealth) {
      description += this.formatHealthContext(player);
    }

    if (player.trait.challenge && !player.challengeResolved) {
      description += ` Remember, you currently face this challenge: ${player.trait.challenge}`;
    }

    return description;
  }
}