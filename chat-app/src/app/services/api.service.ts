import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PlayerImpl } from '../models/player.model';
import { ChatRequest, ChatResponse, ApiError, ApiRequestOptions } from '../interfaces/api.interfaces';
import { API_CONFIG } from '../config/api.config';
import { PromptBuilderService } from './prompt-builder.service';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private promptBuilder: PromptBuilderService,
    private logger: LoggerService
  ) {}

  async generatePlayerResponse(
    player: PlayerImpl, 
    mjMessage: string, 
    options: ApiRequestOptions = {}
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      const request = this.buildChatRequest(player, mjMessage);
      this.logger.logApiRequest(request);

      const response = await this.makeChatRequest(request, options);
      
      const duration = Date.now() - startTime;
      this.logger.logApiResponse(response, duration);

      return this.extractResponseText(response, player);

    } catch (error) {
      const apiError = this.handleApiError(error);
      this.logger.logApiError(apiError);
      
      return this.promptBuilder.getRandomFallbackResponse(player.name);
    }
  }

  private buildChatRequest(player: PlayerImpl, mjMessage: string): ChatRequest {
    return {
      playerName: player.name,
      playerDescription: this.promptBuilder.buildFullPlayerDescription(player, true),
      mjMessage: this.promptBuilder.buildMessagePrompt(mjMessage)
    };
  }

  private async makeChatRequest(
    request: ChatRequest, 
    options: ApiRequestOptions
  ): Promise<ChatResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const timeoutMs = options.timeout || API_CONFIG.TIMEOUTS.CHAT;
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`;

    return await firstValueFrom(
      this.http.post<ChatResponse>(url, request, { headers }).pipe(
        timeout(timeoutMs),
        catchError(this.handleHttpError.bind(this))
      )
    );
  }

  private extractResponseText(response: ChatResponse, player: PlayerImpl): string {
    if (!response || !response.response) {
      this.logger.warn('Empty response received from API');
      return this.promptBuilder.getRandomFallbackResponse(player.name);
    }

    return response.response.trim();
  }

  private handleHttpError(error: HttpErrorResponse) {
    this.logger.error('HTTP error occurred', error);
    return throwError(() => error);
  }

  private handleApiError(error: any): ApiError {
    const apiError: ApiError = {
      message: 'Unknown API error',
      timestamp: new Date()
    };

    if (error instanceof HttpErrorResponse) {
      apiError.message = error.message || 'HTTP request failed';
      apiError.status = error.status;
      apiError.code = error.error?.code || error.statusText;
    } else if (error.name === 'TimeoutError') {
      apiError.message = 'API request timed out';
      apiError.code = 'TIMEOUT';
    } else if (error instanceof Error) {
      apiError.message = error.message;
    } else {
      apiError.message = String(error);
    }

    return apiError;
  }

  // Utility method for testing API connectivity
  async testApiConnection(): Promise<boolean> {
    try {
      this.logger.info('Testing API connection...');
      // Could add a health check endpoint here
      return true;
    } catch (error) {
      this.logger.error('API connection test failed', error);
      return false;
    }
  }
}