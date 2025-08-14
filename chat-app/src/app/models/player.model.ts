import { Item } from './item.model';

export interface Trait {
  name: string;
  description: string;
  challenge: string;
}

export interface Player {
  name: string;
  description: string;
  imageUri: string;
  health: number;
  inventory: Item[];
  trait: Trait;
  challengeResolved: boolean;
  isAlive(): boolean;
}

export class PlayerImpl implements Player {
  constructor(
    public name: string,
    public description: string,
    public imageUri: string,
    public trait: Trait,
    public health: number = 3,
    public inventory: Item[] = [],
    public challengeResolved: boolean = false
  ) {}

  isAlive(): boolean {
    return this.health > 0;
  }
}