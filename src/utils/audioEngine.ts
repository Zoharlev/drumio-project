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
    const currentTime = this.context.currentTime;
    
    // Main low-frequency body
    const kickOsc = this.context.createOscillator();
    const kickGain = this.context.createGain();
    const kickFilter = this.context.createBiquadFilter();
    const kickCompressor = this.context.createDynamicsCompressor();
    
    kickOsc.frequency.setValueAtTime(80, currentTime);
    kickOsc.frequency.exponentialRampToValueAtTime(35, currentTime + 0.1);
    kickOsc.frequency.exponentialRampToValueAtTime(25, currentTime + 0.3);
    kickOsc.type = 'sine';
    
    kickFilter.type = 'lowpass';
    kickFilter.frequency.setValueAtTime(150, currentTime);
    kickFilter.frequency.exponentialRampToValueAtTime(80, currentTime + 0.2);
    kickFilter.Q.setValueAtTime(2, currentTime);
    
    // Enhanced compression for punch
    kickCompressor.threshold.setValueAtTime(-12, currentTime);
    kickCompressor.ratio.setValueAtTime(8, currentTime);
    kickCompressor.attack.setValueAtTime(0.001, currentTime);
    kickCompressor.release.setValueAtTime(0.1, currentTime);
    
    kickOsc.connect(kickFilter);
    kickFilter.connect(kickCompressor);
    kickCompressor.connect(kickGain);
    
    // Enhanced transient click
    const clickOsc = this.context.createOscillator();
    const clickGain = this.context.createGain();
    const clickFilter = this.context.createBiquadFilter();
    
    clickOsc.frequency.setValueAtTime(2000, currentTime);
    clickOsc.frequency.exponentialRampToValueAtTime(200, currentTime + 0.008);
    clickOsc.type = 'sawtooth';
    
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(800, currentTime);
    clickFilter.Q.setValueAtTime(3, currentTime);
    
    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    
    // Deep sub bass
    const subOsc = this.context.createOscillator();
    const subGain = this.context.createGain();
    const subFilter = this.context.createBiquadFilter();
    
    subOsc.frequency.setValueAtTime(50, currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(20, currentTime + 0.15);
    subOsc.type = 'sine';
    
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(60, currentTime);
    subFilter.Q.setValueAtTime(1.5, currentTime);
    
    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    
    // Noise burst for texture
    const noiseBuffer = this.context.createBuffer(1, this.context.sampleRate * 0.05, this.context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.5;
    }
    
    const noiseSource = this.context.createBufferSource();
    const noiseGain = this.context.createGain();
    const noiseFilter = this.context.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(300, currentTime);
    noiseFilter.Q.setValueAtTime(2, currentTime);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    
    // Master mix with saturation
    const mixGain = this.context.createGain();
    const waveshaper = this.context.createWaveShaper();
    
    // Subtle distortion for warmth
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i - 128) / 128;
      curve[i] = Math.tanh(x * 0.8) * 0.9;
    }
    waveshaper.curve = curve;
    
    kickGain.connect(mixGain);
    clickGain.connect(mixGain);
    subGain.connect(mixGain);
    noiseGain.connect(mixGain);
    mixGain.connect(waveshaper);
    waveshaper.connect(this.context.destination);
    
    const duration = 0.5;
    const velocityMultiplier = Math.pow(velocity, 0.8);
    
    // More dynamic envelope shaping
    kickGain.gain.setValueAtTime(0, currentTime);
    kickGain.gain.linearRampToValueAtTime(1.8 * velocityMultiplier, currentTime + 0.005);
    kickGain.gain.exponentialRampToValueAtTime(0.3 * velocityMultiplier, currentTime + 0.08);
    kickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
    
    clickGain.gain.setValueAtTime(0, currentTime);
    clickGain.gain.linearRampToValueAtTime(1.2 * velocityMultiplier, currentTime + 0.001);
    clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.015);
    
    subGain.gain.setValueAtTime(0, currentTime);
    subGain.gain.linearRampToValueAtTime(0.9 * velocityMultiplier, currentTime + 0.008);
    subGain.gain.exponentialRampToValueAtTime(0.2 * velocityMultiplier, currentTime + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration * 0.9);
    
    noiseGain.gain.setValueAtTime(0, currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.4 * velocityMultiplier, currentTime + 0.002);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03);
    
    mixGain.gain.setValueAtTime(1.5 * velocity, currentTime);
    
    // Start all components
    kickOsc.start(currentTime);
    kickOsc.stop(currentTime + duration);
    clickOsc.start(currentTime);
    clickOsc.stop(currentTime + 0.015);
    subOsc.start(currentTime);
    subOsc.stop(currentTime + duration);
    noiseSource.start(currentTime);
    noiseSource.stop(currentTime + 0.05);
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