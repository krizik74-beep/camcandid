// Web Audio API Synthesizer for Authentic Camera Sound Effects
class CameraSoundEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Mechanical Camera Shutter Click
  playShutterSound() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // 1. First click (mirror flap / aperture open)
      const bufferSize = ctx.sampleRate * 0.08;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.05);

      // 2. Second mechanical thud (shutter curtains closing)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.09);

      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.setValueAtTime(0.9, now + 0.04);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now + 0.04);
      osc.stop(now + 0.11);
    } catch (e) {
      console.warn('Audio playback not permitted yet', e);
    }
  }

  // Flash capacitor charge whine
  playFlashWhine() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(8000, now + 0.5);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn(e);
    }
  }

  // Film winding ratchet sound
  playFilmAdvance() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // 4 tiny rapid ticks
      for (let t = 0; t < 4; t++) {
        const tickTime = now + t * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(850 + t * 60, tickTime);

        gain.gain.setValueAtTime(0.2, tickTime);
        gain.gain.exponentialRampToValueAtTime(0.01, tickTime + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(tickTime);
        osc.stop(tickTime + 0.035);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // Soft joyful chime upon successful print/send
  playSuccessChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.45);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

export const cameraSound = new CameraSoundEngine();
