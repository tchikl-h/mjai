export interface ChatRequest {
  playerName: string;
  playerDescription: string;
  context?: string; // Deprecated - use messages instead
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
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

export interface VoiceDesignRequest {
  voice_description: string;
  model_id: string;
  text: string;
  auto_generate_text: boolean;
  loudness: number;
  seed: number;
  guidance_scale: number;
  stream_previews: boolean;
  quality: number;
  reference_audio_base64?: string;
  prompt_strength?: number;
}

export interface VoiceDesignResponse {
  audio_base64?: string;
  success: boolean;
  error?: string;
}