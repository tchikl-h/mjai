import { Injectable } from '@angular/core';
import { PlayerImpl } from '../models/player.model';
import { PROMPT_CONFIG } from '../config/api.config';
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class PromptBuilderService {

  constructor(private i18n: I18nService) {}

  buildPlayerPrompt(player: PlayerImpl): string {
    const lang = this.i18n.language();
    const traitSection = this.buildTraitSection(player);
    const descriptionSection = this.buildDescriptionSection(player);
    
    return `${PROMPT_CONFIG.BASE_PREPROMPT[lang]} ${traitSection} ${descriptionSection}`.trim();
  }

  private buildTraitSection(player: PlayerImpl): string {
    const lang = this.i18n.language();
    const traitName = player.trait.name[lang];
    const traitDescription = player.trait.description[lang];
    
    if (lang === 'fr') {
      return `Ton trait principal est ${traitName}, ce qui signifie : ${traitDescription}.`;
    }
    return `Your main trait is ${traitName}, which means: ${traitDescription}.`;
  }

  private buildDescriptionSection(player: PlayerImpl): string {
    const lang = this.i18n.language();
    if (lang === 'fr') {
      return `Tu es ${player.description}`;
    }
    return `You are ${player.description}`;
  }

  buildMessagePrompt(mjMessage: string): string {
    const lang = this.i18n.language();
    if (lang === 'fr') {
      return `${mjMessage.trim()}. Que fais-tu ?`;
    }
    return `${mjMessage.trim()}. What do you do?`;
  }

  getRandomFallbackResponse(playerName: string): string {
    const lang = this.i18n.language();
    const responses = PROMPT_CONFIG.FALLBACK_RESPONSES[lang];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex].replace('{playerName}', playerName);
  }

  formatHealthContext(player: PlayerImpl): string {
    const lang = this.i18n.language();
    if (lang === 'fr') {
      if (player.health <= 1) {
        return " Tu es gravement blessé et tu luttes pour rester conscient.";
      } else if (player.health <= 2) {
        return " Tu es blessé mais tu continues à combattre.";
      }
      return " Tu es en bonne santé.";
    } else {
      if (player.health <= 1) {
        return " You are badly wounded and struggling to stay conscious.";
      } else if (player.health <= 2) {
        return " You are injured but still fighting.";
      }
      return " You are in good health.";
    }
  }

  buildFullPlayerDescription(player: PlayerImpl, includeHealth: boolean = false): string {
    const lang = this.i18n.language();
    let description = this.buildPlayerPrompt(player);
    
    if (includeHealth) {
      description += this.formatHealthContext(player);
    }

    if (player.trait.challenge && !player.challengeResolved) {
      const challenge = player.trait.challenge[lang];
      if (lang === 'fr') {
        description += ` Rappelle-toi, tu fais actuellement face à ce défi : ${challenge}`;
      } else {
        description += ` Remember, you currently face this challenge: ${challenge}`;
      }
    }

    return description;
  }
}