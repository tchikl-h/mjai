import { Component, Input, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ElevenTtsComponent
 * -------------------
 * Angular standalone component to play NPC dialogue using ElevenLabs Text-to-Speech.
 *
 * Features
 * - Per-NPC voice selection via @Input() voices map or direct @Input() voiceId
 * - Works with a secure backend proxy (recommended) OR directly with ElevenLabs API (not recommended for production)
 * - Simple UI: Play/Stop button, optional voice dropdown, progress/loader state
 * - Emits audio using an <audio> element with a blob URL
 *
 * Usage (recommended backend proxy mode):
 * <app-eleven-tts
 *   [npcName]="'Tharok the Orc'"
 *   [text]="currentLine"
 *   [voices]="{ 'Tharok the Orc': 'EXAVITQu4vr4xnSDxMaL', 'Elyra the Elf': 'TxGEqnHWrfWFTfGW9XjX' }"
 *   backendUrl="/api/tts"  // your serverless function that proxies ElevenLabs
 * ></app-eleven-tts>
 *
 * Direct mode (dev only; exposes API key in browser):
 * <app-eleven-tts
 *   [npcName]="'Tharok the Orc'"
 *   [text]="currentLine"
 *   [voices]="voicesMap"
 *   [useDirectApi]="true"
 *   elevenApiKey="YOUR_ELEVENLABS_API_KEY"
 * ></app-eleven-tts>
 */

@Component({
  selector: 'app-eleven-tts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tts-container" [style.display]="showUI ? 'block' : 'none'">
      <div class="tts-controls" *ngIf="showUI" style="display:flex; align-items:center; gap:.5rem; padding:.5rem;">
        <label *ngIf="hasVoiceChoices()" for="voiceSelect"><strong>Voice:</strong></label>
        <select *ngIf="hasVoiceChoices()" id="voiceSelect" [value]="selectedVoiceId()" (change)="onVoiceChange($event)" style="flex:1; padding:.375rem;">
          <option *ngFor="let v of voiceOptions()" [value]="v.id">{{ v.label }}</option>
        </select>
        <button type="button" (click)="play()" [disabled]="loading() || !resolvedVoiceId() || !text" style="padding:.5rem 1rem;">
          {{ loading() ? 'Generating…' : 'Speak' }}
        </button>
        <button type="button" (click)="stop()" [disabled]="!isPlaying()" style="padding:.5rem 1rem;">Stop</button>
      </div>

      <div *ngIf="error() && showUI" class="error-message" style="margin-top:.5rem; color:#b00020; padding:.5rem;">
        {{ error() }}
      </div>

      <!-- Hidden audio element for programmatic control -->
      <audio #audio [src]="audioUrl() || undefined" style="display: none;"></audio>
      
      <!-- Optional status indicator -->
      <div *ngIf="!showUI && (loading() || isPlaying())" class="tts-status" style="position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 4px; z-index: 1000;">
        <span *ngIf="loading()">🎤 Generating speech...</span>
        <span *ngIf="isPlaying() && !loading()">🔊 {{ npcName }} speaking...</span>
      </div>
    </div>
  `,
})
export class ElevenTtsComponent {
  /** Text for the NPC to speak */
  @Input() text = '';
  /** NPC name used to look up a voiceId in the voices map */
  @Input() npcName: string | null = null;
  /** Optional: directly force a specific voiceId */
  @Input() voiceId: string | null = null;
  /** Map of NPC name -> ElevenLabs voice_id */
  @Input() voices: Record<string, string> = {};

  /** Backend proxy endpoint (recommended): expects POST { text, voiceId, settings? } -> audio/mpeg */
  @Input() backendUrl: string | null = null;

  /** Direct-to-ElevenLabs mode (dev only). If true, you must also provide elevenApiKey. */
  @Input() useDirectApi = false;
  /** Your ElevenLabs API key (only used in useDirectApi mode). Do NOT use this in production UI. */
  @Input() elevenApiKey: string | null = null;

  /** Optional voice settings forwarded to ElevenLabs */
  @Input() stability = 0.4;
  @Input() similarityBoost = 0.9;
  @Input() style = 0.0; // new voices support
  @Input() useSpeakerBoost = true;

  /** Whether to show the UI controls (default: false for programmatic use) */
  @Input() showUI = false;

  // UI state
  private _audio = new Audio();
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);
  audioUrl: WritableSignal<string | null> = signal(null);
  isPlaying: WritableSignal<boolean> = signal(false);
  selectedVoiceId: WritableSignal<string | null> = signal(null);

  constructor() {
    // Keep play state in sync
    this._audio.addEventListener('play', () => this.isPlaying.set(true));
    this._audio.addEventListener('pause', () => this.isPlaying.set(false));
    this._audio.addEventListener('ended', () => this.isPlaying.set(false));
  }

  /** Resolve final voiceId from inputs */
  resolvedVoiceId: Signal<string | null> = computed(() => {
    if (this.voiceId) return this.voiceId;
    if (this.selectedVoiceId()) return this.selectedVoiceId();
    if (this.npcName && this.voices && this.voices[this.npcName]) return this.voices[this.npcName];
    // if only one voice provided, default to it
    const entries = Object.entries(this.voices || {});
    if (entries.length === 1) return entries[0][1];
    return null;
  });

  voiceOptions = computed(() => {
    const opts: { id: string; label: string }[] = [];
    // If npcName has a mapping, show it first
    if (this.npcName && this.voices[this.npcName]) {
      opts.push({ id: this.voices[this.npcName], label: `${this.npcName}` });
    }
    // Add all unique voices
    const seen = new Set(opts.map(o => o.id));
    Object.entries(this.voices).forEach(([name, id]) => {
      if (!seen.has(id)) {
        opts.push({ id, label: name });
        seen.add(id);
      }
    });
    // If a forced voiceId isn't in the map, add it as a generic option
    if (this.voiceId && !seen.has(this.voiceId)) {
      opts.unshift({ id: this.voiceId, label: 'Custom Voice' });
    }
    return opts;
  });

  hasVoiceChoices() {
    return this.voiceOptions().length > 1;
  }

  onVoiceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedVoiceId.set(target.value || null);
  }

  async play() {
    this.error.set(null);
    const voiceId = this.resolvedVoiceId();
    if (!voiceId) {
      this.error.set('No voice selected. Provide voiceId or voices map.');
      return;
    }
    if (!this.text || !this.text.trim()) {
      this.error.set('No text to speak.');
      return;
    }

    try {
      this.loading.set(true);
      const blob = this.useDirectApi
        ? await this.fetchDirectFromElevenLabs(voiceId, this.text)
        : await this.fetchFromBackendProxy(voiceId, this.text);

      const url = URL.createObjectURL(blob);
      // revoke previous URL if any
      const prev = this.audioUrl();
      if (prev) URL.revokeObjectURL(prev);
      this.audioUrl.set(url);

      // Play via internal audio element
      this._audio.src = url;
      await this._audio.play();
    } catch (err: any) {
      console.error(err);
      this.error.set(err?.message ?? 'Failed to generate speech');
    } finally {
      this.loading.set(false);
    }
  }

  stop() {
    if (!this._audio.paused) this._audio.pause();
    this._audio.currentTime = 0;
  }

  /** Programmatically trigger speech with new text and voice */
  async speakAs(characterName: string, text: string, voiceId?: string): Promise<boolean> {
    // Update properties
    this.npcName = characterName;
    this.text = text;
    if (voiceId) {
      this.selectedVoiceId.set(voiceId);
    }

    try {
      await this.play();
      return true;
    } catch (error) {
      console.error(`Failed to speak as ${characterName}:`, error);
      return false;
    }
  }

  private async fetchFromBackendProxy(voiceId: string, text: string): Promise<Blob> {
    if (!this.backendUrl) {
      throw new Error('backendUrl is not set. Either provide backendUrl or enable useDirectApi (dev only).');
    }
    const res = await fetch(this.backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceId, text: 'Vous avez tout à fait raison, faisons cela !', voice_settings: this.buildVoiceSettings() })
    });
    if (!res.ok) {
      const msg = await safeReadText(res);
      throw new Error(`Backend TTS failed: ${res.status} ${res.statusText} — ${msg}`);
    }
    return await res.blob(); // expect audio/mpeg
  }

  private async fetchDirectFromElevenLabs(voiceId: string, text: string): Promise<Blob> {
    if (!this.elevenApiKey) throw new Error('elevenApiKey is required for direct mode.');
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': this.elevenApiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({ text, voice_settings: this.buildVoiceSettings() })
    });
    if (!res.ok) {
      const msg = await safeReadText(res);
      throw new Error(`ElevenLabs API failed: ${res.status} ${res.statusText} — ${msg}`);
    }
    return await res.blob();
  }

  private buildVoiceSettings() {
    return {
      stability: this.stability,
      similarity_boost: this.similarityBoost,
      style: this.style,
      use_speaker_boost: this.useSpeakerBoost
    };
  }
}

async function safeReadText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ''; }
}
