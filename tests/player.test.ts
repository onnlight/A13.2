import { Player, CubeSkin, PowerUpType } from '../src/player';

// Mock THREE.Scene for testing
const mockScene = {
  add: jest.fn(),
  remove: jest.fn()
} as any;

describe('Player Class Tests', () => {
  let player: Player;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a new player instance for each test
    player = new Player('neon');
    
    // Initialize the mesh manually for testing
    player.mesh = {
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      add: jest.fn(),
      remove: jest.fn(),
      geometry: { dispose: jest.fn() },
      material: {},
      getObjectByName: jest.fn(),
      userData: {}
    } as any;
    
    player.boundingBox = {
      setFromObject: jest.fn(),
      intersectsBox: jest.fn().mockReturnValue(false)
    } as any;
  });

  describe('Player Initialization', () => {
    test('should create player with default position', () => {
      expect(player.position.x).toBe(0);
      expect(player.position.y).toBe(1);
      expect(player.position.z).toBe(0);
    });

    test('should initialize with correct default values', () => {
      expect(player.getSpeed()).toBe(player['baseSpeed']);
      expect(player.hasActivePowerUp('speed')).toBe(false);
      expect(player.hasActivePowerUp('shield')).toBe(false);
      expect(player.hasActivePowerUp('multiplier')).toBe(false);
    });

    test('should accept different cube skins', () => {
      const firePlayer = new Player('fire');
      const icePlayer = new Player('ice');
      const rainbowPlayer = new Player('rainbow');
      
      expect(firePlayer['skin']).toBe('fire');
      expect(icePlayer['skin']).toBe('ice');
      expect(rainbowPlayer['skin']).toBe('rainbow');
    });
  });

  describe('Player Movement Controls', () => {
    test('should move left when within bounds', () => {
      const initialX = player.position.x;
      player.moveLeft();
      player.update(16); // Simulate 60fps frame
      
      expect(player['targetX']).toBeLessThan(initialX);
      expect(player.position.x).toBeLessThan(initialX);
    });

    test('should move right when within bounds', () => {
      const initialX = player.position.x;
      player.moveRight();
      player.update(16);
      
      expect(player['targetX']).toBeGreaterThan(initialX);
      expect(player.position.x).toBeGreaterThan(initialX);
    });

    test('should not move beyond left boundary', () => {
      // Move player to left edge
      player.position.x = -3.9;
      player.moveLeft();
      player.update(16);
      
      // Should stay within bounds
      expect(player.position.x).toBeGreaterThanOrEqual(-4);
    });

    test('should not move beyond right boundary', () => {
      // Move player to right edge
      player.position.x = 3.9;
      player.moveRight();
      player.update(16);
      
      // Should stay within bounds
      expect(player.position.x).toBeLessThanOrEqual(4);
    });

    test('should handle lane-based movement correctly', () => {
      // Test multiple movements
      player.moveRight();
      player.update(16);
      const firstMove = player.position.x;
      
      player.moveRight();
      player.update(16);
      const secondMove = player.position.x;
      
      // Each move should be 2 units (lane width)
      expect(secondMove - firstMove).toBeCloseTo(2, 1);
    });

    test('should smooth movement interpolation', () => {
      player.moveLeft();
      
      // First update should start moving towards target
      player.update(16);
      const pos1 = player.position.x;
      
      // Second update should continue movement
      player.update(16);
      const pos2 = player.position.x;
      
      // Should be different positions showing interpolation
      expect(pos1).not.toBe(pos2);
    });
  });

  describe('Player Animation', () => {
    test('should rotate mesh during update', () => {
      const initialRotationX = player.mesh.rotation.x;
      const initialRotationY = player.mesh.rotation.y;
      
      player.update(16);
      
      expect(player.mesh.rotation.x).not.toBe(initialRotationX);
      expect(player.mesh.rotation.y).not.toBe(initialRotationY);
    });

    test('should animate bounce effect', () => {
      player.update(16);
      const initialY = player.mesh.position.y;
      
      // Continue updating to see bounce
      for (let i = 0; i < 10; i++) {
        player.update(16);
      }
      
      // Position should change due to bounce animation
      expect(player.mesh.position.y).not.toBe(initialY);
    });

    test('should animate glow intensity', () => {
      player.update(16);
      
      // The glow direction should change during animation
      const glowDirection = player['glowDirection'];
      
      // After enough updates, direction should flip
      for (let i = 0; i < 50; i++) {
        player.update(16);
      }
      
      expect(player['glowDirection']).toBe(-glowDirection);
    });
  });

  describe('Power-Up System', () => {
    test('should add speed power-up correctly', () => {
      const initialSpeed = player.getSpeed();
      player.addPowerUp('speed', 5000, 1.5);
      
      expect(player.hasActivePowerUp('speed')).toBe(true);
      expect(player.getSpeed()).toBe(initialSpeed * 1.5);
    });

    test('should add shield power-up correctly', () => {
      player.addPowerUp('shield', 5000, 1);
      
      expect(player.hasActivePowerUp('shield')).toBe(true);
      expect(player.isInvincible()).toBe(true);
    });

    test('should add score multiplier power-up correctly', () => {
      player.addPowerUp('multiplier', 5000, 2);
      
      expect(player.hasActivePowerUp('multiplier')).toBe(true);
      expect(player.getScoreMultiplier()).toBe(2);
    });

    test('should remove expired power-ups', () => {
      player.addPowerUp('speed', 100, 2); // Very short duration
      
      // Initially should have power-up
      expect(player.hasActivePowerUp('speed')).toBe(true);
      
      // Mock time passing
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 200);
      player.update(16);
      
      // Should be expired
      expect(player.hasActivePowerUp('speed')).toBe(false);
      expect(player.getSpeed()).toBe(player['baseSpeed']);
    });

    test('should handle multiple power-ups simultaneously', () => {
      player.addPowerUp('speed', 5000, 1.5);
      player.addPowerUp('shield', 5000, 1);
      player.addPowerUp('multiplier', 5000, 2);
      
      expect(player.hasActivePowerUp('speed')).toBe(true);
      expect(player.hasActivePowerUp('shield')).toBe(true);
      expect(player.hasActivePowerUp('multiplier')).toBe(true);
      expect(player.getScoreMultiplier()).toBe(2);
      expect(player.isInvincible()).toBe(true);
    });

    test('should get remaining power-up time correctly', () => {
      player.addPowerUp('speed', 5000, 2);
      
      const remaining = player.getRemainingPowerUpTime('speed');
      expect(remaining).toBeGreaterThan(4000); // Should be close to 5000
      expect(remaining).toBeLessThanOrEqual(5000);
    });

    test('should show shield mesh when shield active', () => {
      player.addPowerUp('shield', 5000, 1);
      player.update(16);
      
      // Shield mesh should be created and added
      expect(player['shieldMesh']).toBeDefined();
      expect(player.mesh.getObjectByName).toHaveBeenCalledWith('shield');
    });

    test('should hide shield mesh when shield inactive', () => {
      player.addPowerUp('shield', 100, 1); // Very short duration
      
      // Mock time passing
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 200);
      player.update(16);
      
      // Shield mesh should be removed
      expect(player['shieldMesh']).toBeUndefined();
      expect(player.isInvincible()).toBe(false);
    });
  });

  describe('Collision Detection', () => {
    test('should detect collision with obstacles', () => {
      const mockBox = {
        intersectsBox: jest.fn().mockReturnValue(true)
      } as any;
      
      player.boundingBox = mockBox;
      
      expect(player.checkCollision(mockBox)).toBe(true);
    });

    test('should not detect collision when shielded', () => {
      const mockBox = {
        intersectsBox: jest.fn().mockReturnValue(true)
      } as any;
      
      player.addPowerUp('shield', 5000, 1);
      player.boundingBox = mockBox;
      
      expect(player.checkCollision(mockBox)).toBe(false);
    });

    test('should update bounding box during update', () => {
      player.update(16);
      
      expect(player.boundingBox.setFromObject).toHaveBeenCalledWith(player.mesh);
    });
  });

  describe('Skin Management', () => {
    test('should change skin correctly', () => {
      player.changeSkin('fire');
      
      expect(player['skin']).toBe('fire');
      expect(player.mesh.material).toBeDefined();
    });

    test('should update glow color when skin changes', () => {
      const mockGlowMesh = { material: { color: {} } };
      player.mesh.getObjectByName = jest.fn().mockReturnValue(mockGlowMesh);
      
      player.changeSkin('ice');
      
      expect(player.mesh.getObjectByName).toHaveBeenCalledWith('glow');
    });

    test('should handle all available skins', () => {
      const skins: CubeSkin[] = ['neon', 'fire', 'ice', 'rainbow'];
      
      skins.forEach(skin => {
        expect(() => player.changeSkin(skin)).not.toThrow();
        expect(player['skin']).toBe(skin);
      });
    });
  });

  describe('Player Reset', () => {
    test('should reset all properties correctly', () => {
      // Modify player state
      player.addPowerUp('speed', 5000, 2);
      player.position.set(3, 2, 1);
      player.moveRight();
      
      // Reset player
      player.reset();
      
      // Check all reset values
      expect(player.position.x).toBe(0);
      expect(player.position.y).toBe(1);
      expect(player.position.z).toBe(0);
      expect(player.hasActivePowerUp('speed')).toBe(false);
      expect(player.getSpeed()).toBe(player['baseSpeed']);
      expect(player['isMoving']).toBe(false);
    });

    test('should clear all power-ups on reset', () => {
      player.addPowerUp('speed', 5000, 2);
      player.addPowerUp('shield', 5000, 1);
      player.addPowerUp('multiplier', 5000, 3);
      
      player.reset();
      
      expect(player.hasActivePowerUp('speed')).toBe(false);
      expect(player.hasActivePowerUp('shield')).toBe(false);
      expect(player.hasActivePowerUp('multiplier')).toBe(false);
      expect(player.getScoreMultiplier()).toBe(1);
    });

    test('should hide shield on reset', () => {
      player.addPowerUp('shield', 5000, 1);
      player.update(16);
      
      expect(player['shieldMesh']).toBeDefined();
      
      player.reset();
      
      expect(player['shieldMesh']).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid power-up types gracefully', () => {
      expect(() => player.addPowerUp('invalid' as PowerUpType, 5000, 1)).not.toThrow();
    });

    test('should handle zero duration power-ups', () => {
      player.addPowerUp('speed', 0, 2);
      
      // Should immediately not have the power-up
      player.update(16);
      expect(player.hasActivePowerUp('speed')).toBe(false);
    });

    test('should handle negative power-up values', () => {
      const initialSpeed = player.getSpeed();
      player.addPowerUp('speed', 5000, -1);
      
      // Should still apply the negative value (though this shouldn't happen in normal gameplay)
      expect(player.getSpeed()).not.toBe(initialSpeed);
    });

    test('should handle rapid movement commands', () => {
      // Move left and right rapidly
      for (let i = 0; i < 10; i++) {
        player.moveLeft();
        player.update(16);
        player.moveRight();
        player.update(16);
      }
      
      // Should not crash and position should be within bounds
      expect(player.position.x).toBeGreaterThanOrEqual(-4);
      expect(player.position.x).toBeLessThanOrEqual(4);
    });

    test('should handle update with zero deltaTime', () => {
      const initialPosition = player.position.clone();
      player.update(0);
      
      // Should not update position with zero deltaTime
      expect(player.position.x).toBe(initialPosition.x);
      expect(player.position.y).toBe(initialPosition.y);
      expect(player.position.z).toBe(initialPosition.z);
    });
  });
});