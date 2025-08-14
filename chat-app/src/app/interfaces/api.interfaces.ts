export interface ChatRequest {
  playerName: string;
  playerDescription: string;
  mjMessage: string;
  context?: string; // Conversation context for better AI responses
}

export interface ChatResponse {
  response: string;
  success?: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  timestamp: Date;
}

export interface ApiRequestOptions {
  timeout?: number;
  retryAttempts?: number;
  skipLogging?: boolean;
}