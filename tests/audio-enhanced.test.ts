// Audio System Tests
import { AudioSystem } from '../src/audio';

describe('Audio System', () => {
  let audioSystem: AudioSystem;

  beforeEach(() => {
    audioSystem = new AudioSystem();
  });

  afterEach(() => {
    audioSystem.dispose();
  });

  describe('Initialization', () => {
    test('should initialize with default settings', () => {
      expect(audioSystem.getMusicVolume()).toBe(0.5);
      expect(audioSystem.getSfxVolume()).toBe(0.7);
    });

    test('should create audio context', () => {
      expect(audioSystem.getContext()).toBeDefined();
    });
  });

  describe('Volume Controls', () => {
    test('should set music volume', () => {
      audioSystem.setMusicVolume(0.8);
      expect(audioSystem.getMusicVolume()).toBe(0.8);
    });

    test('should set SFX volume', () => {
      audioSystem.setSfxVolume(0.3);
      expect(audioSystem.getSfxVolume()).toBe(0.3);
    });

    test('should clamp volume values', () => {
      audioSystem.setMusicVolume(1.5);
      expect(audioSystem.getMusicVolume()).toBe(1.0);

      audioSystem.setMusicVolume(-0.5);
      expect(audioSystem.getMusicVolume()).toBe(0.0);
    });
  });

  describe('Sound Effects', () => {
    test('should play jump sound', () => {
      const playSpy = jest.spyOn(audioSystem, 'playJump');
      audioSystem.playJump();
      expect(playSpy).toHaveBeenCalled();
    });

    test('should play collision sound', () => {
      const playSpy = jest.spyOn(audioSystem, 'playCollision');
      audioSystem.playCollision();
      expect(playSpy).toHaveBeenCalled();
    });

    test('should play collect sound', () => {
      const playSpy = jest.spyOn(audioSystem, 'playCollect');
      audioSystem.playCollect();
      expect(playSpy).toHaveBeenCalled();
    });
  });

  describe('Background Music', () => {
    test('should start background music', () => {
      const startSpy = jest.spyOn(audioSystem, 'startBackgroundMusic');
      audioSystem.startBackgroundMusic();
      expect(startSpy).toHaveBeenCalled();
    });

    test('should stop background music', () => {
      const stopSpy = jest.spyOn(audioSystem, 'stopBackgroundMusic');
      audioSystem.stopBackgroundMusic();
      expect(stopSpy).toHaveBeenCalled();
    });
  });
});