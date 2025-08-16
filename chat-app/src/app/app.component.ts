import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PlayerImpl } from './models/player.model';
import { GameService } from './services/game.service';
import { ApiService } from './services/api.service';
import { ChatHistoryService } from './services/chat-history.service';
import { DiceComponent } from './dice/dice.component';
import { PlayerCardComponent } from './components/player-card/player-card.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { PlayerModalComponent } from './components/player-modal/player-modal.component';
import { I18nService } from './services/i18n.service';
import { ElevenTtsComponent } from './components/eleven-tts/eleven-tts.component';
import { MuteService } from './services/mute.service';
import { AudioRecordingService } from './services/audio-recording.service';
import { PlayerManagementService } from './services/player-management.service';
import { PLAYERS, PLAYER_CONFIGS, CHARACTER_VOICES } from './config/players.config';

interface Message {
  text: string;
  sender:'player' | 'mj';
  timestamp: Date;
  player?: PlayerImpl;
  isStreaming?: boolean;
  streamingId?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, DiceComponent, PlayerCardComponent, LanguageSwitcherComponent, PlayerModalComponent, ElevenTtsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  messages: Message[] = [];
  newMessage: string = '';
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  @ViewChild('ttsComponent') private ttsComponent!: any;

  // TTS Properties
  currentSpeakingCharacter: string = '';
  currentSpeechText: string = '';
  characterVoices: Record<string, string> = CHARACTER_VOICES;

  // Player Management
  isPlayerModalOpen = false;
  isEditMode = false;
  editingPlayer: PlayerImpl | null = null;

  constructor(
    protected gameService: GameService, 
    private apiService: ApiService,
    private chatHistoryService: ChatHistoryService,
    private playerManagementService: PlayerManagementService,
    protected i18n: I18nService,
    protected muteService: MuteService,
    protected audioRecordingService: AudioRecordingService
  ) {}

  ngOnInit() {
    this.initializePlayers();
    this.loadChatMessages();
    this.setupChatHistoryConsoleAccess();
  }

  private initializePlayers(): void {
    // Check if players are already loaded from storage by the PlayerManagementService
    const currentPlayers = this.gameService.getAllPlayers();
    if (currentPlayers.length === 0) {
      // No players in storage, initialize with default players
      const players = Object.values(PLAYERS).map(config => 
        new PlayerImpl(config.name, config.backstory, config.imageUri, config.traits, config.health, config.inventory, config.attacks, config.voiceId)
      );
      this.gameService.setPlayers(players);
      
      // Save the default players to storage for future sessions
      this.saveInitialPlayersToStorage();
    }
  }

  private saveInitialPlayersToStorage(): void {
    // Use setTimeout to ensure the gameService has been updated before saving
    setTimeout(() => {
      this.playerManagementService.saveCurrentPlayersToStorage();
    }, 0);
  }

  private loadChatMessages(): void {
    // Load stored chat messages into the UI
    const storedMessages = this.chatHistoryService.getAllMessages();
    this.messages = storedMessages.map(chatMsg => ({
      text: chatMsg.text,
      sender: chatMsg.sender,
      timestamp: chatMsg.timestamp,
      player: chatMsg.player,
      isStreaming: false
    }));
    
    console.log(`Loaded ${this.messages.length} messages from storage`);
  }

