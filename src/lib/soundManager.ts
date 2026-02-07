// Sound Manager for game audio effects

import { isSoundEnabled } from './gameStorage';

type SoundType = 'click' | 'success' | 'error' | 'gameOver' | 'levelUp' | 'countdown' | 'match' | 'flip';

// Using Web Audio API for synthesized sounds (no external files needed)
class SoundManager {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!isSoundEnabled()) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  }

  play(sound: SoundType) {
    switch (sound) {
      case 'click':
        this.playTone(800, 0.1, 'square', 0.1);
        break;
      case 'success':
        this.playTone(523, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 100);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.2), 200);
        break;
      case 'error':
        this.playTone(200, 0.3, 'sawtooth', 0.2);
        break;
      case 'gameOver':
        this.playTone(400, 0.2, 'sine', 0.2);
        setTimeout(() => this.playTone(300, 0.2, 'sine', 0.2), 200);
        setTimeout(() => this.playTone(200, 0.4, 'sine', 0.2), 400);
        break;
      case 'levelUp':
        this.playTone(440, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(554, 0.1, 'sine', 0.2), 100);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 200);
        setTimeout(() => this.playTone(880, 0.3, 'sine', 0.3), 300);
        break;
      case 'countdown':
        this.playTone(600, 0.1, 'square', 0.15);
        break;
      case 'match':
        this.playTone(700, 0.15, 'sine', 0.2);
        setTimeout(() => this.playTone(900, 0.15, 'sine', 0.2), 100);
        break;
      case 'flip':
        this.playTone(400, 0.05, 'triangle', 0.1);
        break;
    }
  }
}

export const soundManager = new SoundManager();
