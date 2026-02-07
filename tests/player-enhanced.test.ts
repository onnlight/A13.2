import { Player } from '../src/player';

// Mock setup for player movement tests
jest.mock('../src/audio', () => ({
  AudioManager: jest.fn().mockImplementation(() => ({
    getListener: jest.fn().mockReturnValue({}),
    playSound: jest.fn(),
    stopSound: jest.fn(),
  }))
}));

describe('Enhanced Player Movement Tests', () => {
  let player: Player;

  beforeEach(() => {
    jest.clearAllMocks();
    player = new Player('neon');
  });

  afterEach(() => {
    if (player) {
      player.dispose();
    }
  });

  describe('Keyboard Controls', () => {
    test('should move left when A is pressed', () => {
      const initialX = player.position.x;
      player.moveLeft();
      
      expect(player.position.x).toBeLessThan(initialX);
    });

    test('should move right when D is pressed', () => {
      const initialX = player.position.x;
      player.moveRight();
      
      expect(player.position.x).toBeGreaterThan(initialX);
    });

    test('should handle rapid movement commands', () => {
      // Test rapid left/right movement
      const initialX = player.position.x;
      
      // Move left multiple times
      for (let i = 0; i < 10; i++) {
        player.moveLeft();
      }
      
      // Should not move beyond left boundary
      expect(player.position.x).toBeGreaterThanOrEqual(-4);
      
      // Move right multiple times
      for (let i = 0; i < 10; i++) {
        player.moveRight();
      }
      
      // Should not move beyond right boundary
      expect(player.position.x).toBeLessThanOrEqual(4);
    });
  });

  describe('Movement Boundaries', () => {
    test('should not move beyond left boundary', () => {
      // Try to move far left
      for (let i = 0; i < 100; i++) {
        player.moveLeft();
      }
      
      expect(player.position.x).toBeGreaterThanOrEqual(-4);
    });

    test('should not move beyond right boundary', () => {
      // Try to move far right
      for (let i = 0; i < 100; i++) {
        player.moveRight();
      }
      
      expect(player.position.x).toBeLessThanOrEqual(4);
    });

    test('should maintain position within valid range', () => {
      // Move in both directions
      player.moveLeft();
      player.moveRight();
      player.moveLeft();
      
      // Should always be within bounds
      expect(player.position.x).toBeGreaterThanOrEqual(-4);
      expect(player.position.x).toBeLessThanOrEqual(4);
    });
  });

  describe('Smooth Movement', () => {
    test('should interpolate movement smoothly', () => {
      const initialX = player.position.x;
      
      // Start movement to the right
      player.moveRight();
      
      // Before update, target should be set
      expect((player as any).targetX).toBeGreaterThan(initialX);
      expect((player as any).isMoving).toBe(true);
      
      // Simulate update
      const previousX = player.position.x;
      player.update(0.016); // 60 FPS
      
      // Should have moved towards target
      expect(player.position.x).toBeGreaterThan(previousX);
      expect(player.position.x).toBeLessThanOrEqual((player as any).targetX);
    });

    test('should complete movement interpolation', () => {
      // Move to target
      player.moveRight();
      
      // Update multiple times until reached
      for (let i = 0; i < 100; i++) {
        player.update(0.016);
      }
      
      // Should have reached target
      expect(player.position.x).toBe((player as any).targetX);
      expect((player as any).isMoving).toBe(false);
    });
  });

  describe('Visual Feedback', () => {
    test('should add visual feedback on movement', () => {
      const mockAudioManager = (player as any).audioManager;
      
      player.moveLeft();
      
      // Should play jump sound
      expect(mockAudioManager.playSound).toHaveBeenCalledWith('jump');
    });

    test('should scale mesh during movement', () => {
      const initialScaleX = player.mesh.scale.x;
      
      player.moveRight();
      
      // Should have different scale (visual feedback)
      expect(player.mesh.scale.x).not.toBe(initialScaleX);
    });
  });

  describe('Reset and Initialization', () => {
    test('should reset to center position', () => {
      // Move player away from center
      player.moveLeft();
      player.moveLeft();
      player.moveLeft();
      
      expect(player.position.x).toBeLessThan(0);
      
      // Reset should return to center
      player.reset();
      expect(player.position.x).toBe(0);
    });

    test('should clear all power-ups on reset', () => {
      // Add some power-ups
      player.addPowerUp('shield', 5000, 1);
      player.addPowerUp('speed', 3000, 1.5);
      
      expect(player.hasActivePowerUp('shield')).toBe(true);
      expect(player.hasActivePowerUp('speed')).toBe(true);
      
      // Reset should clear them
      player.reset();
      expect(player.hasActivePowerUp('shield')).toBe(false);
      expect(player.hasActivePowerUp('speed')).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should handle rapid state changes', () => {
      const start = performance.now();
      
      // Rapid state changes
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          player.moveLeft();
        } else {
          player.moveRight();
        }
        player.update(0.016);
      }
      
      const end = performance.now();
      
      // Should complete within reasonable time
      expect(end - start).toBeLessThan(100); // Should be fast
    });
  });
});