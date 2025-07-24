export class AudioEngine {
  private context: AudioContext;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async resumeContext() {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  playDrumSound(drum: string, velocity: number = 0.7, isOpen: boolean = false) {
    if (!this.context) return;

    const adjustedVelocity = Math.max(0.1, Math.min(1.0, velocity));

    if (drum === 'hihat' || drum === 'openhat') {
      this.playHiHat(adjustedVelocity, isOpen || drum === 'openhat');
    } else if (drum === 'snare') {
      this.playSnare(adjustedVelocity);
    } else if (drum === 'kick') {
      this.playKick(adjustedVelocity);
    }
  }

  private playHiHat(velocity: number, isOpen: boolean) {
    const bufferSize = this.context.sampleRate * (isOpen ? 0.4 : 0.1);
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    const highpassFilter = this.context.createBiquadFilter();
    highpassFilter.type = 'highpass';
    highpassFilter.frequency.setValueAtTime(isOpen ? 6000 : 8000, this.context.currentTime);
    
    const gainNode = this.context.createGain();
    noise.connect(highpassFilter);
    highpassFilter.connect(gainNode);
    gainNode.connect(this.context.destination);

    const duration = isOpen ? 0.4 : 0.08;
    const maxGain = isOpen ? 0.7 : 0.6;
    
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(maxGain * velocity, this.context.currentTime + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

    noise.start(this.context.currentTime);
    noise.stop(this.context.currentTime + duration);
  }

  private playSnare(velocity: number) {
    // Tonal component
    const oscillator = this.context.createOscillator();
    const toneGain = this.context.createGain();
    
    oscillator.frequency.setValueAtTime(200, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(60, this.context.currentTime + 0.05);
    oscillator.type = 'triangle';
    oscillator.connect(toneGain);
    
    // Noise component
    const bufferSize = this.context.sampleRate * 0.2;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const bandpassFilter = this.context.createBiquadFilter();
    bandpassFilter.type = 'bandpass';
    bandpassFilter.frequency.setValueAtTime(400, this.context.currentTime);
    bandpassFilter.Q.setValueAtTime(1, this.context.currentTime);
    
    const noiseGain = this.context.createGain();
    noise.connect(bandpassFilter);
    bandpassFilter.connect(noiseGain);
    
    // Mix components
    const mixGain = this.context.createGain();
    toneGain.connect(mixGain);
    noiseGain.connect(mixGain);
    mixGain.connect(this.context.destination);
    
    const duration = 0.2;
    
    // Apply velocity to envelopes
    toneGain.gain.setValueAtTime(0, this.context.currentTime);
    toneGain.gain.linearRampToValueAtTime(0.8 * velocity, this.context.currentTime + 0.001);
    toneGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    
    noiseGain.gain.setValueAtTime(0, this.context.currentTime);
    noiseGain.gain.linearRampToValueAtTime(1.2 * velocity, this.context.currentTime + 0.002);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.3);
    
    mixGain.gain.setValueAtTime(1.5 * velocity, this.context.currentTime);
    
    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
    noise.start(this.context.currentTime);
    noise.stop(this.context.currentTime + duration);
  }

  private playKick(velocity: number) {
    // Main component
    const kickOsc = this.context.createOscillator();
    const kickGain = this.context.createGain();
    const kickFilter = this.context.createBiquadFilter();
    
    kickOsc.frequency.setValueAtTime(65, this.context.currentTime);
    kickOsc.frequency.exponentialRampToValueAtTime(30, this.context.currentTime + 0.08);
    kickOsc.type = 'sine';
    
    kickFilter.type = 'lowpass';
    kickFilter.frequency.setValueAtTime(120, this.context.currentTime);
    kickFilter.Q.setValueAtTime(1, this.context.currentTime);
    
    kickOsc.connect(kickFilter);
    kickFilter.connect(kickGain);
    
    // Click component
    const clickOsc = this.context.createOscillator();
    const clickGain = this.context.createGain();
    const clickFilter = this.context.createBiquadFilter();
    
    clickOsc.frequency.setValueAtTime(1200, this.context.currentTime);
    clickOsc.frequency.exponentialRampToValueAtTime(80, this.context.currentTime + 0.005);
    clickOsc.type = 'triangle';
    
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(400, this.context.currentTime);
    clickFilter.Q.setValueAtTime(0.5, this.context.currentTime);
    
    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    
    // Sub component
    const subOsc = this.context.createOscillator();
    const subGain = this.context.createGain();
    
    subOsc.frequency.setValueAtTime(45, this.context.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(25, this.context.currentTime + 0.1);
    subOsc.type = 'sine';
    subOsc.connect(subGain);
    
    // Mix all
    const mixGain = this.context.createGain();
    kickGain.connect(mixGain);
    clickGain.connect(mixGain);
    subGain.connect(mixGain);
    mixGain.connect(this.context.destination);
    
    const duration = 0.4;
    
    // Apply velocity to all components
    kickGain.gain.setValueAtTime(0, this.context.currentTime);
    kickGain.gain.linearRampToValueAtTime(1.2 * velocity, this.context.currentTime + 0.003);
    kickGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    
    clickGain.gain.setValueAtTime(0, this.context.currentTime);
    clickGain.gain.linearRampToValueAtTime(0.8 * velocity, this.context.currentTime + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.01);
    
    subGain.gain.setValueAtTime(0, this.context.currentTime);
    subGain.gain.linearRampToValueAtTime(0.6 * velocity, this.context.currentTime + 0.005);
    subGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration * 0.8);
    
    mixGain.gain.setValueAtTime(1.8 * velocity, this.context.currentTime);
    
    kickOsc.start(this.context.currentTime);
    kickOsc.stop(this.context.currentTime + duration);
    clickOsc.start(this.context.currentTime);
    clickOsc.stop(this.context.currentTime + 0.01);
    subOsc.start(this.context.currentTime);
    subOsc.stop(this.context.currentTime + duration);
  }

  playMetronome() {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(1000, this.context.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + 0.05);
  }

  close() {
    this.context?.close();
  }
}