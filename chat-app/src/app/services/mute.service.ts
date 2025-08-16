import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MuteService {
  private _isMuted: WritableSignal<boolean> = signal(true);

  get isMuted() {
    return this._isMuted.asReadonly();
  }

  toggle(): void {
    this._isMuted.update(current => !current);
    console.log(`Voice ${this._isMuted() ? 'muted' : 'unmuted'}`);
  }

  mute(): void {
    this._isMuted.set(true);
  }

  unmute(): void {
    this._isMuted.set(false);
  }
}