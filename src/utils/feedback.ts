import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

class FeedbackManager {
  private audioCtx: any = null;

  async triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' = 'light') {
    try {
      // 1. Web fallback
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(type === 'heavy' ? 40 : 15);
        }
        return;
      }

      // 2. Android: React Native built-in Vibration service (100% compatible on all Android devices & Expo Go)
      if (Platform.OS === 'android') {
        switch (type) {
          case 'light':
            Vibration.vibrate(12);
            break;
          case 'medium':
            Vibration.vibrate(25);
            break;
          case 'heavy':
            Vibration.vibrate(50);
            break;
          case 'success':
            Vibration.vibrate([0, 15, 60, 25]);
            break;
        }
        return;
      }

      // 3. iOS: Safe Expo Haptics with promise rejection suppression
      if (Haptics) {
        if (type === 'success' && typeof Haptics.notificationAsync === 'function') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } else if (typeof Haptics.impactAsync === 'function') {
          const style =
            type === 'heavy'
              ? Haptics.ImpactFeedbackStyle.Heavy
              : type === 'medium'
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Light;
          await Haptics.impactAsync(style).catch(() => {});
        }
      }
    } catch {
      // Hardware vibration not available on this device; fail silently without errors
    }
  }

  playWaterDropSound() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        if (!this.audioCtx) {
          this.audioCtx = new AudioContextClass();
        }
        const ctx = this.audioCtx;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        // Synthesize cute aquatic droplet: high resonant sine pitch sliding down
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.18);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio playback failed silently
    }
  }

  playPourSound() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        if (!this.audioCtx) {
          this.audioCtx = new AudioContextClass();
        }
        const ctx = this.audioCtx;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        // Synthesize rapid gentle water bubbles pouring
        const now = ctx.currentTime;
        [0, 0.05, 0.11, 0.17, 0.23].forEach((delay, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const freq = 550 + idx * 80 + (Math.random() * 40 - 20);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          osc.frequency.exponentialRampToValueAtTime(freq + 250, now + delay + 0.05);

          gain.gain.setValueAtTime(0.001, now + delay);
          gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.08);
        });
      }
    } catch {
      // Audio playback failed silently
    }
  }
}

export const feedback = new FeedbackManager();
