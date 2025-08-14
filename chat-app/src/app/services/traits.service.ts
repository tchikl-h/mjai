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
      },
      challenge: { 
        en: "Carry heavy supplies for the party during a full day's travel.",
        fr: "Porter des provisions lourdes pour le groupe pendant une journée entière de voyage."
      }
    },
    { 
      name: { en: "Slob", fr: "Négligé" },
      description: { 
        en: "Careless with cleanliness and appearance.", 
        fr: "Négligent avec la propreté et l'apparence." 
      },
      challenge: { 
        en: "Attend a royal banquet without offending anyone with your manners.",
        fr: "Assister à un banquet royal sans offenser personne avec tes manières."
      }
    },
    { 
      name: { en: "Clumsy", fr: "Maladroit" },
      description: { 
        en: "Often trips, drops things, or fumbles in tense moments.", 
        fr: "Trébuche souvent, fait tomber des objets ou bafouille dans les moments tendus." 
      },
      challenge: { 
        en: "Disarm a delicate trap without triggering it.",
        fr: "Désarmorcer un piège délicat sans le déclencher."
      }
    },
    { 
      name: { en: "Mean-Spirited", fr: "Malveillant" },
      description: { 
        en: "Quick to insult or provoke others.", 
        fr: "Prompt à insulter ou provoquer les autres." 
      },
      challenge: { 
        en: "Negotiate peace between two feuding villagers.",
        fr: "Négocier la paix entre deux villageois en conflit."
      }
    },
    { 
      name: { en: "Evil", fr: "Maléfique" },
      description: { 
        en: "Takes pleasure in the suffering of others.", 
        fr: "Prend plaisir dans la souffrance des autres." 
      },
      challenge: { 
        en: "Protect a helpless NPC without harming them.",
        fr: "Protéger un PNJ sans défense sans lui faire de mal."
      }
    },
    { 
      name: { en: "Gloomy", fr: "Sombre" },
      description: { 
        en: "Often pessimistic and melancholic.", 
        fr: "Souvent pessimiste et mélancolique." 
      },
      challenge: { 
        en: "Inspire the party with an uplifting speech before a battle.",
        fr: "Inspirer le groupe avec un discours encourageant avant une bataille."
      }
    },
    { 
      name: { en: "Noncommittal", fr: "Indécis" },
      description: { 
        en: "Dislikes long-term plans or obligations.", 
        fr: "N'aime pas les plans à long terme ou les obligations." 
      },
      challenge: { 
        en: "Stick with the group through an entire dungeon without trying to leave.",
        fr: "Rester avec le groupe à travers tout un donjon sans essayer de partir."
      }
    },
    { 
      name: { en: "Hot-Headed", fr: "Colérique" },
      description: { 
        en: "Easily angered and quick to act without thinking.", 
        fr: "Facilement en colère et prompt à agir sans réfléchir." 
      },
      challenge: { 
        en: "End a tense tavern argument without drawing your weapon.",
        fr: "Terminer une dispute tendue de taverne sans dégainer ton arme."
      }
    },
    { 
      name: { en: "Insane / Erratic", fr: "Fou / Erratique" },
      description: { 
        en: "Unpredictable behavior and strange habits.", 
        fr: "Comportement imprévisible et habitudes étranges." 
      },
      challenge: { 
        en: "Follow an entire plan exactly as discussed without improvising.",
        fr: "Suivre un plan entier exactement comme discuté sans improviser."
      }
    },
    { 
      name: { en: "Loner", fr: "Solitaire" },
      description: { 
        en: "Prefers solitude and avoids large groups.", 
        fr: "Préfère la solitude et évite les grands groupes." 
      },
      challenge: { 
        en: "Lead a crowded caravan safely to its destination.",
        fr: "Mener une caravane bondée en sécurité vers sa destination."
      }
    },
    { 
      name: { en: "Hates Children", fr: "Déteste les Enfants" },
      description: { 
        en: "Feels uncomfortable around young ones.", 
        fr: "Se sent mal à l'aise avec les jeunes." 
      },
      challenge: { 
        en: "Escort a lost child back to their family without abandoning them.",
        fr: "Escorter un enfant perdu vers sa famille sans l'abandonner."
      }
    },
    { 
      name: { en: "Jealous", fr: "Jaloux" },
      description: { 
        en: "Suspicious and possessive in relationships.", 
        fr: "Méfiant et possessif dans les relations." 
      },
      challenge: { 
        en: "Let another party member take the spotlight in a heroic deed.",
        fr: "Laisser un autre membre du groupe être sous les projecteurs dans un acte héroïque."
      }
    },
    { 
      name: { en: "Glutton", fr: "Glouton" },
      description: { 
        en: "Eats excessively and often at inopportune times.", 
        fr: "Mange excessivement et souvent à des moments inopportuns." 
      },
      challenge: { 
        en: "Share your last ration with a starving stranger.",
        fr: "Partager ta dernière ration avec un étranger affamé."
      }
    },
    { 
      name: { en: "Snob", fr: "Snob" },
      description: { 
        en: "Looks down on those of lower status or skill.", 
        fr: "Méprise ceux de statut ou de compétence inférieure." 
      },
      challenge: { 
        en: "Work as an equal alongside a humble peasant to complete a task.",
        fr: "Travailler d'égal à égal avec un humble paysan pour accomplir une tâche."
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

  getLocalizedTraitChallenge(trait: Trait): string {
    const lang = this.i18n.language();
    return trait.challenge[lang];
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