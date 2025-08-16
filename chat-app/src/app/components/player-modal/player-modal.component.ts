import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerImpl } from '../../models/player.model';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-player-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-modal.component.html',
  styleUrls: ['./player-modal.component.css']
})
export class PlayerModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() editPlayer: PlayerImpl | null = null;
  @Input() isEditMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<PlayerImpl>();

  playerData = {
    name: '',
    backstory: '',
    imageUri: '',
    health: 3,
    inventory: '',
    traits: '',
    attacks: '',
    voiceId: ''
  };

  constructor(protected i18n: I18nService) {}

  ngOnInit() {
    this.updateFormData();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update form when inputs change
    if (changes['isEditMode'] || changes['editPlayer'] || changes['isOpen']) {
      this.updateFormData();
    }
  }

  private updateFormData() {
    if (this.isEditMode && this.editPlayer) {
      this.playerData = {
        name: this.editPlayer.name,
        backstory: this.editPlayer.backstory,
        imageUri: this.editPlayer.imageUri,
        health: this.editPlayer.health,
        inventory: this.editPlayer.inventory,
        traits: this.editPlayer.traits,
        attacks: this.editPlayer.attacks,
        voiceId: this.editPlayer.voiceId
      };
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.playerData = {
      name: '',
      backstory: '',
      imageUri: '',
      health: 3,
      inventory: '',
      traits: '',
      attacks: '',
      voiceId: ''
    };
  }

  onClose() {
    this.close.emit();
    this.resetForm();
  }

  onSave() {
    if (!this.playerData.name.trim()) {
      alert(this.i18n.translate('player.name.required'));
      return;
    }

    const player = new PlayerImpl(
      this.playerData.name,
      this.playerData.backstory,
      this.playerData.imageUri,
      this.playerData.traits,
      this.playerData.health,
      this.playerData.inventory,
      this.playerData.attacks,
      this.playerData.voiceId
    );

    this.save.emit(player);
    this.onClose();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}