import { Item } from './item.model';

export interface Player {
  name: string;
  description: string;
  imageUri: string;
  health: number;
  inventory: Item[];
  isAlive(): boolean;
}

export class PlayerImpl implements Player {
  constructor(
    public name: string,
    public description: string,
    public imageUri: string,
    public health: number = 3,
    public inventory: Item[] = []
  ) {}

  isAlive(): boolean {
    return this.health > 0;
  }
}