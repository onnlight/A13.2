import * as THREE from 'three';

export interface SoundConfig {
  volume: number;
  loop: boolean;
  fadeIn?: boolean;
  fadeOut?: boolean;
}

export class AudioManager {
  private listener: THREE.AudioListener;
  private sounds: Map<string, THREE.Audio | THREE.PositionalAudio> = new Map();
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.listener = new THREE.AudioListener();
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      // Create audio context for better control
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  public getListener(): THREE.AudioListener {
    return this.listener;
  }

  // Create synthesized sounds using Web Audio API
  private createSynthesizedSound(type: string): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const sampleRate = this.audioContext.sampleRate;
    const duration = this.getSoundDuration(type);
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
      case 'jump':
        this.createJumpSound(data, sampleRate);
        break;
      case 'collect':
        this.createCollectSound(data, sampleRate);
        break;
      case 'coin':
        this.createCoinSound(data, sampleRate);
        break;
      case 'powerup':
        this.createPowerUpSound(data, sampleRate);
        break;
      case 'collision':
        this.createCollisionSound(data, sampleRate);
        break;
      case 'gameover':
        this.createGameOverSound(data, sampleRate);
        break;
      case 'menu':
        this.createMenuSound(data, sampleRate);
        break;
      case 'purchase':
        this.createPurchaseSound(data, sampleRate);
        break;
      case 'equip':
        this.createEquipSound(data, sampleRate);
        break;
      default:
        this.createDefaultSound(data, sampleRate);
    }

    return buffer;
  }

  private getSoundDuration(type: string): number {
    const durations: { [key: string]: number } = {
      'jump': 0.2,
      'collect': 0.3,
      'coin': 0.2,
      'powerup': 0.5,
      'collision': 0.4,
      'gameover': 1.0,
      'menu': 0.1,
      'purchase': 0.4,
      'equip': 0.3
    };
    return durations[type] || 0.2;
  }

  private createJumpSound(data: Float32Array, sampleRate: number): void {
    // Create a quick ascending pitch sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 8); // Quick decay
      const frequency = 200 + t * 300; // Ascending frequency
      data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.3;
    }
  }

  private createCollectSound(data: Float32Array, sampleRate: number): void {
    // Create a pleasant chime sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 5);
      // Multiple harmonics for richer sound
      data[i] = envelope * (
        Math.sin(2 * Math.PI * 800 * t) * 0.3 +
        Math.sin(2 * Math.PI * 1200 * t) * 0.2 +
        Math.sin(2 * Math.PI * 1600 * t) * 0.1
      );
    }
  }

  private createPowerUpSound(data: Float32Array, sampleRate: number): void {
    // Create an ascending magical sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 2); // Smooth fade in/out
      const frequency = 400 + t * 800; // Ascending frequency sweep
      data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.4;
    }
  }

  private createCollisionSound(data: Float32Array, sampleRate: number): void {
    // Create a harsh impact sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 15); // Very quick decay
      // Noise + low frequency for impact
      data[i] = envelope * (
        (Math.random() - 0.5) * 0.5 + // Noise
        Math.sin(2 * Math.PI * 100 * t) * 0.3 // Low frequency thud
      );
    }
  }

  private createGameOverSound(data: Float32Array, sampleRate: number): void {
    // Create a descending sad sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const frequency = 400 - t * 300; // Descending frequency
      data[i] = envelope * Math.sin(2 * Math.PI * frequency * t) * 0.5;
    }
  }

  private createMenuSound(data: Float32Array, sampleRate: number): void {
    // Create a quick click sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 50); // Very quick
      data[i] = envelope * (Math.random() - 0.5) * 0.2;
    }
  }

  private createCoinSound(data: Float32Array, sampleRate: number): void {
    // Create a sparkling coin sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 8);
      // High frequency sparkles
      data[i] = envelope * (
        Math.sin(2 * Math.PI * 1200 * t) * 0.2 +
        Math.sin(2 * Math.PI * 2400 * t) * 0.15 +
        Math.sin(2 * Math.PI * 3600 * t) * 0.1
      );
    }
  }

  private createPurchaseSound(data: Float32Array, sampleRate: number): void {
    // Create a satisfying purchase sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 3);
      // Ascending chime sequence
      const frequency1 = 523.25; // C5
      const frequency2 = 659.25; // E5
      const frequency3 = 783.99; // G5
      data[i] = envelope * (
        Math.sin(2 * Math.PI * frequency1 * t) * 0.3 +
        Math.sin(2 * Math.PI * frequency2 * t) * 0.2 +
        Math.sin(2 * Math.PI * frequency3 * t) * 0.1
      );
    }
  }

  private createEquipSound(data: Float32Array, sampleRate: number): void {
    // Create a quick equip sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 10);
      // Quick shimmer
      data[i] = envelope * (
        Math.sin(2 * Math.PI * 800 * t) * 0.25 +
        Math.sin(2 * Math.PI * 1600 * t) * 0.15
      );
    }
  }

  private createDefaultSound(data: Float32Array, sampleRate: number): void {
    // Simple beep
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 10);
      data[i] = envelope * Math.sin(2 * Math.PI * 440 * t) * 0.3;
    }
  }

  // Create background music using synthesized patterns
  private createBackgroundMusic(): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const sampleRate = this.audioContext.sampleRate;
    const duration = 8.0; // 8 seconds loop
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
    
    // Create a simple electronic music pattern
    const tempo = 120; // BPM
    const beatTime = 60 / tempo;
    
    for (let channelIndex = 0; channelIndex < 2; channelIndex++) {
      const data = buffer.getChannelData(channelIndex);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const beatPhase = (t % beatTime) / beatTime;
        
        let sample = 0;
        
        // Bass line (every beat)
        if (beatPhase < 0.1) {
          sample += Math.sin(2 * Math.PI * 80 * t) * 0.4 * Math.exp(-beatPhase * 20);
        }
        
        // Melody pattern
        const melodyPattern = [0, 3, 5, 3, 7, 5, 8, 5]; // Simple scale pattern
        const beatIndex = Math.floor(t / beatTime) % melodyPattern.length;
        const noteFreq = 220 * Math.pow(2, melodyPattern[beatIndex] / 12);
        
        if (beatPhase > 0.5 && beatPhase < 0.6) {
          sample += Math.sin(2 * Math.PI * noteFreq * t) * 0.2 * Math.sin(beatPhase * Math.PI);
        }
        
        // Hi-hat pattern
        if (beatPhase > 0.75 && beatPhase < 0.8) {
          sample += (Math.random() - 0.5) * 0.05;
        }
        
        // Apply some reverb/echo effect
        const echoTime = 0.2;
        const echoDelay = Math.max(0, t - echoTime);
        const echoSample = this.getSampleAtTime(data, echoDelay * sampleRate, channelIndex);
        
        data[i] = sample * 0.7 + echoSample * 0.3;
        
        // Apply envelope
        data[i] *= 0.3; // Reduce overall volume
      }
    }
    
    return buffer;
  }

  private getSampleAtTime(data: Float32Array, sampleIndex: number, _channel: number): number {
    if (sampleIndex < 0) return 0;
    if (sampleIndex >= data.length) return 0;
    return data[Math.floor(sampleIndex)];
  }

  public loadSound(name: string, config: SoundConfig = { volume: 1.0, loop: false }): void {
    if (!this.sfxEnabled && name !== 'background') return;
    if (!this.musicEnabled && name === 'background') return;

    try {
      let audio: any;
      
      if (name === 'background') {
        // Use regular Audio for background music
        audio = new THREE.Audio(this.listener);
      } else {
        // Use positional audio for sound effects
        audio = new THREE.PositionalAudio(this.listener);
      }

      // Create synthesized sound
      if (name === 'background') {
        const buffer = this.createBackgroundMusic();
        (audio as any).setBuffer(buffer);
        (audio as any).setLoop(true);
        (audio as any).setVolume(this.musicVolume * this.masterVolume * config.volume);
      } else {
        const buffer = this.createSynthesizedSound(name);
        (audio as any).setBuffer(buffer);
        (audio as any).setLoop(config.loop || false);
        (audio as any).setVolume(this.sfxVolume * this.masterVolume * config.volume);
      }

      this.sounds.set(name, audio);
      
      
      
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  public playSound(name: string, config?: Partial<SoundConfig>): void {
    if (name === 'background') {
      if (!this.musicEnabled) return;
    } else {
      if (!this.sfxEnabled) return;
    }

    const audio = this.sounds.get(name);
    if (!audio) {
      // Load sound on demand if not already loaded
      this.loadSound(name, { volume: 1.0, loop: false, ...config });
      const newAudio = this.sounds.get(name);
      if (newAudio) {
        setTimeout(() => this.playSound(name, config), 100);
      }
      return;
    }

    try {
      if (audio.isPlaying) {
        audio.stop();
      }
      
      // Update volume based on current settings
      const volume = name === 'background' 
        ? this.musicVolume * this.masterVolume * (config?.volume || 1.0)
        : this.sfxVolume * this.masterVolume * (config?.volume || 1.0);
      
      (audio as any).setVolume(volume);
      audio.play();
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }

  public stopSound(name: string): void {
    const audio = this.sounds.get(name);
    if (audio && audio.isPlaying) {
      audio.stop();
    }
  }

  public playBackgroundMusic(): void {
    if (!this.musicEnabled) return;
    
    if (!this.sounds.has('background')) {
      this.loadSound('background', { volume: 1.0, loop: true });
    }
    
    setTimeout(() => {
      this.playSound('background');
    }, 500);
  }

  public stopBackgroundMusic(): void {
    this.stopSound('background');
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  private updateAllVolumes(): void {
    this.sounds.forEach((audio, name) => {
      const volume = name === 'background' 
        ? this.musicVolume * this.masterVolume
        : this.sfxVolume * this.masterVolume;
      (audio as any).setVolume(volume);
    });
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }

  public setSFXEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    if (!enabled) {
      this.sounds.forEach((audio, name) => {
        if (name !== 'background' && audio.isPlaying) {
          audio.stop();
        }
      });
    }
  }

  public toggleMusic(enabled: boolean): void {
    this.setMusicEnabled(enabled);
  }

  public toggleSfx(enabled: boolean): void {
    this.setSFXEnabled(enabled);
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public isSFXEnabled(): boolean {
    return this.sfxEnabled;
  }

  // Resume audio context (needed for some browsers after user interaction)
  public resumeAudioContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public dispose(): void {
    // Stop all sounds
    this.sounds.forEach(audio => {
      if (audio.isPlaying) {
        audio.stop();
      }
    });
    
    // Clear references
    this.sounds.clear();
  }
}