  private setupChatHistoryConsoleAccess(): void {
    (window as any).chatHistory = {
      getAll: () => this.getChatHistory(),
      getStats: () => this.getChatStats(),
      export: () => this.exportChatHistory(),
      clear: () => this.clearChatHistory(),
      search: (query: string) => this.searchChatHistory(query),
      getPlayerMessages: (playerName: string) => this.getPlayerMessageHistory(playerName),
      logStats: () => this.logChatStats(),
      getContext: (playerName: string, messageCount?: number) => {
        const player = this.gameService.getAllPlayers().find(p => p.name === playerName) as PlayerImpl;
        if (!player) return `Player "${playerName}" not found. Available: ${this.gameService.getAllPlayers().map(p => p.name).join(', ')}`;
        return this.chatHistoryService.getContext(player, messageCount);
      },
      getCompactContext: (playerName: string, messageCount?: number) => {
        const player = this.gameService.getAllPlayers().find(p => p.name === playerName) as PlayerImpl;
        if (!player) return `Player "${playerName}" not found`;
        return this.chatHistoryService.getCompactContext(player, messageCount);
      },
      getCurrentTurnContext: (playerName: string) => {
        const player = this.gameService.getAllPlayers().find(p => p.name === playerName) as PlayerImpl;
        if (!player) return `Player "${playerName}" not found`;
        return this.chatHistoryService.getCurrentTurnContext(player, this.getCurrentTurnNumber());
      },
      getMessages: (messageCount?: number, playerName?: string) => {
        const player = playerName ? this.gameService.getAllPlayers().find(p => p.name === playerName) as PlayerImpl : undefined;
        return this.chatHistoryService.getMessages(messageCount, player);
      }
    };
    
    console.log('💬 Chat History with Context Available!');
    console.log('📋 Basic: chatHistory.getAll(), chatHistory.getStats(), chatHistory.export()');
    console.log('🔍 Search: chatHistory.search("text"), chatHistory.getPlayerMessages("Warrior")');
    console.log('🎯 Context: chatHistory.getContext("Warrior"), chatHistory.getCompactContext("Mage")');
    console.log('⚡ Current Turn: chatHistory.getCurrentTurnContext("Rogue")');
    console.log('🤖 AI SDK: chatHistory.getMessages(20, "Warrior")');
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      const mjMessage = this.newMessage;
      this.addMJMessage(mjMessage);
      this.newMessage = '';
      // Players no longer automatically respond - they respond when their speak button is clicked
    }
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ===== GAME STATE METHODS =====
  getTurnOrder(): PlayerImpl[] {
    return this.gameService.getCurrentTurn().turnOrder;
  }

  getCurrentPlayerIndex(): number {
    return this.gameService.getCurrentTurn().currentPlayerIndex;
  }

  getCurrentTurnNumber(): number {
    return this.gameService.getCurrentTurn().turnNumber;
  }

  getOrderedPlayers(): PlayerImpl[] {
    const currentTurnOrder = this.gameService.getCurrentTurn().turnOrder as PlayerImpl[];
    const allPlayers = this.gameService.getAllPlayers() as PlayerImpl[];
    const eliminatedPlayers = allPlayers.filter(player => !player.isAlive());
    
    // Return turn order first, then eliminated players
    return [...currentTurnOrder, ...eliminatedPlayers];
  }

  isPlayerInCurrentTurn(player: PlayerImpl): boolean {
    return this.gameService.getCurrentTurn().turnOrder.includes(player);
  }

  getPlayerTurnIndex(player: PlayerImpl): number {
    const currentTurnOrder = this.gameService.getCurrentTurn().turnOrder;
    return currentTurnOrder.indexOf(player);
  }

  isCurrentPlayer(player: PlayerImpl): boolean {
    const turnOrder = this.gameService.getCurrentTurn().turnOrder;
    const currentIndex = this.gameService.getCurrentTurn().currentPlayerIndex;
    return turnOrder[currentIndex] === player;
  }

  startNewTurn(): void {
    this.gameService.manualNextTurn();
    console.log('New turn started with fresh player order');
  }

  // ===== PLAYER INTERACTION METHODS =====
  onHealthToggle(event: { player: PlayerImpl, heartIndex: number }): void {
    this.toggleHealth(event.player, event.heartIndex);
  }

  onPlayerClick(player: PlayerImpl): void {
    if (player.isAlive()) {
      const success = this.gameService.setCurrentPlayer(player);
      if (success) {
        console.log(`Switched to ${player.name}`);
      }
    } else {
      console.log(`Cannot select ${player.name}: player is eliminated`);
    }
  }

