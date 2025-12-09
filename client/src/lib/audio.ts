// Retro Synth Audio System
// Uses Web Audio API to generate sounds procedurally (no external assets needed)

class AudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = false;

  constructor() {
    // Initialize on first user interaction
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => this.init(), { once: true });
      window.addEventListener('keydown', () => this.init(), { once: true });
    }
  }

  init() {
    if (this.ctx || this.enabled) return;
    
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.1; // Low volume by default
      this.enabled = true;
    } catch (e) {
      console.error("Audio initialization failed", e);
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, delay = 0) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  // SFX Presets
  playHover() {
    // High pitched short blip
    this.playTone(800, 'square', 0.05);
  }

  playClick() {
    // Positive selection sound
    this.playTone(1200, 'sine', 0.1);
    this.playTone(1800, 'sine', 0.1, 0.05);
  }

  playBack() {
    // Lower cancel sound
    this.playTone(400, 'sawtooth', 0.1);
  }

  playTyping() {
    // Mechanical keyboard click
    const freq = 200 + Math.random() * 50;
    this.playTone(freq, 'square', 0.03);
  }

  playStart() {
    // Power up sound
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Arpeggio
    [440, 554, 659, 880].forEach((freq, i) => {
       this.playTone(freq, 'square', 0.2, i * 0.1);
    });
  }

  playCrash() {
    if (!this.ctx || !this.masterGain) return;
    
    // Create noise buffer
    const bufferSize = this.ctx.sampleRate * 1.5; // 1.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);
    
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();
    
    // Add descending tone
    this.playTone(880, 'sawtooth', 1.5);
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, this.ctx.currentTime + 1.5);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.5);
  }
}

export const audio = new AudioController();
