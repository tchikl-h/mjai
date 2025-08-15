import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  
  isRecording: WritableSignal<boolean> = signal(false);
  isSupported: WritableSignal<boolean> = signal(false);

  constructor() {
    this.checkBrowserSupport();
  }

  private checkBrowserSupport(): void {
    const hasMediaDevices = navigator.mediaDevices != null;
    const hasGetUserMedia = hasMediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
    const hasMediaRecorder = 'MediaRecorder' in window;
    const supported = hasMediaDevices && hasGetUserMedia && hasMediaRecorder;
    
    this.isSupported.set(supported);
    if (!supported) {
      console.warn('Audio recording is not supported in this browser');
    }
  }

  async startRecording(): Promise<boolean> {
    if (!this.isSupported()) {
      console.error('Audio recording not supported');
      return false;
    }

    if (this.isRecording()) {
      console.warn('Already recording');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getSupportedMimeType()
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isRecording.set(true);
        console.log('Recording started');
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording.set(false);
        console.log('Recording stopped');
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      this.isRecording.set(false);
      return false;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder || !this.isRecording()) {
      console.warn('Not currently recording');
      return null;
    }

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording.set(false);
        
        if (this.audioChunks.length === 0) {
          console.warn('No audio data recorded');
          resolve(null);
          return;
        }

        const audioBlob = new Blob(this.audioChunks, { 
          type: this.getSupportedMimeType() 
        });
        
        console.log(`Audio recorded: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        resolve(audioBlob);
        
        // Clean up
        this.audioChunks = [];
        
        // Stop all tracks to release microphone
        if (this.mediaRecorder?.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      };

      this.mediaRecorder.stop();
    });
  }

  private getSupportedMimeType(): string {
    // Try WAV first, then fallback to other supported formats
    const types = [
      'audio/wav',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/webm'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Using audio format: ${type}`);
        return type;
      }
    }

    console.log('Falling back to audio/webm');
    return 'audio/webm'; // fallback
  }

  async toggleRecording(): Promise<Blob | null> {
    if (this.isRecording()) {
      return await this.stopRecording();
    } else {
      const started = await this.startRecording();
      return started ? null : null;
    }
  }
}