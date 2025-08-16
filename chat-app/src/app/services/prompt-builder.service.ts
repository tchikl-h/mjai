import { Injectable } from '@angular/core';
import { PlayerImpl } from '../models/player.model';
import { I18nService } from './i18n.service';
import { PLAYER_DESCRIPTIONS, PlayerName } from '../config/players.config';

const PROMPT_CONFIG = {
  BASE_PREPROMPT: {
    en: `React to the words and actions of nearby players, as well as those of your teammates, as if they were truly happening in this world. Prioritize clear and explicit descriptions of actions. Focus on what the characters do, say, or feel, and on their direct interactions with each other. Convey emotions through vivid dialogue and tangible reactions. Never break character and never mention that you are an AI. Never say "You've responded:", "You said:", or repeat the question before answering. Do not summarize or quote others. Just reply directly in character. Keep your responses to 1–3 sentences to maintain the pace, unless I ask for more details.`,
    fr: `Réagis aux paroles et actions des joueurs alentours, ainsi qu'à celles de tes coéquipiers, comme si elles se déroulaient vraiment dans ce monde. Priorise les descriptions d'actions claires et explicites. Concentre-toi sur ce que les personnages font, disent ou ressentent, et sur les interactions directes entre eux. Montre les émotions à travers des dialogues vivants et des réactions tangibles. Ne brise jamais le personnage et ne mentionne jamais que tu es une IA. Ne dit jamais « J'ai répondu : » ou « Vous avez dit : » et ne répète pas la question avant de répondre. Ne résume pas et ne cite pas les propos d'autrui. Répondez simplement directement, en imitant le personnage. Garde tes réponses à 1-3 phrases pour maintenir le rythme, sauf si je demande plus de détails.`
  },
  
  FALLBACK_RESPONSES: {
    en: [
      '*{playerName} nods thoughtfully*',
      '*{playerName} considers the situation carefully*',
      '*{playerName} takes a moment to think*',
      '*{playerName} looks around cautiously*',
      '*{playerName} remains alert and ready*'
    ],
    fr: [
      '*{playerName} hoche la tête pensivement*',
      '*{playerName} considère la situation attentivement*',
      '*{playerName} prend un moment pour réfléchir*',
      '*{playerName} regarde autour prudemment*',
      '*{playerName} reste vigilant et prêt*'
    ]
  }
};

@Injectable({
  providedIn: 'root'
})
export class PromptBuilderService {

  constructor(private i18n: I18nService) {}

  buildPlayerPrompt(player: PlayerImpl): string {
    const lang = this.i18n.language();
    // Trait section - DEACTIVATED
    // const traitSection = this.buildTraitSection(player);
    const descriptionSection = this.buildDescriptionSection(player);
    
    return `${PROMPT_CONFIG.BASE_PREPROMPT[lang]} ${descriptionSection}`.trim();
  }

  // DEACTIVATED - Trait system
  /*
  private buildTraitSection(player: PlayerImpl): string {
    const lang = this.i18n.language();
    const traitName = player.trait.name[lang];
    const traitDescription = player.trait.description[lang];
    
    if (lang === 'fr') {
      return `Ton trait principal est ${traitName}, ce qui signifie : ${traitDescription}.`;
    }
    return `Your main trait is ${traitName}, which means: ${traitDescription}.`;
  }
  */

  private buildDescriptionSection(player: PlayerImpl): string {
    const lang = this.i18n.language();
    const description = this.getLocalizedPlayerDescription(player);
    
    if (lang === 'fr') {
      return `Tu es ${description}`;
    }
    return `You are ${description}`;
  }

  private getLocalizedPlayerDescription(player: PlayerImpl): string {
    const lang = this.i18n.language();
    const descriptions = PLAYER_DESCRIPTIONS[player.name as PlayerName];
    if (descriptions && (lang === 'en' || lang === 'fr')) {
      return descriptions[lang];
    }
    return player.description;
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

  buildFullPlayerDescription(player: PlayerImpl, includeHealth: boolean = false, allPlayers?: PlayerImpl[]): string {
    const lang = this.i18n.language();
    let description = this.buildPlayerPrompt(player);
    
    if (includeHealth) {
      description += this.formatHealthContext(player);
    }

    // Add companions section
    if (allPlayers && allPlayers.length > 1) {
      const companions = allPlayers.filter(p => p.name !== player.name);
      if (companions.length > 0) {
        description += this.buildCompanionsSection(companions);
      }
    }

    // Challenge system - DEACTIVATED
    /*
    if (player.trait.challenge && !player.challengeResolved) {
      const challenge = player.trait.challenge[lang];
      if (lang === 'fr') {
        description += ` Rappelle-toi, tu fais actuellement face à ce défi : ${challenge}`;
      } else {
        description += ` Remember, you currently face this challenge: ${challenge}`;
      }
    }
    */

    return description;
  }

  private buildCompanionsSection(companions: PlayerImpl[]): string {
    const lang = this.i18n.language();
    
    if (companions.length === 0) {
      return '';
    }

    let companionsText = '';
    
    if (lang === 'fr') {
      companionsText = '\n\nTes compagnons d\'aventure : ';
    } else {
      companionsText = '\n\nYour adventure companions: ';
    }

    const companionDescriptions = companions.map(companion => {
      const baseDescription = this.getLocalizedPlayerDescription(companion);
      let companionInfo = '';
      
      if (lang === 'fr') {
        companionInfo = `${companion.name} - ${baseDescription}`;
        
        // Add health status
        if (companion.health <= 0) {
          companionInfo += ' (inconscient)';
        } else if (companion.health <= 1) {
          companionInfo += ' (gravement blessé)';
        } else if (companion.health <= 2) {
          companionInfo += ' (blessé)';
        }
      } else {
        companionInfo = `${companion.name} - ${baseDescription}`;
        
        // Add health status
        if (companion.health <= 0) {
          companionInfo += ' (unconscious)';
        } else if (companion.health <= 1) {
          companionInfo += ' (badly wounded)';
        } else if (companion.health <= 2) {
          companionInfo += ' (injured)';
        }
      }
      
      return companionInfo;
    });

    companionsText += companionDescriptions.join('; ') + '.';
    
    return companionsText;
  }
}