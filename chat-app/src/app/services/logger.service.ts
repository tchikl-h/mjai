import { Injectable } from '@angular/core';
import { ChatRequest, ChatResponse, ApiError } from '../interfaces/api.interfaces';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private currentLogLevel = LogLevel.INFO;

  constructor() {
    // Set log level based on environment
    this.currentLogLevel = this.isProduction() ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private isProduction(): boolean {
    // In a real app, this would check environment variables
    return false;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[API-DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`[API-INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[API-WARN] ${message}`, data || '');
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[API-ERROR] ${message}`, error || '');
    }
  }

  logApiRequest(request: ChatRequest): void {
    this.debug('Making API request', {
      playerName: request.playerName,
      messagePreview: request.mjMessage.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
  }

  logApiResponse(response: ChatResponse, duration: number): void {
    this.debug('API response received', {
      success: response.success !== false,
      responsePreview: response.response?.substring(0, 100) + '...',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }

  logApiError(error: ApiError): void {
    this.error('API request failed', {
      message: error.message,
      code: error.code,
      status: error.status,
      timestamp: error.timestamp.toISOString()
    });
  }
}