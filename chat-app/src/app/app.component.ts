import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerImpl } from './models/player.model';
import { GameService } from './services/game.service';
import { ApiService } from './services/api.service';
import { DiceComponent } from './dice/dice.component';

interface Message {
  text: string;
  sender:'player' | 'mj';
  timestamp: Date;
  player?: PlayerImpl;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DiceComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  messages: Message[] = [];
  newMessage: string = '';
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;

  constructor(protected gameService: GameService, private apiService: ApiService) {}

  ngOnInit() {
    const availableTraits = [
      { 
        "name": "Lazy", 
        "description": "Avoids physical exertion and prefers rest over action.", 
        "challenge": "Carry heavy supplies for the party during a full day’s travel."
      },
      { 
        "name": "Slob", 
        "description": "Careless with cleanliness and appearance.", 
        "challenge": "Attend a royal banquet without offending anyone with your manners."
      },
      { 
        "name": "Clumsy", 
        "description": "Often trips, drops things, or fumbles in tense moments.", 
        "challenge": "Disarm a delicate trap without triggering it."
      },
      { 
        "name": "Mean-Spirited", 
        "description": "Quick to insult or provoke others.", 
        "challenge": "Negotiate peace between two feuding villagers."
      },
      { 
        "name": "Evil", 
        "description": "Takes pleasure in the suffering of others.", 
        "challenge": "Protect a helpless NPC without harming them."
      },
      { 
        "name": "Gloomy", 
        "description": "Often pessimistic and melancholic.", 
        "challenge": "Inspire the party with an uplifting speech before a battle."
      },
      { 
        "name": "Noncommittal", 
        "description": "Dislikes long-term plans or obligations.", 
        "challenge": "Stick with the group through an entire dungeon without trying to leave."
      },
      { 
        "name": "Hot-Headed", 
        "description": "Easily angered and quick to act without thinking.", 
        "challenge": "End a tense tavern argument without drawing your weapon."
      },
      { 
        "name": "Insane / Erratic", 
        "description": "Unpredictable behavior and strange habits.", 
        "challenge": "Follow an entire plan exactly as discussed without improvising."
      },
      { 
        "name": "Loner", 
        "description": "Prefers solitude and avoids large groups.", 
        "challenge": "Lead a crowded caravan safely to its destination."
      },
      { 
        "name": "Hates Children", 
        "description": "Feels uncomfortable around young ones.", 
        "challenge": "Escort a lost child back to their family without abandoning them."
      },
      { 
        "name": "Jealous", 
        "description": "Suspicious and possessive in relationships.", 
        "challenge": "Let another party member take the spotlight in a heroic deed."
      },
      { 
        "name": "Glutton", 
        "description": "Eats excessively and often at inopportune times.", 
        "challenge": "Share your last ration with a starving stranger."
      },
      { 
        "name": "Snob", 
        "description": "Looks down on those of lower status or skill.", 
        "challenge": "Work as an equal alongside a humble peasant to complete a task."
      }
    ];

    // Randomly assign traits to players
    const shuffledTraits = [...availableTraits].sort(() => Math.random() - 0.5);

    const players = [
      new PlayerImpl("Warrior", "A broad-shouldered warrior clad in weather-worn plate, the steel dulled by countless battles. A deep scar runs from his temple to his jaw, a silent testament to survival. His voice is gravel, his stare unshaken, and his hand never strays far from the hilt of his greatsword. Korran speaks little, but when he does, his words cut as sharply as his blade.", "assets/images/warrior.png", shuffledTraits[0]),
      new PlayerImpl("Mage", "Draped in flowing midnight-blue robes embroidered with silver constellations, Selvara's eyes shimmer like starlight on still water. A slender crystal-tipped staff rests in her hand, pulsing faintly with arcane energy. Her voice is calm but edged with power, each word carrying the weight of ancient knowledge and the promise of unbridled magic.", "assets/images/mage.png", shuffledTraits[1]),
      new PlayerImpl("Rogue", "Lean and sharp-eyed, Ryn moves like a shadow slipping between torchlight. A dark hood hides most of his face, but the glint of a knowing smirk can be seen when danger's near. Twin daggers rest at his hips, their edges whispering promises of silent endings. He speaks little, but every word feels like a calculated move in an unseen game.", "assets/images/rogue.png", shuffledTraits[2]),
      new PlayerImpl("Hunter", "Wrapped in a weathered cloak of mottled greens and browns, Kaelen blends into the wild as naturally as wind through leaves. A longbow rests easily in his hand, its grip worn smooth from years of use. His sharp eyes miss nothing, tracking prey—or threats—with the patience of a predator. Quiet and steady, Kaelen speaks in few words, each rooted in the rhythm of the hunt.", "assets/images/hunter.png", shuffledTraits[3]),
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

  getTraitIcon(traitName: string): string {
    const traitIcons: { [key: string]: string } = {
      'Lazy': '😴',
      'Slob': '🗑️',
      'Clumsy': '🤕',
      'Mean-Spirited': '😠',
      'Evil': '😈',
      'Gloomy': '😔',
      'Noncommittal': '🤷',
      'Hot-Headed': '🔥',
      'Insane / Erratic': '🤪',
      'Loner': '🚶',
      'Hates Children': '👶',
      'Jealous': '💚',
      'Glutton': '🍖',
      'Snob': '👑'
    };
    return traitIcons[traitName] || '❓';
  }

  toggleChallengeResolved(player: PlayerImpl): void {
    player.challengeResolved = !player.challengeResolved;
    console.log(`${player.name}'s challenge "${player.trait.challenge}" marked as ${player.challengeResolved ? 'resolved' : 'unresolved'}`);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
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
      console.log(`${player.name} has been eliminated!`);
      this.gameService.generateNewTurn();
    } else if (previousHealth === 0 && player.health > 0) {
      console.log(`${player.name} has been revived!`);
      this.gameService.generateNewTurn();
    }
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