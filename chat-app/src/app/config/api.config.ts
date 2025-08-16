export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  ENDPOINTS: {
    CHAT: '/api/chat',
    VOICE_DESIGN: '/api/voice-design'
  },
  TIMEOUTS: {
    DEFAULT: 30000, // 30 seconds
    CHAT: 45000     // 45 seconds for chat responses
  }
};

