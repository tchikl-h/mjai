import { Injectable } from '@angular/core';
import { Trait, LocalizedText } from '../models/player.model';
import { I18nService, SupportedLanguage } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class TraitsService {
  private readonly TRAIT_ICONS: { [key: string]: string } = {
    'Lazy': '😴',
    'Slob': '🗑️',
    'Clumsy': '🤕',
    'Mean-Spirited': '😠',
    'Evil': '😈',
    'Gloomy': '😔',
    'Noncommittal': '🤷',
    'Hot-Headed': '🔥',
    'Insane / Erratic': '🤪',
    'Loner': '🚶',
    'Hates Children': '👶',
    'Jealous': '💚',
    'Glutton': '🍖',
    'Snob': '👑'
  };

  private readonly AVAILABLE_TRAITS: Trait[] = [
    { 
      name: { en: "Lazy", fr: "Paresseux" },
      description: { 
        en: "Avoids physical exertion and prefers rest over action.", 
        fr: "Évite l'effort physique et préfère le repos à l'action." 
      }
    },
    { 
      name: { en: "Slob", fr: "Négligé" },
      description: { 
        en: "Careless with cleanliness and appearance.", 
        fr: "Négligent avec la propreté et l'apparence." 
      }
    },
    { 
      name: { en: "Clumsy", fr: "Maladroit" },
      description: { 
        en: "Often trips, drops things, or fumbles in tense moments.", 
        fr: "Trébuche souvent, fait tomber des objets ou bafouille dans les moments tendus." 
      }
    },
    { 
      name: { en: "Mean-Spirited", fr: "Malveillant" },
      description: { 
        en: "Quick to insult or provoke others.", 
        fr: "Prompt à insulter ou provoquer les autres." 
      }
    },
    { 
      name: { en: "Evil", fr: "Maléfique" },
      description: { 
        en: "Takes pleasure in the suffering of others.", 
        fr: "Prend plaisir dans la souffrance des autres." 
      }
    },
    { 
      name: { en: "Gloomy", fr: "Sombre" },
      description: { 
        en: "Often pessimistic and melancholic.", 
        fr: "Souvent pessimiste et mélancolique." 
      }
    },
    { 
      name: { en: "Noncommittal", fr: "Indécis" },
      description: { 
        en: "Dislikes long-term plans or obligations.", 
        fr: "N'aime pas les plans à long terme ou les obligations." 
      }
    },
    { 
      name: { en: "Hot-Headed", fr: "Colérique" },
      description: { 
        en: "Easily angered and quick to act without thinking.", 
        fr: "Facilement en colère et prompt à agir sans réfléchir." 
      }
    },
    { 
      name: { en: "Insane / Erratic", fr: "Fou / Erratique" },
      description: { 
        en: "Unpredictable behavior and strange habits.", 
        fr: "Comportement imprévisible et habitudes étranges." 
      }
    },
    { 
      name: { en: "Loner", fr: "Solitaire" },
      description: { 
        en: "Prefers solitude and avoids large groups.", 
        fr: "Préfère la solitude et évite les grands groupes." 
      }
    },
    { 
      name: { en: "Hates Children", fr: "Déteste les Enfants" },
      description: { 
        en: "Feels uncomfortable around young ones.", 
        fr: "Se sent mal à l'aise avec les jeunes." 
      }
    },
    { 
      name: { en: "Jealous", fr: "Jaloux" },
      description: { 
        en: "Suspicious and possessive in relationships.", 
        fr: "Méfiant et possessif dans les relations." 
      }
    },
    { 
      name: { en: "Glutton", fr: "Glouton" },
      description: { 
        en: "Eats excessively and often at inopportune times.", 
        fr: "Mange excessivement et souvent à des moments inopportuns." 
      }
    },
    { 
      name: { en: "Snob", fr: "Snob" },
      description: { 
        en: "Looks down on those of lower status or skill.", 
        fr: "Méprise ceux de statut ou de compétence inférieure." 
      }
    }
  ];

  constructor(private i18n: I18nService) {}

  getTraitIcon(traitName: string | LocalizedText): string {
    // Handle both old string format and new LocalizedText format
    let nameKey: string;
    if (typeof traitName === 'string') {
      nameKey = traitName;
    } else {
      nameKey = traitName.en; // Use English name as key for icons
    }
    return this.TRAIT_ICONS[nameKey] || '❓';
  }

  getLocalizedTraitName(trait: Trait): string {
    const lang = this.i18n.language();
    return trait.name[lang];
  }

  getLocalizedTraitDescription(trait: Trait): string {
    const lang = this.i18n.language();
    return trait.description[lang];
  }


  getRandomTraits(count: number): Trait[] {
    if (count > this.AVAILABLE_TRAITS.length) {
      throw new Error(`Cannot get ${count} traits, only ${this.AVAILABLE_TRAITS.length} available`);
    }
    
    const shuffled = [...this.AVAILABLE_TRAITS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  getAllTraits(): Trait[] {
    return [...this.AVAILABLE_TRAITS];
  }
}