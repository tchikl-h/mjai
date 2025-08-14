// dice.component.ts
import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div id="dice-container" #diceContainer 
           style="width: 100%; height: 200px; background-color: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; color: #007bff;"
           [class.rolling]="isRolling">
        {{ displayValue }}
      </div>
      <div style="text-align: center; margin-top: 10px;">
        <button 
          (click)="rollD20()" 
          [disabled]="isRolling"
          style="padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          onmouseover="this.style.backgroundColor='#0056b3'" 
          onmouseout="this.style.backgroundColor='#007bff'">
          {{ isRolling ? 'Rolling...' : 'Roll D20' }}
        </button>
      </div>
      <div *ngIf="lastRoll" style="text-align: center; margin-top: 10px; font-size: 18px; font-weight: bold;">
        Last Roll: {{ lastRoll }}
      </div>
    </div>
  `,
  styles: [`
    .rolling {
      animation: spin 0.5s ease-in-out;
    }
    
    @keyframes spin {
      0% { transform: rotateY(0deg); }
      25% { transform: rotateY(90deg); }
      50% { transform: rotateY(180deg); }
      75% { transform: rotateY(270deg); }
      100% { transform: rotateY(360deg); }
    }
  `]
})
export class DiceComponent implements AfterViewInit {
  @ViewChild('diceContainer', { static: false }) container!: ElementRef;
  lastRoll: number | null = null;
  isRolling = false;
  displayValue = '🎲';
  private diceAudio: HTMLAudioElement;

  constructor() {
    // Initialize the audio element
    this.diceAudio = new Audio();
    this.diceAudio.src = '/assets/sounds/rolling-dice.mp3';
    this.diceAudio.preload = 'auto';
    this.diceAudio.volume = 0.7; // Set volume to 70%
  }

  ngAfterViewInit() {
    // Simple 2D dice component - no complex 3D initialization needed
    console.log('Dice component initialized successfully');
  }

  async rollD20() {
    if (this.isRolling) {
      return; // Prevent multiple simultaneous rolls
    }

    this.isRolling = true;
    this.displayValue = '🎲';

    try {
      // Play dice rolling sound
      await this.playDiceSound();

      // Simulate rolling animation
      const rollDuration = 1000; // 1 second
      const animationSteps = 10;
      const stepDuration = rollDuration / animationSteps;

      // Show random numbers during animation
      for (let i = 0; i < animationSteps; i++) {
        const tempRoll = Math.floor(Math.random() * 20) + 1;
        this.displayValue = tempRoll.toString();
        await this.delay(stepDuration);
      }

      // Final result
      const finalRoll = Math.floor(Math.random() * 20) + 1;
      this.lastRoll = finalRoll;
      this.displayValue = finalRoll.toString();

      console.log('Rolled D20:', finalRoll);
    } catch (error) {
      console.error('Error during dice roll:', error);
      // Fallback
      this.lastRoll = Math.floor(Math.random() * 20) + 1;
      this.displayValue = this.lastRoll.toString();
    } finally {
      this.isRolling = false;
    }
  }

  private async playDiceSound(): Promise<void> {
    try {
      // Reset the audio to the beginning in case it was played before
      this.diceAudio.currentTime = 0;
      
      // Play the sound
      await this.diceAudio.play();
      console.log('Dice rolling sound played successfully');
    } catch (error) {
      // Handle audio playback errors (e.g., user hasn't interacted with page yet)
      console.warn('Could not play dice rolling sound:', error);
      // Don't throw the error - just log it and continue with the roll
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