  async onPlayerSpeak(player: PlayerImpl): Promise<void> {
    console.log(`${player.name} speaks...`);
    await this.generatePlayerResponse('', player);
  }

  toggleHealth(player: PlayerImpl, heartIndex: number): void {
    const previousHealth = player.health;
    
    if (heartIndex < player.health) {
      // Click on a filled heart - decrease health
      player.health = heartIndex;
    } else {
      // Click on an empty heart - set health to that level + 1
      player.health = heartIndex + 1;
    }
    
    // Ensure health stays within bounds (0-3)
    player.health = Math.max(0, Math.min(3, player.health));
    
    console.log(`${player.name} health changed to: ${player.health}`);
    
    // Save player state changes to storage
    this.playerManagementService.saveCurrentPlayersToStorage();
    
    // Check if player died or was revived
    if (previousHealth > 0 && player.health === 0) {
      console.log(`${player.name} ${this.i18n.translate('player.died')}`);
      this.gameService.generateNewTurn();
    } else if (previousHealth === 0 && player.health > 0) {
      console.log(`${player.name} ${this.i18n.translate('player.revived')}`);
      this.gameService.generateNewTurn();
    }
  }

  // ===== AUDIO & RECORDING METHODS =====
  toggleMute(): void {
    this.muteService.toggle();
  }

