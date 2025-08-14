import { Injectable } from '@angular/core';
import { Trait } from '../models/player.model';

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
      "name": "Lazy", 
      "description": "Avoids physical exertion and prefers rest over action.", 
      "challenge": "Carry heavy supplies for the party during a full day's travel."
    },
    { 
      "name": "Slob", 
      "description": "Careless with cleanliness and appearance.", 
      "challenge": "Attend a royal banquet without offending anyone with your manners."
    },
    { 
      "name": "Clumsy", 
      "description": "Often trips, drops things, or fumbles in tense moments.", 
      "challenge": "Disarm a delicate trap without triggering it."
    },
    { 
      "name": "Mean-Spirited", 
      "description": "Quick to insult or provoke others.", 
      "challenge": "Negotiate peace between two feuding villagers."
    },
    { 
      "name": "Evil", 
      "description": "Takes pleasure in the suffering of others.", 
      "challenge": "Protect a helpless NPC without harming them."
    },
    { 
      "name": "Gloomy", 
      "description": "Often pessimistic and melancholic.", 
      "challenge": "Inspire the party with an uplifting speech before a battle."
    },
    { 
      "name": "Noncommittal", 
      "description": "Dislikes long-term plans or obligations.", 
      "challenge": "Stick with the group through an entire dungeon without trying to leave."
    },
    { 
      "name": "Hot-Headed", 
      "description": "Easily angered and quick to act without thinking.", 
      "challenge": "End a tense tavern argument without drawing your weapon."
    },
    { 
      "name": "Insane / Erratic", 
      "description": "Unpredictable behavior and strange habits.", 
      "challenge": "Follow an entire plan exactly as discussed without improvising."
    },
    { 
      "name": "Loner", 
      "description": "Prefers solitude and avoids large groups.", 
      "challenge": "Lead a crowded caravan safely to its destination."
    },
    { 
      "name": "Hates Children", 
      "description": "Feels uncomfortable around young ones.", 
      "challenge": "Escort a lost child back to their family without abandoning them."
    },
    { 
      "name": "Jealous", 
      "description": "Suspicious and possessive in relationships.", 
      "challenge": "Let another party member take the spotlight in a heroic deed."
    },
    { 
      "name": "Glutton", 
      "description": "Eats excessively and often at inopportune times.", 
      "challenge": "Share your last ration with a starving stranger."
    },
    { 
      "name": "Snob", 
      "description": "Looks down on those of lower status or skill.", 
      "challenge": "Work as an equal alongside a humble peasant to complete a task."
    }
  ];

  constructor() {}

  getTraitIcon(traitName: string): string {
    return this.TRAIT_ICONS[traitName] || '❓';
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