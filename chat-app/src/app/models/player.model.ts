import { Item } from './item.model';

export interface LocalizedText {
  en: string;
  fr: string;
}

export interface Trait {
  name: LocalizedText;
  description: LocalizedText;
}

export interface Player {
  name: string;
  backstory: string;
  imageUri: string;
  health: number;
  inventory: string;
  traits: string;
  attacks: string;
  voiceId: string;
  isAlive(): boolean;
}

export class PlayerImpl implements Player {
  constructor(
    public name: string,
    public backstory: string,
    public imageUri: string,
    public traits: string,
    public health: number = 3,
    public inventory: string = '',
    public attacks: string = '',
    public voiceId: string = ''
  ) {}

  isAlive(): boolean {
    return this.health > 0;
  }
}