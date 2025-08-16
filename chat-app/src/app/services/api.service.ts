import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { PlayerImpl } from '../models/player.model';
import { ChatRequest, ChatResponse, ApiError, ApiRequestOptions } from '../interfaces/api.interfaces';
import { API_CONFIG } from '../config/api.config';
import { PromptBuilderService } from './prompt-builder.service';
import { LoggerService } from './logger.service';
import { ChatHistoryService } from './chat-history.service';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private promptBuilder: PromptBuilderService,
    private logger: LoggerService,
    private chatHistory: ChatHistoryService,
    private gameService: GameService
  ) {}

  generatePlayerResponseStream(
    player: PlayerImpl, 
    options: ApiRequestOptions = {}
  ): Observable<{ sentence: string; isComplete: boolean; fullResponse?: string }> {
    const subject = new Subject<{ sentence: string; isComplete: boolean; fullResponse?: string }>();
    
    const startTime = Date.now();
    
    const request = this.buildChatRequest(player);
    
    // Log the request
    console.log(`🤖 Streaming Player Response Request for ${player.name}:`);
    console.log(`📝 Player Description: ${request.playerDescription}`);
    console.log(`💬 Messages: ${request.messages?.length || 0} messages provided`);
    if (request.messages && request.messages.length > 0) {
      console.log(`📊 Messages summary:`, {
        totalMessages: request.messages.length,
        systemMessages: request.messages.filter(m => m.role === 'system').length,
        userMessages: request.messages.filter(m => m.role === 'user').length,
        assistantMessages: request.messages.filter(m => m.role === 'assistant').length
      });
    }
    
    this.logger.logApiRequest(request);

    this.makeStreamingChatRequest(request, options, subject, player, startTime);
    
    return subject.asObservable();
  }

  private buildChatRequest(player: PlayerImpl, includeMessages: boolean = true): ChatRequest {
    const allPlayers = this.gameService.getAllPlayers() as PlayerImpl[];
    const request: ChatRequest = {
      playerName: player.name,
      playerDescription: this.promptBuilder.buildFullPlayerDescription(player, true, allPlayers)
    };

    // Add conversation messages for better AI responses
    if (includeMessages) {
      try {
        // Get the latest 20 messages in AI SDK format, personalized for the current player
        const messages = this.chatHistory.getMessages(20, player);
        
        if (messages && messages.length > 0) {
          request.messages = messages;
        }
        
        this.logger.info(`Messages generated for ${player.name}`, {
          messageCount: messages?.length || 0,
          totalLength: messages?.reduce((sum, msg) => sum + msg.content.length, 0) || 0,
          messageHistory: this.chatHistory.getCurrentSession().totalMessages
        });
      } catch (error) {
        this.logger.warn('Failed to generate messages for API request', error);
        // Continue without messages rather than fail the request
      }
    }

    return request;
  }
  
  private async makeStreamingChatRequest(
    request: ChatRequest,
    options: ApiRequestOptions,
    subject: Subject<{ sentence: string; isComplete: boolean; fullResponse?: string }>,
    player: PlayerImpl,
    startTime: number
  ): Promise<void> {
    const timeoutMs = options.timeout || API_CONFIG.TIMEOUTS.CHAT;
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        subject.error(new Error('Request timeout'));
      }, timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let currentSentence = '';

      const readStream = async (): Promise<void> => {
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            // Send any remaining sentence and mark as complete
            if (currentSentence.trim()) {
              subject.next({ sentence: currentSentence.trim(), isComplete: false });
            }
            
            const duration = Date.now() - startTime;
            this.logger.logApiResponse({ response: fullResponse }, duration);
            
            subject.next({ sentence: '', isComplete: true, fullResponse: fullResponse.trim() });
            subject.complete();
            return;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          
          // Parse SSE format - look for data: lines
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // Remove 'data: ' prefix
              if (data === '[DONE]') {
                // Send any remaining sentence and mark as complete
                if (currentSentence.trim()) {
                  subject.next({ sentence: currentSentence.trim(), isComplete: false });
                }
                
                const duration = Date.now() - startTime;
                this.logger.logApiResponse({ response: fullResponse }, duration);
                
                subject.next({ sentence: '', isComplete: true, fullResponse: fullResponse.trim() });
                subject.complete();
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                let token = '';
                
                // Extract token from various response formats
                if (parsed.token) {
                  token = parsed.token;
                } else if (parsed.delta?.content) {
                  token = parsed.delta.content;
                } else if (parsed.choices?.[0]?.delta?.content) {
                  token = parsed.choices[0].delta.content;
                }
                
                if (token) {
                  fullResponse += token;
                  currentSentence += token;
                  
                  // Check if we have a complete sentence
                  const sentences = this.extractCompleteSentences(currentSentence);
                  if (sentences.completeSentences.length > 0) {
                    // Send complete sentences
                    for (const sentence of sentences.completeSentences) {
                      subject.next({ sentence: sentence.trim(), isComplete: false });
                    }
                    // Keep the remaining incomplete part
                    currentSentence = sentences.remainder;
                  }
                }
              } catch (parseError) {
                // If it's not JSON, it might be plain text token
                if (data.trim() && data !== '') {
                  fullResponse += data;
                  currentSentence += data;
                  
                  // Check for complete sentences
                  const sentences = this.extractCompleteSentences(currentSentence);
                  if (sentences.completeSentences.length > 0) {
                    for (const sentence of sentences.completeSentences) {
                      subject.next({ sentence: sentence.trim(), isComplete: false });
                    }
                    currentSentence = sentences.remainder;
                  }
                }
              }
            }
          }

          // Continue reading
          return readStream();
        } catch (error) {
          reader.releaseLock();
          const apiError = this.handleApiError(error);
          this.logger.logApiError(apiError);
          subject.error(error);
        }
      };

      return readStream();
    } catch (error) {
      const apiError = this.handleApiError(error);
      this.logger.logApiError(apiError);
      subject.error(error);
    }
  }

  private extractCompleteSentences(text: string): { completeSentences: string[], remainder: string } {
    // Split on sentence ending punctuation (.!?) followed by space or end of string
    const sentenceRegex = /([.!?]+(?:\s|$))/;
    const parts = text.split(sentenceRegex);
    
    const completeSentences: string[] = [];
    let remainder = '';
    
    // Process parts in pairs (sentence + delimiter)
    for (let i = 0; i < parts.length - 1; i += 2) {
      const sentence = parts[i];
      const delimiter = parts[i + 1];
      
      if (delimiter && sentenceRegex.test(delimiter)) {
        // This is a complete sentence
        completeSentences.push(sentence + delimiter.trim());
      } else {
        // This is incomplete, add to remainder
        remainder += sentence + (delimiter || '');
      }
    }
    
    // Add the last part if it exists and wasn't processed
    if (parts.length % 2 === 1) {
      remainder += parts[parts.length - 1];
    }
    
    return { completeSentences, remainder };
  }

  private extractResponseText(response: ChatResponse, player: PlayerImpl): string {
    if (!response || !response.response) {
      this.logger.warn('Empty response received from API');
      return this.promptBuilder.getRandomFallbackResponse(player.name);
    }

    return response.response.trim();
  }

  private handleHttpError(error: any) {
    this.logger.error('HTTP error occurred', error);
    throw error;
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