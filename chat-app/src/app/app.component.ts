import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerImpl } from './models/player.model';
import { GameService } from './services/game.service';
import { ApiService } from './services/api.service';

interface Message {
  text: string;
  sender:'player' | 'mj';
  timestamp: Date;
  player?: PlayerImpl;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  messages: Message[] = [];
  newMessage: string = '';
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  constructor(protected gameService: GameService, private apiService: ApiService) {}

  ngOnInit() {
    const players = [
      new PlayerImpl("Warrior", "A broad-shouldered warrior clad in weather-worn plate, the steel dulled by countless battles. A deep scar runs from his temple to his jaw, a silent testament to survival. His voice is gravel, his stare unshaken, and his hand never strays far from the hilt of his greatsword. Korran speaks little, but when he does, his words cut as sharply as his blade.", "assets/images/warrior.png"),
      new PlayerImpl("Mage", "Draped in flowing midnight-blue robes embroidered with silver constellations, Selvara's eyes shimmer like starlight on still water. A slender crystal-tipped staff rests in her hand, pulsing faintly with arcane energy. Her voice is calm but edged with power, each word carrying the weight of ancient knowledge and the promise of unbridled magic.", "assets/images/mage.png"),
      new PlayerImpl("Rogue", "Lean and sharp-eyed, Ryn moves like a shadow slipping between torchlight. A dark hood hides most of his face, but the glint of a knowing smirk can be seen when danger's near. Twin daggers rest at his hips, their edges whispering promises of silent endings. He speaks little, but every word feels like a calculated move in an unseen game.", "assets/images/rogue.png"),
      new PlayerImpl("Hunter", "Wrapped in a weathered cloak of mottled greens and browns, Kaelen blends into the wild as naturally as wind through leaves. A longbow rests easily in his hand, its grip worn smooth from years of use. His sharp eyes miss nothing, tracking prey—or threats—with the patience of a predator. Quiet and steady, Kaelen speaks in few words, each rooted in the rhythm of the hunt.", "assets/images/hunter.png"),
    ];
    this.gameService.setPlayers(players);
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      const mjMessage = this.newMessage;
      
      this.messages.push({
          text: mjMessage,
          sender: 'mj',
          timestamp: new Date()
        });
      
      this.newMessage = '';
      
      // Generate AI response from the current player
      try {
        const currentPlayer = this.gameService.getCurrentTurn().getCurrentPlayer();
        const playerResponse = await this.apiService.generatePlayerResponse(currentPlayer, mjMessage);
        
        this.messages.push({
          text: playerResponse,
          sender: 'player',
          timestamp: new Date(),
          player: currentPlayer as PlayerImpl
        });
        
        // Move to next player
        this.gameService.nextPlayer();
      } catch (error) {
        console.error('Error generating player response:', error);
        
        // Fallback to simple response
        const currentPlayer = this.gameService.getCurrentTurn().getCurrentPlayer();
        this.messages.push({
          text: 'I listen carefully to your words.',
          sender: 'player',
          timestamp: new Date(),
          player: currentPlayer as PlayerImpl
        });
        
        // Move to next player
        this.gameService.nextPlayer();
      }
    }
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  getTurnOrder(): PlayerImpl[] {
    return this.gameService.getCurrentTurn().turnOrder;
  }

  getCurrentPlayerIndex(): number {
    return this.gameService.getCurrentTurn().currentPlayerIndex;
  }

  getCurrentTurnNumber(): number {
    return this.gameService.getCurrentTurn().turnNumber;
  }

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