  async toggleRecording(): Promise<void> {
    if (this.audioRecordingService.isRecording()) {
      // Stop recording and process the audio
      const audioBlob = await this.audioRecordingService.stopRecording();
      if (audioBlob && this.ttsComponent) {
        console.log('Processing recorded audio...');
        try {
          const transcribedText = await this.ttsComponent.transcribeAudio(audioBlob);
          if (transcribedText) {
            // Add the transcribed message as GM message
            await this.addGMMessage(transcribedText);
          } else {
            console.warn('No text was transcribed from the audio');
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
        }
      }
    } else {
      // Start recording
      const started = await this.audioRecordingService.startRecording();
      if (!started) {
        console.error('Failed to start recording');
      }
    }
  }

  private async addGMMessage(text: string): Promise<void> {
    this.addMJMessage(text);
    console.log('Added GM message from voice:', text);
    // Players no longer automatically respond - they respond when their speak button is clicked
  }

  private addMJMessage(text: string): void {
    const mjMessage = {
      text: text,
      sender: 'mj' as const,
      timestamp: new Date()
    };
    this.messages.push(mjMessage);
    
    this.chatHistoryService.addMessage(
      text, 
      'mj', 
      undefined, 
      this.getCurrentTurnNumber()
    );
  }

  private async generatePlayerResponse(mjMessage: string, specificPlayer?: PlayerImpl): Promise<void> {
    try {
      const player = specificPlayer || this.gameService.getCurrentTurn().getCurrentPlayer();
      
      // Create a streaming message placeholder
      const streamingId = `streaming-${Date.now()}-${Math.random()}`;
      const streamingMessage: Message = {
        text: '',
        sender: 'player',
        timestamp: new Date(),
        player: player as PlayerImpl,
        isStreaming: true,
        streamingId: streamingId
      };
      
      this.messages.push(streamingMessage);
      let fullResponse = '';
      
      // Subscribe to the streaming response
      this.apiService.generatePlayerResponseStream(player).subscribe({
        next: (data) => {
          if (data.isComplete) {
            // Stream is complete, finalize the message
            const messageIndex = this.messages.findIndex(m => m.streamingId === streamingId);
            if (messageIndex !== -1) {
              this.messages[messageIndex].isStreaming = false;
              this.messages[messageIndex].text = data.fullResponse || fullResponse;
              delete this.messages[messageIndex].streamingId;
              
              // Add to chat history
              this.chatHistoryService.addMessage(
                data.fullResponse || fullResponse, 
                'player', 
                player as PlayerImpl, 
                this.getCurrentTurnNumber()
              );
              
              // Speak the full response
              this.speakCharacterText(player as PlayerImpl, data.fullResponse || fullResponse);
            }
          } else if (data.sentence) {
            // Add sentence to the streaming message
            fullResponse += (fullResponse ? ' ' : '') + data.sentence;
            const messageIndex = this.messages.findIndex(m => m.streamingId === streamingId);
            if (messageIndex !== -1) {
              this.messages[messageIndex].text = fullResponse;
            }
          }
        },
        error: (error) => {
          console.error('Error generating streaming player response:', error);
          
          // Remove streaming message and add fallback
          const messageIndex = this.messages.findIndex(m => m.streamingId === streamingId);
          if (messageIndex !== -1) {
            this.messages.splice(messageIndex, 1);
          }
          
          const fallbackText = 'I listen carefully to your words.';
          this.addPlayerMessage(fallbackText, player as PlayerImpl);
          this.speakCharacterText(player as PlayerImpl, fallbackText);
        }
      });
      
    } catch (error) {
      console.error('Error generating player response:', error);
      const player = specificPlayer || this.gameService.getCurrentTurn().getCurrentPlayer();
      const fallbackText = 'I listen carefully to your words.';
      this.addPlayerMessage(fallbackText, player as PlayerImpl);
      this.speakCharacterText(player as PlayerImpl, fallbackText);
    }
  }


  private addPlayerMessage(text: string, player: PlayerImpl): void {
    const playerMessage = {
      text: text,
      sender: 'player' as const,
      timestamp: new Date(),
      player: player
    };
    this.messages.push(playerMessage);
    
    this.chatHistoryService.addMessage(
      text, 
      'player', 
      player, 
      this.getCurrentTurnNumber()
    );
  }

  // ===== TTS METHODS =====
  private speakCharacterText(player: PlayerImpl, text: string): void {
    // Check if voices are muted
    if (this.muteService.isMuted()) {
      console.log('Voices are muted, skipping TTS');
      return;
    }

    // Check if player has a voice ID
    if (!player.voiceId) {
      console.warn(`No voice ID found for character: ${player.name}`);
      return;
    }

    // Clean up the text for speech (remove asterisks and action descriptions)
    const cleanText = this.cleanTextForSpeech(text);
    
    if (!cleanText.trim()) {
      console.log('No speakable text found after cleaning');
      return;
    }

    // Set the TTS component properties
    this.currentSpeakingCharacter = player.name;
    this.currentSpeechText = cleanText;

    // Trigger speech after a short delay to ensure the component updates
    setTimeout(async () => {
      if (this.ttsComponent) {
        console.log(`Speaking as ${player.name}: ${cleanText}`);
        const voiceId = player.voiceId;
        const success = await this.ttsComponent.speakAs(player.name, cleanText, voiceId);
        if (!success) {
          console.warn(`Failed to generate speech for ${player.name}`);
        }
      }
    }, 100);
  }

  private cleanTextForSpeech(text: string): string {
    // Remove action descriptions in asterisks (e.g., "*nods thoughtfully*")
    let cleaned = text.replace(/\*[^*]*\*/g, '');
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // If the text is too short or only punctuation, return empty
    if (cleaned.length < 3 || /^[^\w]*$/.test(cleaned)) {
      return '';
    }
    
    return cleaned;
  }

  // ===== STORAGE MANAGEMENT METHODS =====
  clearAllStoredData(): void {
    const confirmMessage = this.i18n.translate('storage.clear.confirm');
    
    if (confirm(confirmMessage)) {
      // Clear chat history from storage
      this.chatHistoryService.clearStoredHistory();
      this.chatHistoryService.clearCurrentSession();
      this.messages = [];
      
      // Clear players from storage
      this.playerManagementService.clearStoredPlayers();
      
      // Reset to default players
      this.initializePlayers();
      
      // Save the default players to storage
      this.saveInitialPlayersToStorage();
      
      const successMessage = this.i18n.translate('storage.clear.success');
      
      console.log('All stored data cleared');
      alert(successMessage);
    }
  }

  // ===== GAME MANAGEMENT METHODS =====
  onRestart(): void {
    
    // Clear chat history and messages
    this.chatHistoryService.clearCurrentSession();
    this.messages = [];
    this.newMessage = '';
    
    // Reset all players to full health
    const allPlayers = this.gameService.getAllPlayers() as PlayerImpl[];
    allPlayers.forEach(player => {
      player.health = 3;
    });
    
    // Reset players to properly initialize first turn at turn 1
    this.gameService.setPlayers(allPlayers);
    
    // Save the updated player states to storage
    this.playerManagementService.saveCurrentPlayersToStorage();
    
    console.log('Game restarted');
  }

  // ===== CHAT HISTORY METHODS =====
  getChatHistory() {
    return this.chatHistoryService.getAllMessages();
  }

  getChatStats() {
    return this.chatHistoryService.getSessionStats();
  }

  exportChatHistory(): string {
    return this.chatHistoryService.exportChatHistory();
  }

  clearChatHistory(): void {
    this.chatHistoryService.clearCurrentSession();
    this.chatHistoryService.clearStoredHistory();
    this.messages = [];
    console.log('Chat history cleared');
  }

  searchChatHistory(query: string) {
    return this.chatHistoryService.searchMessages(query);
  }

  getPlayerMessageHistory(playerName: string) {
    return this.chatHistoryService.getMessagesByPlayer(playerName);
  }

  logChatStats(): void {
    const stats = this.getChatStats();
    console.log('=== Chat Session Statistics ===');
    console.log(`Session Duration: ${stats.sessionDuration} minutes`);
    console.log(`Total Messages: ${stats.totalMessages}`);
    console.log(`Player Messages: ${stats.playerMessages}`);
    console.log(`MJ Messages: ${stats.mjMessages}`);
    console.log(`Unique Players: ${stats.uniquePlayers}`);
    console.log(`Average Message Length: ${stats.averageMessageLength} characters`);
    console.log('================================');
  }

  // ===== LIFECYCLE & UTILITY METHODS =====
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // ===== PLAYER MANAGEMENT METHODS =====
  openAddPlayerModal(): void {
    this.isEditMode = false;
    this.editingPlayer = null;
    this.isPlayerModalOpen = true;
  }

  openEditPlayerModal(player: PlayerImpl): void {
    this.isEditMode = true;
    this.editingPlayer = player;
    this.isPlayerModalOpen = true;
  }

  closePlayerModal(): void {
    this.isPlayerModalOpen = false;
    this.isEditMode = false;
    this.editingPlayer = null;
  }

  onPlayerSave(player: PlayerImpl): void {
    if (this.isEditMode && this.editingPlayer) {
      // Update existing player
      const success = this.playerManagementService.updatePlayer(this.editingPlayer.name, player);
      if (success) {
        console.log(`Player "${this.editingPlayer.name}" updated successfully`);
        // Regenerate turn to update any changes
        this.gameService.generateNewTurn();
      } else {
        alert('Failed to update player. Please check if the name already exists.');
      }
    } else {
      // Add new player
      const success = this.playerManagementService.addPlayer(player);
      if (success) {
        console.log(`Player "${player.name}" added successfully`);
        // Regenerate turn to include new player
        this.gameService.generateNewTurn();
      } else {
        alert('Failed to add player. Please check if the name already exists.');
      }
    }
    this.closePlayerModal();
  }

  removePlayer(player: PlayerImpl): void {
    if (confirm(`Are you sure you want to remove ${player.name}?`)) {
      const success = this.playerManagementService.removePlayer(player.name);
      if (success) {
        console.log(`Player "${player.name}" removed successfully`);
        // Regenerate turn to update player list
        this.gameService.generateNewTurn();
      } else {
        alert('Failed to remove player.');
      }
    }
  }
}