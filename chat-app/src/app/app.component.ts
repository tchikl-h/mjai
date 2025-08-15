import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerImpl, LocalizedText } from './models/player.model';
import { GameService } from './services/game.service';
import { ApiService } from './services/api.service';
import { TraitsService } from './services/traits.service';
import { ChallengeService } from './services/challenge.service';
import { GameStateService } from './services/game-state.service';
import { ChatHistoryService } from './services/chat-history.service';
import { DiceComponent } from './dice/dice.component';
import { PlayerCardComponent } from './components/player-card/player-card.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
// DEACTIVATED IMPORTS
// import { ChallengesListComponent } from './components/challenges-list/challenges-list.component';
// import { WinScreenComponent } from './components/win-screen/win-screen.component';
// import { GameOverScreenComponent } from './components/game-over-screen/game-over-screen.component';
import { I18nService } from './services/i18n.service';
import { ElevenTtsComponent } from './components/eleven-tts/eleven-tts.component';
import { MuteService } from './services/mute.service';
import { AudioRecordingService } from './services/audio-recording.service';

interface Message {
  text: string;
  sender:'player' | 'mj';
  timestamp: Date;
  player?: PlayerImpl;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DiceComponent, PlayerCardComponent, LanguageSwitcherComponent, ElevenTtsComponent],
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
  characterVoices: Record<string, string> = {
    'Warrior': '2EiwWnXFnvU5JabPnv8n', // Deep male voice
    'Mage': '9BWtsMINqrJLrRacOk9x', // Mystical female voice
    'Rogue': 'CYw3kZ02Hs0563khs1Fj', // Sneaky male voice
    'Hunter': 'CwhRBWXzGAHq8TQ4Fs17', // Nature-focused voice
  };

  constructor(
    protected gameService: GameService, 
    private apiService: ApiService,
    private traitsService: TraitsService,
    private challengeService: ChallengeService,
    protected gameStateService: GameStateService,
    private chatHistoryService: ChatHistoryService,
    protected i18n: I18nService,
    protected muteService: MuteService,
    protected audioRecordingService: AudioRecordingService
  ) {}

  ngOnInit() {
    this.initializePlayers();
    this.setupChatHistoryConsoleAccess();
  }

  private initializePlayers(): void {
    const dummyTrait = {
      name: { en: 'None', fr: 'Aucun' },
      description: { en: 'No trait', fr: 'Aucun trait' },
      challenge: { en: 'No challenge', fr: 'Aucun défi' }
    };

    const players = [
      new PlayerImpl("Warrior", "A broad-shouldered warrior clad in weather-worn plate, the steel dulled by countless battles. A deep scar runs from his temple to his jaw, a silent testament to survival. His voice is gravel, his stare unshaken, and his hand never strays far from the hilt of his greatsword. Korran speaks little, but when he does, his words cut as sharply as his blade.", "assets/images/warrior.png", dummyTrait),
      new PlayerImpl("Mage", "Draped in flowing midnight-blue robes embroidered with silver constellations, Selvara's eyes shimmer like starlight on still water. A slender crystal-tipped staff rests in her hand, pulsing faintly with arcane energy. Her voice is calm but edged with power, each word carrying the weight of ancient knowledge and the promise of unbridled magic.", "assets/images/mage.png", dummyTrait),
      new PlayerImpl("Rogue", "Lean and sharp-eyed, Ryn moves like a shadow slipping between torchlight. A dark hood hides most of his face, but the glint of a knowing smirk can be seen when danger's near. Twin daggers rest at his hips, their edges whispering promises of silent endings. He speaks little, but every word feels like a calculated move in an unseen game.", "assets/images/rogue.png", dummyTrait),
      new PlayerImpl("Hunter", "Wrapped in a weathered cloak of mottled greens and browns, Kaelen blends into the wild as naturally as wind through leaves. A longbow rests easily in his hand, its grip worn smooth from years of use. His sharp eyes miss nothing, tracking prey—or threats—with the patience of a predator. Quiet and steady, Kaelen speaks in few words, each rooted in the rhythm of the hunt.", "assets/images/hunter.png", dummyTrait),
    ];
    this.gameService.setPlayers(players);
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
      }
    };
    
    console.log('💬 Chat History with Context Available!');
    console.log('📋 Basic: chatHistory.getAll(), chatHistory.getStats(), chatHistory.export()');
    console.log('🔍 Search: chatHistory.search("text"), chatHistory.getPlayerMessages("Warrior")');
    console.log('🎯 Context: chatHistory.getContext("Warrior"), chatHistory.getCompactContext("Mage")');
    console.log('⚡ Current Turn: chatHistory.getCurrentTurnContext("Rogue")');
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
      
      // Get the latest GM message if no specific message provided
      const messageToRespond = mjMessage || this.getLatestGMMessage();
      
      const playerResponse = await this.apiService.generatePlayerResponse(player, messageToRespond);
      this.addPlayerMessage(playerResponse, player as PlayerImpl);
      this.speakCharacterText(player as PlayerImpl, playerResponse);
    } catch (error) {
      console.error('Error generating player response:', error);
      const player = specificPlayer || this.gameService.getCurrentTurn().getCurrentPlayer();
      const fallbackText = 'I listen carefully to your words.';
      this.addPlayerMessage(fallbackText, player as PlayerImpl);
      this.speakCharacterText(player as PlayerImpl, fallbackText);
    }
  }

  private getLatestGMMessage(): string {
    // Find the most recent GM message
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].sender === 'mj') {
        return this.messages[i].text;
      }
    }
    return 'What shall we do next?'; // Fallback if no GM message found
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

    // Check if we have a voice mapping for this character
    if (!this.characterVoices[player.name]) {
      console.warn(`No voice mapping found for character: ${player.name}`);
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
        const voiceId = this.characterVoices[player.name];
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

  // ===== GAME MANAGEMENT METHODS =====
  onRestart(): void {
    // Reset game state
    this.gameStateService.resetGame();
    
    // Clear chat history and messages
    this.chatHistoryService.clearCurrentSession();
    this.messages = [];
    this.newMessage = '';
    
    // Reset all players to full health and unresolved challenges
    const allPlayers = this.gameService.getAllPlayers() as PlayerImpl[];
    allPlayers.forEach(player => {
      player.health = 3;
      player.challengeResolved = false;
    });
    
    // Reset players to properly initialize first turn at turn 1
    this.gameService.setPlayers(allPlayers);
    
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
}