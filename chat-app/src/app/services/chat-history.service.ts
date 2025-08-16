import { Injectable } from '@angular/core';
import { PlayerImpl } from '../models/player.model';
import { I18nService } from './i18n.service';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'player' | 'mj';
  timestamp: Date;
  player?: PlayerImpl;
  playerName?: string; // Store player name separately for persistence
  turnNumber?: number;
  sessionId?: string;
}

export interface ChatSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  totalMessages: number;
  players: string[]; // Player names
  messages: ChatMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {
  private currentSession!: ChatSession;
  private allSessions: ChatSession[] = [];
  private messageIdCounter = 0;
  private readonly CURRENT_SESSION_KEY = 'mjai-current-session';
  private readonly ALL_SESSIONS_KEY = 'mjai-all-sessions';
  private readonly MESSAGE_COUNTER_KEY = 'mjai-message-counter';

  constructor(private i18n: I18nService) {
    // Load existing data from storage or initialize new session
    this.loadFromStorage();
  }

  private createNewSession(): ChatSession {
    const sessionId = this.generateSessionId();
    return {
      sessionId,
      startTime: new Date(),
      totalMessages: 0,
      players: [],
      messages: []
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    this.messageIdCounter++;
    return `msg_${this.currentSession.sessionId}_${this.messageIdCounter}`;
  }

  addMessage(
    text: string, 
    sender: 'player' | 'mj', 
    player?: PlayerImpl, 
    turnNumber?: number
  ): ChatMessage {
    const message: ChatMessage = {
      id: this.generateMessageId(),
      text,
      sender,
      timestamp: new Date(),
      player,
      playerName: player?.name,
      turnNumber,
      sessionId: this.currentSession.sessionId
    };

    // Add to current session
    this.currentSession.messages.push(message);
    this.currentSession.totalMessages++;

    // Track unique players in this session
    if (player && !this.currentSession.players.includes(player.name)) {
      this.currentSession.players.push(player.name);
    }

    console.log(`Chat History: Added message ${message.id}`, {
      sender: message.sender,
      playerName: message.playerName,
      turnNumber: message.turnNumber,
      totalMessages: this.currentSession.totalMessages
    });

    // Save to storage after adding message
    this.saveToStorage();

    return message;
  }

  getCurrentSession(): ChatSession {
    return this.currentSession;
  }

  getAllMessages(): ChatMessage[] {
    return [...this.currentSession.messages];
  }

  getMessagesByPlayer(playerName: string): ChatMessage[] {
    return this.currentSession.messages.filter(
      msg => msg.playerName === playerName
    );
  }

  getMessagesBySender(sender: 'player' | 'mj'): ChatMessage[] {
    return this.currentSession.messages.filter(
      msg => msg.sender === sender
    );
  }

  getMessagesInTurn(turnNumber: number): ChatMessage[] {
    return this.currentSession.messages.filter(
      msg => msg.turnNumber === turnNumber
    );
  }

  getMessagesByTimeRange(startTime: Date, endTime: Date): ChatMessage[] {
    return this.currentSession.messages.filter(
      msg => msg.timestamp >= startTime && msg.timestamp <= endTime
    );
  }

  searchMessages(query: string): ChatMessage[] {
    const lowerQuery = query.toLowerCase();
    return this.currentSession.messages.filter(
      msg => msg.text.toLowerCase().includes(lowerQuery)
    );
  }

  getSessionStats(): {
    totalMessages: number;
    playerMessages: number;
    mjMessages: number;
    uniquePlayers: number;
    sessionDuration: number; // in minutes
    averageMessageLength: number;
  } {
    const playerMessages = this.getMessagesBySender('player').length;
    const mjMessages = this.getMessagesBySender('mj').length;
    const sessionDuration = (Date.now() - this.currentSession.startTime.getTime()) / (1000 * 60);
    const averageMessageLength = this.currentSession.messages.length > 0 
      ? this.currentSession.messages.reduce((sum, msg) => sum + msg.text.length, 0) / this.currentSession.messages.length 
      : 0;

    return {
      totalMessages: this.currentSession.totalMessages,
      playerMessages,
      mjMessages,
      uniquePlayers: this.currentSession.players.length,
      sessionDuration: Math.round(sessionDuration * 100) / 100,
      averageMessageLength: Math.round(averageMessageLength)
    };
  }

  exportChatHistory(): string {
    const session = this.currentSession;
    const exportData = {
      sessionInfo: {
        sessionId: session.sessionId,
        startTime: session.startTime,
        endTime: new Date(),
        totalMessages: session.totalMessages,
        players: session.players
      },
      messages: session.messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
        playerName: msg.playerName,
        turnNumber: msg.turnNumber
      })),
      stats: this.getSessionStats()
    };

    return JSON.stringify(exportData, null, 2);
  }

  clearCurrentSession(): void {
    // Archive current session
    this.currentSession.endTime = new Date();
    this.allSessions.push({ ...this.currentSession });
    
    // Start new session
    this.currentSession = this.createNewSession();
    this.messageIdCounter = 0;
    
    // Save to storage after clearing session
    this.saveToStorage();
    
    console.log('Chat History: Session cleared and new session started');
  }

  private getLocalizedText(key: string): string {
    const lang = this.i18n.language();
    
    const texts: Record<string, { en: string; fr: string }> = {
      'conversation_beginning': {
        en: 'This is the beginning of the conversation.',
        fr: 'Ceci est le début de la conversation.'
      },
      'adventure_start': {
        en: 'This is the start of our adventure.',
        fr: 'Ceci est le début de notre aventure.'
      },
      'turn_just_started': {
        en: 'This turn just started.',
        fr: 'Ce tour vient de commencer.'
      },
      'gm_told': {
        en: 'The GM told:',
        fr: 'Le MJ a dit :'
      },
      'you_responded': {
        en: 'You responded:',
        fr: 'Tu as répondu :'
      },
      'player_responded': {
        en: 'A player responded:',
        fr: 'Un joueur a répondu :'
      },
      'teammate_responded': {
        en: 'Your teammate',
        fr: 'Ton coéquipier'
      },
      'end_conversation': {
        en: '[End of recent conversation - What do you do/respond ?]',
        fr: '[Fin de conversation récente - Que fais-tu/que réponds-tu ?]'
      },
      'recent_context': {
        en: 'Recent conversation context - showing last',
        fr: 'Contexte de conversation récente - affichage des'
      },
      'of_messages': {
        en: 'of',
        fr: 'sur'
      },
      'messages': {
        en: 'messages',
        fr: 'messages'
      },
      'conversation_context': {
        en: 'Conversation context',
        fr: 'Contexte de conversation'
      },
      'turn': {
        en: 'Turn',
        fr: 'Tour'
      },
      'turn_so_far': {
        en: 'so far',
        fr: 'jusqu\'à présent'
      },
      'gm_said': {
        en: 'The GM said',
        fr: 'Le MJ a dit'
      },
      'you_said': {
        en: 'You said',
        fr: 'Tu as dit'
      },
      'companion_said': {
        en: 'Your companion named',
        fr: 'Ton compagnon nommé'
      },
      'said': {
        en: 'said',
        fr: 'a dit'
      }
    };

    return texts[key]?.[lang] || texts[key]?.en || key;
  }

  getAllSessions(): ChatSession[] {
    return [...this.allSessions];
  }

  getLastNMessages(n: number): ChatMessage[] {
    const messages = this.currentSession.messages;
    return messages.slice(-n);
  }

  removeMessage(messageId: string): boolean {
    const index = this.currentSession.messages.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      this.currentSession.messages.splice(index, 1);
      this.currentSession.totalMessages--;
      this.saveToStorage();
      console.log(`Chat History: Removed message ${messageId}`);
      return true;
    }
    return false;
  }

  updateMessage(messageId: string, newText: string): boolean {
    const message = this.currentSession.messages.find(msg => msg.id === messageId);
    if (message) {
      message.text = newText;
      this.saveToStorage();
      console.log(`Chat History: Updated message ${messageId}`);
      return true;
    }
    return false;
  }

  /**
   * Get conversation context for AI - formats the last N messages into a coherent context string
   * @param player The player requesting context (for personalized formatting)
   * @param messageCount Number of recent messages to include (default: 15)
   * @param includeTurnInfo Whether to include turn numbers for better context (default: false)
   * @returns Formatted context string ready for AI prompts
   */
  getContext(player: PlayerImpl, messageCount: number = 15, includeTurnInfo: boolean = false): string {
    // Get the last N messages
    const recentMessages = this.getLastNMessages(messageCount);
    
    if (recentMessages.length === 0) {
      return this.getLocalizedText('conversation_beginning');
    }

    // Build context string
    const contextLines: string[] = [];
    
    // Add context header
    if (recentMessages.length === messageCount && this.currentSession.totalMessages > messageCount) {
      const recentContext = this.getLocalizedText('recent_context');
      const ofText = this.getLocalizedText('of_messages');
      const messagesText = this.getLocalizedText('messages');
      contextLines.push(`[${recentContext} ${messageCount} ${ofText} ${this.currentSession.totalMessages} ${messagesText}]\n`);
    } else if (this.currentSession.totalMessages > 1) {
      const conversationContext = this.getLocalizedText('conversation_context');
      const messagesText = this.getLocalizedText('messages');
      contextLines.push(`[${conversationContext} - ${recentMessages.length} ${messagesText}]\n`);
    }

    // Process messages chronologically (already in order)
    let lastTurnNumber = -1;
    
    recentMessages.forEach((message, index) => {
      let prefix = '';
      let turnIndicator = '';
      
      // Add turn separator if turn changed and we're including turn info
      if (includeTurnInfo && message.turnNumber && message.turnNumber !== lastTurnNumber) {
        if (lastTurnNumber !== -1) {
          contextLines.push(''); // Empty line between turns
        }
        const turnText = this.getLocalizedText('turn');
        turnIndicator = `[${turnText} ${message.turnNumber}] `;
        lastTurnNumber = message.turnNumber;
      }
      
      // Determine message prefix based on sender and player
      if (message.sender === 'mj') {
        prefix = this.getLocalizedText('gm_told') + ' ';
      } else if (message.playerName === player.name) {
        prefix = this.getLocalizedText('you_responded') + ' ';
      } else if (message.playerName) {
        const teammateText = this.getLocalizedText('teammate_responded');
        const respondedText = this.getLocalizedText('you_responded').replace('You responded:', 'responded:').replace('Tu as répondu :', 'a répondu :');
        prefix = `${teammateText} ${message.playerName} ${respondedText} `;
      } else {
        // Fallback for messages without player name
        prefix = this.getLocalizedText('player_responded') + ' ';
      }
      
      // Clean up message text (remove excessive whitespace, normalize)
      const cleanText = message.text.replace(/\s+/g, ' ').trim();
      
      // Build the formatted message line
      const messageLine = `${turnIndicator}${prefix}"${cleanText}"`;
      contextLines.push(messageLine);
    });
    
    // Add footer to indicate this is the current state
    contextLines.push('');
    contextLines.push(this.getLocalizedText('end_conversation'));
    
    const context = contextLines.join('\n');
    
    // Log context creation for debugging
    console.log(`Chat Context: Generated context for ${player.name}`, {
      messageCount: recentMessages.length,
      contextLength: context.length,
      includedTurns: includeTurnInfo ? `${Math.min(...recentMessages.filter(m => m.turnNumber).map(m => m.turnNumber!))} - ${Math.max(...recentMessages.filter(m => m.turnNumber).map(m => m.turnNumber!))}` : 'N/A'
    });
    
    return context;
  }

  /**
   * Get a more compact context focused on the current conversation flow
   * Useful when token limits are a concern
   */
  getCompactContext(player: PlayerImpl, messageCount: number = 10): string {
    const recentMessages = this.getLastNMessages(messageCount);
    
    if (recentMessages.length === 0) {
      return this.getLocalizedText('adventure_start');
    }

    const contextParts: string[] = [];
    
    recentMessages.forEach(message => {
      let speaker = '';
      if (message.sender === 'mj') {
        speaker = 'GM';
      } else if (message.playerName === player.name) {
        speaker = 'You';
      } else if (message.playerName) {
        speaker = message.playerName;
      } else {
        speaker = 'Player';
      }
      
      const cleanText = message.text.replace(/\s+/g, ' ').trim();
      // Limit message length to avoid bloat
      const truncatedText = cleanText.length > 150 ? cleanText.substring(0, 147) + '...' : cleanText;
      
      contextParts.push(`${speaker}: "${truncatedText}"`);
    });
    
    return contextParts.join('\n');
  }

  /**
   * Get context specifically for the current turn/scene
   * Focuses on messages from the current turn number
   */
  getCurrentTurnContext(player: PlayerImpl, currentTurnNumber: number): string {
    const turnMessages = this.getMessagesInTurn(currentTurnNumber);
    
    if (turnMessages.length === 0) {
      return this.getLocalizedText('turn_just_started');
    }

    const turnText = this.getLocalizedText('turn');
    const soFarText = this.getLocalizedText('turn_so_far');
    const contextParts: string[] = [`[${turnText} ${currentTurnNumber} ${soFarText}]`];
    
    turnMessages.forEach(message => {
      let speaker = '';
      if (message.sender === 'mj') {
        speaker = this.getLocalizedText('gm_said');
      } else if (message.playerName === player.name) {
        speaker = this.getLocalizedText('you_said');
      } else if (message.playerName) {
        const companionText = this.getLocalizedText('companion_said');
        const saidText = this.getLocalizedText('said');
        speaker = `${companionText} ${message.playerName} ${saidText}`;
      }
      
      const cleanText = message.text.replace(/\s+/g, ' ').trim();
      contextParts.push(`${speaker}: "${cleanText}"`);
    });
    
    return contextParts.join('\n');
  }

  /**
   * Get messages in AI SDK format for streamText function
   * Converts chat history to the format expected by AI SDK: { role: 'user' | 'assistant', content: string }[]
   * @param messageCount Number of recent messages to include (default: 20)
   * @param currentPlayer Optional current player to personalize message roles
   * @returns Array of messages in AI SDK format
   */
  getMessages(messageCount: number = 20, currentPlayer?: PlayerImpl): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    const lang = this.i18n.language();
    
    // Get recent messages from chat history
    const recentMessages = this.getLastNMessages(messageCount);
    
    // Convert chat messages to AI SDK format
    recentMessages.forEach(message => {
      if (message.sender === 'mj') {
        // GM messages are treated as user messages (driving the conversation)
        const gmPrefix = lang === 'fr' ? 'Le MJ a dit' : 'The GM said';
        messages.push({
          role: 'user',
          content: `${gmPrefix}: ${message.text}`
        });
      } else if (message.sender === 'player') {
        // Determine role and identifier based on whether this is the current player
        let playerIdentifier = '';
        let role: 'user' | 'assistant' = 'assistant';
        
        if (currentPlayer && message.playerName === currentPlayer.name) {
          // This is the current player's own message
          role = 'assistant';
          if (lang === 'fr') {
            playerIdentifier = '';
          } else {
            playerIdentifier = '';
          }
        } else {
          // This is a teammate's message
          role = 'user'; // Teammates' messages are treated as user input for context
          if (message.playerName) {
            if (lang === 'fr') {
              playerIdentifier = `Ton coéquipier ${message.playerName} a dit: `;
            } else {
              playerIdentifier = `Your teammate ${message.playerName} said: `;
            }
          } else {
            if (lang === 'fr') {
              playerIdentifier = 'Ton coéquipier a dit: ';
            } else {
              playerIdentifier = 'Your teammate said: ';
            }
          }
        }
        
        messages.push({
          role,
          content: `${playerIdentifier}${message.text}`
        });
      }
    });
    
    // Log for debugging
    console.log(`Chat History: Generated ${messages.length} messages for AI SDK`, {
      chatMessages: recentMessages.length,
      totalLength: messages.reduce((sum, msg) => sum + msg.content.length, 0),
      language: lang,
      currentPlayer: currentPlayer?.name || 'none provided'
    });
    
    return messages;
  }

  /**
   * Save current session and message counter to local storage
   */
  private saveToStorage(): void {
    try {
      // Convert dates to ISO strings for serialization
      const serializableSession = {
        ...this.currentSession,
        startTime: this.currentSession.startTime.toISOString(),
        endTime: this.currentSession.endTime?.toISOString(),
        messages: this.currentSession.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
          // Remove player object reference to avoid circular serialization
          player: undefined
        }))
      };

      localStorage.setItem(this.CURRENT_SESSION_KEY, JSON.stringify(serializableSession));
      localStorage.setItem(this.MESSAGE_COUNTER_KEY, this.messageIdCounter.toString());

      // Save all sessions
      const serializableAllSessions = this.allSessions.map(session => ({
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
          player: undefined
        }))
      }));

      localStorage.setItem(this.ALL_SESSIONS_KEY, JSON.stringify(serializableAllSessions));
      
      console.log('Chat History: Saved to local storage');
    } catch (error) {
      console.error('Failed to save chat history to local storage:', error);
    }
  }

  /**
   * Load session data from local storage
   */
  private loadFromStorage(): void {
    try {
      // Load message counter
      const savedCounter = localStorage.getItem(this.MESSAGE_COUNTER_KEY);
      if (savedCounter) {
        this.messageIdCounter = parseInt(savedCounter, 10) || 0;
      }

      // Load current session
      const savedCurrentSession = localStorage.getItem(this.CURRENT_SESSION_KEY);
      if (savedCurrentSession) {
        const parsedSession = JSON.parse(savedCurrentSession);
        
        // Convert ISO strings back to Date objects
        this.currentSession = {
          ...parsedSession,
          startTime: new Date(parsedSession.startTime),
          endTime: parsedSession.endTime ? new Date(parsedSession.endTime) : undefined,
          messages: parsedSession.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        };

        console.log(`Chat History: Loaded current session with ${this.currentSession.messages.length} messages`);
      } else {
        // No saved session, create new one
        this.currentSession = this.createNewSession();
      }

      // Load all sessions
      const savedAllSessions = localStorage.getItem(this.ALL_SESSIONS_KEY);
      if (savedAllSessions) {
        const parsedSessions = JSON.parse(savedAllSessions);
        
        this.allSessions = parsedSessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));

        console.log(`Chat History: Loaded ${this.allSessions.length} archived sessions`);
      }

    } catch (error) {
      console.error('Failed to load chat history from local storage:', error);
      // Fall back to creating a new session
      this.currentSession = this.createNewSession();
      this.allSessions = [];
      this.messageIdCounter = 0;
    }
  }

  /**
   * Clear all chat history from local storage
   */
  clearStoredHistory(): void {
    try {
      localStorage.removeItem(this.CURRENT_SESSION_KEY);
      localStorage.removeItem(this.ALL_SESSIONS_KEY);
      localStorage.removeItem(this.MESSAGE_COUNTER_KEY);
      console.log('Chat History: Cleared from local storage');
    } catch (error) {
      console.error('Failed to clear chat history from local storage:', error);
    }
  }
}