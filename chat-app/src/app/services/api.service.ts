import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlayerImpl } from '../models/player.model';
import { firstValueFrom } from 'rxjs';

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

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      console.log('Making API request to /api/chat with:', requestBody);

      const response = await firstValueFrom(
        this.http.post<{ response: string }>('/api/chat', requestBody, { headers })
      );
      
      console.log('API response received:', response);
      return response?.response || `*${player.name} nods thoughtfully*`;
    } catch (error) {
      console.error('Error generating player response:', error);
      // Fallback to simple response if API fails
      return `*${player.name} nods thoughtfully*`;
    }
  }
}