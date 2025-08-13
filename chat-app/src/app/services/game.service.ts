import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { Turn, TurnImpl } from '../models/turn.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private players: Player[] = [];
  private currentTurn: TurnImpl = new TurnImpl();

  constructor() {}

  setPlayers(players: Player[]): void {
    this.players = players;
    this.generateNewTurn();
  }

  generateNewTurn(): void {
    const alivePlayers = this.players.filter(player => player.isAlive());
    
    if (alivePlayers.length === 0) {
      this.currentTurn = new TurnImpl([], 0, this.currentTurn.turnNumber);
      return;
    }

    // Shuffle alive players randomly
    const shuffledPlayers = this.shuffleArray([...alivePlayers]);
    
    const turnOrder: (Player)[] = [];
    
    for (let i = 0; i < shuffledPlayers.length; i++) {
      turnOrder.push(shuffledPlayers[i]);
    }
    console.log(turnOrder);
    this.currentTurn = new TurnImpl(turnOrder, 0, this.currentTurn.turnNumber);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getCurrentTurn(): TurnImpl {
    return this.currentTurn;
  }

  nextPlayer(): Player {
    const nextPlayer = this.currentTurn.nextPlayer();
    
    // Check if we're starting a new turn (currentPlayerIndex wrapped to 0)
    if (this.currentTurn.isNewTurnStarting()) {
      console.log("New turn starting! Generating new turn order...");
      this.generateNewTurn();
      return this.currentTurn.getCurrentPlayer();
    }
    
    return nextPlayer;
  }

  getAlivePlayers(): Player[] {
    return this.players.filter(player => player.isAlive());
  }

  getAllPlayers(): Player[] {
    return this.players;
  }

  startNewTurn(): void {
    this.generateNewTurn();
  }
}