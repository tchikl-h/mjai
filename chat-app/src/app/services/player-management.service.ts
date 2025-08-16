import { Injectable } from '@angular/core';
import { PlayerImpl } from '../models/player.model';
import { GameService } from './game.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerManagementService {
  
  constructor(
    private gameService: GameService,
    private logger: LoggerService
  ) {}

  /**
   * Add a new player to the game
   */
  addPlayer(playerData: Omit<PlayerImpl, 'isAlive'>): boolean {
    try {
      // Check if player name already exists
      const existingPlayers = this.gameService.getAllPlayers();
      const nameExists = existingPlayers.some(p => p.name.toLowerCase() === playerData.name.toLowerCase());
      
      if (nameExists) {
        this.logger.warn(`Player with name "${playerData.name}" already exists`);
        return false;
      }

      const newPlayer = new PlayerImpl(
        playerData.name,
        playerData.backstory,
        playerData.imageUri,
        playerData.traits,
        playerData.health,
        playerData.inventory,
        playerData.attacks,
        playerData.voiceId
      );

      // Add to existing players
      const currentPlayers = [...existingPlayers, newPlayer];
      this.gameService.setPlayers(currentPlayers);
      
      this.logger.info(`Player "${playerData.name}" added successfully`);
      return true;
    } catch (error) {
      this.logger.error('Failed to add player', error);
      return false;
    }
  }

  /**
   * Update an existing player
   */
  updatePlayer(originalName: string, updatedPlayerData: Omit<PlayerImpl, 'isAlive'>): boolean {
    try {
      const allPlayers = this.gameService.getAllPlayers();
      const playerIndex = allPlayers.findIndex(p => p.name === originalName);
      
      if (playerIndex === -1) {
        this.logger.warn(`Player "${originalName}" not found for update`);
        return false;
      }

      // Check if new name conflicts with existing players (excluding the current one)
      if (updatedPlayerData.name !== originalName) {
        const nameExists = allPlayers.some((p, index) => 
          index !== playerIndex && p.name.toLowerCase() === updatedPlayerData.name.toLowerCase()
        );
        
        if (nameExists) {
          this.logger.warn(`Player with name "${updatedPlayerData.name}" already exists`);
          return false;
        }
      }

      // Update the player
      const updatedPlayer = new PlayerImpl(
        updatedPlayerData.name,
        updatedPlayerData.backstory,
        updatedPlayerData.imageUri,
        updatedPlayerData.traits,
        updatedPlayerData.health,
        updatedPlayerData.inventory,
        updatedPlayerData.attacks,
        updatedPlayerData.voiceId
      );

      allPlayers[playerIndex] = updatedPlayer;
      this.gameService.setPlayers(allPlayers);
      
      this.logger.info(`Player "${originalName}" updated successfully`);
      return true;
    } catch (error) {
      this.logger.error('Failed to update player', error);
      return false;
    }
  }

  /**
   * Remove a player from the game
   */
  removePlayer(playerName: string): boolean {
    try {
      const allPlayers = this.gameService.getAllPlayers();
      const filteredPlayers = allPlayers.filter(p => p.name !== playerName);
      
      if (filteredPlayers.length === allPlayers.length) {
        this.logger.warn(`Player "${playerName}" not found for removal`);
        return false;
      }

      this.gameService.setPlayers(filteredPlayers);
      
      this.logger.info(`Player "${playerName}" removed successfully`);
      return true;
    } catch (error) {
      this.logger.error('Failed to remove player', error);
      return false;
    }
  }

  /**
   * Get a player by name
   */
  getPlayerByName(name: string): PlayerImpl | null {
    const allPlayers = this.gameService.getAllPlayers();
    return allPlayers.find(p => p.name === name) || null;
  }

  /**
   * Check if a player name is available
   */
  isPlayerNameAvailable(name: string, excludeName?: string): boolean {
    const allPlayers = this.gameService.getAllPlayers();
    return !allPlayers.some(p => 
      p.name.toLowerCase() === name.toLowerCase() && 
      p.name !== excludeName
    );
  }

  /**
   * Get all players for management
   */
  getAllPlayers(): PlayerImpl[] {
    return this.gameService.getAllPlayers();
  }
}