import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlayerImpl } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  async generatePlayerResponse(player: PlayerImpl, mjMessage: string): Promise<string> {
    try {
      const requestBody = {
        playerName: player.name,
        playerDescription: player.description,
        mjMessage: mjMessage
      };

      const response = await this.http.post<{ response: string }>('/api/chat', requestBody).toPromise();
      return response?.response || `*${player.name} nods thoughtfully*`;
    } catch (error) {
      console.error('Error generating player response:', error);
      // Fallback to simple response if API fails
      return `*${player.name} nods thoughtfully*`;
    }
  }
}