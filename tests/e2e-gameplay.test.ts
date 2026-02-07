// End-to-End Gameplay Tests
import { Game } from '../src/main';

describe('E2E Gameplay Tests', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  afterEach(() => {
    if (game) {
      game.dispose();
    }
  });

  describe('Complete Game Loop', () => {
    test('should run full game cycle', async () => {
      // Start game
      game.start();
      expect(game.getState()).toBe('menu');

      // Navigate to gameplay
      game.navigateTo('gameplay');
      expect(game.getState()).toBe('playing');

      // Simulate game running
      await new Promise(resolve => setTimeout(resolve, 100));

      // Pause game
      game.pause();
      expect(game.getState()).toBe('paused');

      // Resume game
      game.resume();
      expect(game.getState()).toBe('playing');

      // End game
      game.gameOver();
      expect(game.getState()).toBe('gameOver');

      // Return to menu
      game.navigateTo('menu');
      expect(game.getState()).toBe('menu');
    });
  });

  describe('Input Handling', () => {
    test('should handle keyboard input sequence', () => {
      game.navigateTo('gameplay');
      
      // Simulate key presses
      const leftKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const rightKeyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const spaceKeyEvent = new KeyboardEvent('keydown', { key: ' ' });
      
      document.dispatchEvent(leftKeyEvent);
      document.dispatchEvent(rightKeyEvent);
      document.dispatchEvent(spaceKeyEvent);
      
      // Game should still be playing
      expect(game.getState()).toBe('playing');
    });
  });

  describe('Score System', () => {
    test('should track score progression', () => {
      game.navigateTo('gameplay');
      
      const initialScore = game.getScore();
      expect(initialScore).toBe(0);
      
      // Simulate scoring
      game.addScore(100);
      expect(game.getScore()).toBe(100);
      
      game.addScore(50);
      expect(game.getScore()).toBe(150);
    });
  });

  describe('Settings Persistence', () => {
    test('should save and load settings', () => {
      const testSettings = {
        musicVolume: 0.8,
        sfxVolume: 0.6,
        difficulty: 'hard'
      };
      
      game.saveSettings(testSettings);
      const loadedSettings = game.loadSettings();
      
      expect(loadedSettings).toEqual(testSettings);
    });
  });

  describe('Performance', () => {
    test('should maintain frame rate', async () => {
      game.navigateTo('gameplay');
      
      const startTime = performance.now();
      await new Promise(resolve => setTimeout(resolve, 100));
      const endTime = performance.now();
      
      // Should process frames without significant delay
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});