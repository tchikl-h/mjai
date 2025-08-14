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
    this.initializeFirstTurn();
  }

  private initializeFirstTurn(): void {
    const alivePlayers = this.players.filter(player => player.isAlive());
    
    if (alivePlayers.length === 0) {
      console.log('No players alive! Game over.');
      this.currentTurn = new TurnImpl([], 0, 1);
      return;
    }

    // Shuffle alive players randomly
    const shuffledPlayers = this.shuffleArray([...alivePlayers]);
    
    const turnOrder: (Player)[] = [];
    
    for (let i = 0; i < shuffledPlayers.length; i++) {
      turnOrder.push(shuffledPlayers[i]);
    }
    
    console.log(`Initial turn 1 generated with ${alivePlayers.length} alive players:`, turnOrder.map(p => p.name));
    this.currentTurn = new TurnImpl(turnOrder, 0, 1); // Start at turn 1
  }

  generateNewTurn(): void {
    const alivePlayers = this.players.filter(player => player.isAlive());
    
    if (alivePlayers.length === 0) {
      console.log('No players alive! Game over.');
      this.currentTurn = new TurnImpl([], 0, this.currentTurn.turnNumber);
      return;
    }

    // Shuffle alive players randomly
    const shuffledPlayers = this.shuffleArray([...alivePlayers]);
    
    const turnOrder: (Player)[] = [];
    
    for (let i = 0; i < shuffledPlayers.length; i++) {
      turnOrder.push(shuffledPlayers[i]);
    }
    
    const newTurnNumber = this.currentTurn.turnNumber + 1;
    console.log(`New turn ${newTurnNumber} generated with ${alivePlayers.length} alive players:`, turnOrder.map(p => p.name));
    this.currentTurn = new TurnImpl(turnOrder, 0, newTurnNumber);
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
    // Manual turn advancement - no automatic new turn generation
    const nextPlayer = this.currentTurn.nextPlayer();
    console.log(`Moving to next player: ${nextPlayer.name}`);
    return nextPlayer;
  }

  // New method for manual new turn generation when round is complete
  manualNextTurn(): void {
    const nextTurnNumber = this.currentTurn.turnNumber + 1;
    console.log(`Manually starting new turn ${nextTurnNumber}...`);
    this.generateNewTurn();
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

  setCurrentPlayer(player: Player): boolean {
    const turnOrder = this.currentTurn.turnOrder;
    const playerIndex = turnOrder.findIndex(p => p === player);
    
    if (playerIndex !== -1 && player.isAlive()) {
      this.currentTurn.currentPlayerIndex = playerIndex;
      console.log(`Manually set current player to: ${player.name}`);
      return true;
    } else if (!player.isAlive()) {
      console.log(`Cannot set current player to ${player.name}: player is not alive`);
      return false;
    } else {
      console.log(`Cannot set current player to ${player.name}: player not in current turn order`);
      return false;
    }
  }
}