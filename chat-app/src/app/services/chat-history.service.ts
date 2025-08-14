import { Injectable } from '@angular/core';
import { PlayerImpl } from '../models/player.model';

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
  private currentSession: ChatSession;
  private allSessions: ChatSession[] = [];
  private messageIdCounter = 0;

  constructor() {
    // Initialize a new session
    this.currentSession = this.createNewSession();
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
    
    console.log('Chat History: Session cleared and new session started');
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
      console.log(`Chat History: Removed message ${messageId}`);
      return true;
    }
    return false;
  }

  updateMessage(messageId: string, newText: string): boolean {
    const message = this.currentSession.messages.find(msg => msg.id === messageId);
    if (message) {
      message.text = newText;
      console.log(`Chat History: Updated message ${messageId}`);
      return true;
    }
    return false;
  }

  /**
   * Get conversation context for AI - formats the last N messages into a coherent context string
   * @param player The player requesting context (for personalized formatting)
   * @param messageCount Number of recent messages to include (default: 15)
   * @param includeTurnInfo Whether to include turn numbers for better context (default: true)
   * @returns Formatted context string ready for AI prompts
   */
  getContext(player: PlayerImpl, messageCount: number = 15, includeTurnInfo: boolean = true): string {
    // Get the last N messages
    const recentMessages = this.getLastNMessages(messageCount);
    
    if (recentMessages.length === 0) {
      return "This is the beginning of the conversation.";
    }

    // Build context string
    const contextLines: string[] = [];
    
    // Add context header
    if (recentMessages.length === messageCount && this.currentSession.totalMessages > messageCount) {
      contextLines.push(`[Recent conversation context - showing last ${messageCount} of ${this.currentSession.totalMessages} messages]\n`);
    } else if (this.currentSession.totalMessages > 1) {
      contextLines.push(`[Conversation context - ${recentMessages.length} messages]\n`);
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
        turnIndicator = `[Turn ${message.turnNumber}] `;
        lastTurnNumber = message.turnNumber;
      }
      
      // Determine message prefix based on sender and player
      if (message.sender === 'mj') {
        prefix = 'The GM told: ';
      } else if (message.playerName === player.name) {
        prefix = 'You responded: ';
      } else if (message.playerName) {
        prefix = `${message.playerName} responded: `;
      } else {
        // Fallback for messages without player name
        prefix = 'A player responded: ';
      }
      
      // Clean up message text (remove excessive whitespace, normalize)
      const cleanText = message.text.replace(/\s+/g, ' ').trim();
      
      // Build the formatted message line
      const messageLine = `${turnIndicator}${prefix}"${cleanText}"`;
      contextLines.push(messageLine);
    });
    
    // Add footer to indicate this is the current state
    contextLines.push('');
    contextLines.push('[End of recent conversation - you are now responding to the latest GM message]');
    
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
      return "This is the start of our adventure.";
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
      return "This turn just started.";
    }

    const contextParts: string[] = [`[Turn ${currentTurnNumber} so far]`];
    
    turnMessages.forEach(message => {
      let speaker = '';
      if (message.sender === 'mj') {
        speaker = 'The GM said';
      } else if (message.playerName === player.name) {
        speaker = 'You said';
      } else if (message.playerName) {
        speaker = `${message.playerName} said`;
      }
      
      const cleanText = message.text.replace(/\s+/g, ' ').trim();
      contextParts.push(`${speaker}: "${cleanText}"`);
    });
    
    return contextParts.join('\n');
  }
}