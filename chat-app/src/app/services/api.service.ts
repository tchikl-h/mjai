import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { PlayerImpl } from '../models/player.model';
import { ChatRequest, ChatResponse, ApiError, ApiRequestOptions } from '../interfaces/api.interfaces';
import { API_CONFIG } from '../config/api.config';
import { PromptBuilderService } from './prompt-builder.service';
import { LoggerService } from './logger.service';
import { ChatHistoryService } from './chat-history.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private promptBuilder: PromptBuilderService,
    private logger: LoggerService,
    private chatHistory: ChatHistoryService
  ) {}

  async generatePlayerResponse(
    player: PlayerImpl, 
    mjMessage: string, 
    options: ApiRequestOptions = {}
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      const request = this.buildChatRequest(player, mjMessage);
      
      // Log the full prompt details for debugging
      console.log(`🤖 Player Response Request for ${player.name}:`);
      console.log(`📝 Player Description: ${request.playerDescription}`);
      console.log(`💬 GM Message: ${request.mjMessage}`);
      console.log(`🕰️ Context: ${request.context || 'No context provided'}`);
      console.log('📦 Full Request:', request);
      
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

  private buildChatRequest(player: PlayerImpl, mjMessage: string, includeContext: boolean = true): ChatRequest {
    const request: ChatRequest = {
      playerName: player.name,
      playerDescription: this.promptBuilder.buildFullPlayerDescription(player, true),
      mjMessage: this.promptBuilder.buildMessagePrompt(mjMessage)
    };

    // Add conversation context for better AI responses
    if (includeContext) {
      try {
        // Use compact context to manage prompt length
        const context = this.chatHistory.getContext(player);
        
        if (context && context !== "This is the start of our adventure.") {
          request.context = `Recent conversation:\n${context}\n\nNow respond to the GM's latest message, staying in character and considering the conversation flow above.`;
        }
        
        this.logger.info(`Context generated for ${player.name}`, {
          contextLength: request.context?.length || 0,
          messageHistory: this.chatHistory.getCurrentSession().totalMessages
        });
      } catch (error) {
        this.logger.warn('Failed to generate context for API request', error);
        // Continue without context rather than fail the request
      }
    }

    return request;
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