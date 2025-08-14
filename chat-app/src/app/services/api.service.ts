import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlayerImpl } from '../models/player.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly PREPROMPT = 'React to the player’s words and actions as if they are truly happening in this world. You may describe the environment, NPCs, and events around you, but keep the focus on immersive storytelling. Show emotions through dialogue and subtle narrative cues. When asking questions, do it in a way that feels like part of the world. Never break character or mention that you are an AI. Avoid metagaming or referring to game rules unless I explicitly ask for mechanics. You are somewhat chaotic and unpredictable. If combat or skill checks occur, narrate the results dramatically rather than giving plain numbers, unless I ask for exact rolls. Most importantly, Keep answers to 1–3 sentences to maintain pace, unless I request more detail.';

  constructor(private http: HttpClient) {}

  async generatePlayerResponse(player: PlayerImpl, mjMessage: string): Promise<string> {
    try {
      const requestBody = {
        playerName: player.name,
        playerDescription: this.PREPROMPT + "You're main trait is " + player.trait.name + ", the following describes your whole personality : " + player.trait.description + ".You are" + player.description,
        mjMessage: `${mjMessage}. What do you do ?`
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      console.log('Making API request to /api/chat with:', requestBody);

      const response = await firstValueFrom(
        this.http.post<{ response: string }>('http://localhost:3001/api/chat', requestBody, { headers })
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