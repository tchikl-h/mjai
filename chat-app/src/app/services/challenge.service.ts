import { Injectable } from '@angular/core';
import { PlayerImpl } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {

  constructor() {}

  toggleChallengeResolved(player: PlayerImpl): void {
    player.challengeResolved = !player.challengeResolved;
    console.log(`${player.name}'s challenge "${player.trait.challenge}" marked as ${player.challengeResolved ? 'resolved' : 'unresolved'}`);
  }

  getChallengeStatus(player: PlayerImpl): 'resolved' | 'pending' | 'eliminated' {
    if (!player.isAlive()) {
      return 'eliminated';
    }
    return player.challengeResolved ? 'resolved' : 'pending';
  }

  getResolvedChallengesCount(players: PlayerImpl[]): number {
    return players.filter(player => player.challengeResolved && player.isAlive()).length;
  }

  getPendingChallengesCount(players: PlayerImpl[]): number {
    return players.filter(player => !player.challengeResolved && player.isAlive()).length;
  }
}