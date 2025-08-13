import { Player } from './player.model';

export interface Turn {
  turnOrder: Player[];
  currentPlayerIndex: number;
  turnNumber: number;
  getCurrentPlayer(): Player;
  nextPlayer(): Player;
}

export class TurnImpl implements Turn {
  constructor(
    public turnOrder: Player[] = [],
    public currentPlayerIndex: number = 0,
    public turnNumber: number = 1
  ) {}

  getCurrentPlayer(): Player {
    return this.turnOrder[this.currentPlayerIndex];
  }

  nextPlayer(): Player {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.turnOrder.length;
    if (this.currentPlayerIndex === 0) {
      this.turnNumber++;
    }
    console.log(this.getCurrentPlayer().name+ " is playing")
    return this.getCurrentPlayer();
  }

  isNewTurnStarting(): boolean {
    return this.currentPlayerIndex === 0;
  }
}