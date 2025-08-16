import { Injectable } from '@angular/core';
import { PlayerImpl } from '../models/player.model';
import { I18nService } from './i18n.service';

const PROMPT_CONFIG = {
  BASE_PREPROMPT: {
    en: `React to the words and actions of nearby players, as well as those of your teammates, as if they were truly happening in this world. Prioritize clear and explicit descriptions of actions. Focus on what the characters do, say, or feel, and on their direct interactions with each other. Convey emotions through vivid dialogue and tangible reactions. Never break character and never mention that you are an AI. Keep your responses to 1–3 sentences to maintain the pace, unless I ask for more details.`,
    fr: `Réagis aux paroles et actions des joueurs alentours, ainsi qu'à celles de tes coéquipiers, comme si elles se déroulaient vraiment dans ce monde. Priorise les descriptions d'actions claires et explicites. Concentre-toi sur ce que les personnages font, disent ou ressentent, et sur les interactions directes entre eux. Montre les émotions à travers des dialogues vivants et des réactions tangibles. Ne brise jamais le personnage et ne mentionne jamais que tu es une IA. Garde tes réponses à 1-3 phrases pour maintenir le rythme, sauf si je demande plus de détails.`
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
    
    // Localized character descriptions
    const descriptions: Record<string, { en: string; fr: string }> = {
      'Warrior': {
        en: "A broad-shouldered warrior clad in weather-worn plate, the steel dulled by countless battles. A deep scar runs from his temple to his jaw, a silent testament to survival. His voice is gravel, his stare unshaken, and his hand never strays far from the hilt of his greatsword. Korran speaks little, but when he does, his words cut as sharply as his blade.",
        fr: "Un guerrier aux larges épaules vêtu d'une armure de plates usée par les intempéries, l'acier terni par d'innombrables batailles. Une profonde cicatrice court de sa tempe à sa mâchoire, témoignage silencieux de sa survie. Sa voix est graveleuse, son regard inébranlable, et sa main ne s'éloigne jamais du pommeau de sa grande épée. Korran parle peu, mais quand il le fait, ses mots tranchent aussi vivement que sa lame."
      },
      'Mage': {
        en: "Draped in flowing midnight-blue robes embroidered with silver constellations, Selvara's eyes shimmer like starlight on still water. A slender crystal-tipped staff rests in her hand, pulsing faintly with arcane energy. Her voice is calm but edged with power, each word carrying the weight of ancient knowledge and the promise of unbridled magic.",
        fr: "Drapée dans des robes bleu nuit fluides brodées de constellations argentées, les yeux de Selvara scintillent comme des étoiles sur une eau calme. Un bâton élancé à pointe de cristal repose dans sa main, pulsant faiblement d'énergie arcanique. Sa voix est calme mais teintée de puissance, chaque mot portant le poids d'un savoir ancien et la promesse d'une magie débridée."
      },
      'Rogue': {
        en: "Lean and sharp-eyed, Ryn moves like a shadow slipping between torchlight. A dark hood hides most of his face, but the glint of a knowing smirk can be seen when danger's near. Twin daggers rest at his hips, their edges whispering promises of silent endings. He speaks little, but every word feels like a calculated move in an unseen game.",
        fr: "Élancé et aux yeux perçants, Ryn se déplace comme une ombre glissant entre les torches. Une capuche sombre cache la majeure partie de son visage, mais l'éclat d'un sourire entendu se devine quand le danger approche. Deux dagues reposent à ses hanches, leurs lames murmurant des promesses de fins silencieuses. Il parle peu, mais chaque mot semble un mouvement calculé dans un jeu invisible."
      },
      'Hunter': {
        en: "Wrapped in a weathered cloak of mottled greens and browns, Kaelen blends into the wild as naturally as wind through leaves. A longbow rests easily in his hand, its grip worn smooth from years of use. His sharp eyes miss nothing, tracking prey—or threats—with the patience of a predator. Quiet and steady, Kaelen speaks in few words, each rooted in the rhythm of the hunt.",
        fr: "Enveloppé d'un manteau usé aux verts et bruns tachetés, Kaelen se fond dans la nature aussi naturellement que le vent à travers les feuilles. Un arc long repose aisément dans sa main, sa poignée polie par des années d'usage. Ses yeux perçants ne ratent rien, traquant proie ou menace avec la patience d'un prédateur. Silencieux et posé, Kaelen parle peu, chaque mot enraciné dans le rythme de la chasse."
      }
    };

    return descriptions[player.name]?.[lang] || player.description;
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
}