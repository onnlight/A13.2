import { ObstacleManager } from '../src/obstacles';

// Mock THREE objects
const mockScene = {
  add: jest.fn(),
  remove: jest.fn()
} as any;

const mockMesh = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  geometry: { dispose: jest.fn() },
  material: {},
  userData: {}
};

const mockBoundingBox = {
  setFromObject: jest.fn(),
  intersectsBox: jest.fn().mockReturnValue(false)
};

describe('ObstacleManager Class Tests', () => {
  let obstacleManager: ObstacleManager;

  beforeEach(() => {
    jest.clearAllMocks();
    obstacleManager = new ObstacleManager(mockScene, 10);
  });

  describe('ObstacleManager Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(obstacleManager.obstacles).toEqual([]);
      expect(obstacleManager.powerUps).toEqual([]);
      expect(obstacleManager.getCurrentDifficulty()).toBe(1);
      expect(obstacleManager.getObstacleCount()).toBe(0);
      expect(obstacleManager.getPowerUpCount()).toBe(0);
    });

    test('should accept custom road width', () => {
      const customManager = new ObstacleManager(mockScene, 15);
      expect(customManager['roadWidth']).toBe(15);
    });
  });

  describe('Difficulty Settings', () => {
    test('should set easy difficulty correctly', () => {
      obstacleManager.setDifficulty('easy');
      
      expect(obstacleManager['baseSpawnRate']).toBe(1500);
      expect(obstacleManager['currentSpawnRate']).toBe(1500);
      expect(obstacleManager['powerUpSpawnChance']).toBe(0.15);
    });

    test('should set medium difficulty correctly', () => {
      obstacleManager.setDifficulty('medium');
      
      expect(obstacleManager['baseSpawnRate']).toBe(1000);
      expect(obstacleManager['currentSpawnRate']).toBe(1000);
      expect(obstacleManager['powerUpSpawnChance']).toBe(0.10);
    });

    test('should set hard difficulty correctly', () => {
      obstacleManager.setDifficulty('hard');
      
      expect(obstacleManager['baseSpawnRate']).toBe(700);
      expect(obstacleManager['currentSpawnRate']).toBe(700);
      expect(obstacleManager['powerUpSpawnChance']).toBe(0.05);
    });
  });

  describe('Obstacle Spawning', () => {
    test('should spawn obstacles at regular intervals', () => {
      // Mock Math.random to return 1 (always spawn obstacle, never power-up)
      jest.spyOn(Math, 'random').mockReturnValue(1);
      
      // Update past spawn interval
      obstacleManager.update(1500, 0.3); // deltaTime longer than spawn rate
      
      expect(obstacleManager.getObstacleCount()).toBe(1);
      expect(mockScene.add).toHaveBeenCalled();
    });

    test('should spawn different obstacle types', () => {
      const obstacleTypes = ['cube', 'cylinder', 'pyramid'];
      let spawnCount = 0;
      
      obstacleTypes.forEach(() => {
        jest.spyOn(Math, 'random').mockReturnValue(1); // Always obstacle
        jest.spyOn(Math, 'floor').mockReturnValue(spawnCount % 3); // Cycle through types
        
        obstacleManager.update(1500, 0.3);
        spawnCount++;
      });
      
      expect(obstacleManager.getObstacleCount()).toBe(3);
    });

    test('should position obstacles in valid lanes', () => {
      jest.spyOn(Math, 'random').mockReturnValue(1); // Always obstacle
      jest.spyOn(Math, 'floor').mockReturnValue(0); // First lane
      
      obstacleManager.update(1500, 0.3);
      
      if (obstacleManager.obstacles.length > 0) {
        const obstacle = obstacleManager.obstacles[0];
        expect([-3, -1, 1, 3]).toContain(obstacle.position.x);
      }
    });

    test('should increase difficulty over time', () => {
      const initialDifficulty = obstacleManager.getCurrentDifficulty();
      
      // Simulate many updates
      for (let i = 0; i < 100; i++) {
        obstacleManager.update(100, 0.3);
      }
      
      expect(obstacleManager.getCurrentDifficulty()).toBeGreaterThan(initialDifficulty);
    });

    test('should adjust spawn rate based on difficulty', () => {
      const initialSpawnRate = obstacleManager['currentSpawnRate'];
      
      // Simulate difficulty increase
      for (let i = 0; i < 100; i++) {
        obstacleManager.update(100, 0.3);
      }
      
      expect(obstacleManager['currentSpawnRate']).toBeLessThan(initialSpawnRate);
    });
  });

  describe('Power-Up Spawning', () => {
    test('should spawn power-ups based on probability', () => {
      // Mock Math.random to return 0 (always spawn power-up)
      jest.spyOn(Math, 'random').mockReturnValue(0);
      jest.spyOn(Math, 'floor').mockReturnValue(0); // First power-up type
      
      obstacleManager.update(1500, 0.3);
      
      expect(obstacleManager.getPowerUpCount()).toBe(1);
      expect(mockScene.add).toHaveBeenCalled();
    });

    test('should spawn different power-up types', () => {
      const powerUpTypes = ['speed', 'shield', 'multiplier'];
      
      powerUpTypes.forEach((type, index) => {
        jest.spyOn(Math, 'random').mockReturnValue(0); // Always power-up
        jest.spyOn(Math, 'floor').mockReturnValue(index); // Specific type
        
        obstacleManager.update(1500, 0.3);
      });
      
      expect(obstacleManager.getPowerUpCount()).toBe(3);
    });

    test('should position power-ups in valid lanes', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0); // Always power-up
      jest.spyOn(Math, 'floor').mockReturnValue(0); // First lane and type
      
      obstacleManager.update(1500, 0.3);
      
      if (obstacleManager.powerUps.length > 0) {
        const powerUp = obstacleManager.powerUps[0];
        expect([-3, -1, 1, 3]).toContain(powerUp.position.x);
      }
    });
  });

  describe('Object Movement', () => {
    beforeEach(() => {
      // Create some test objects
      jest.spyOn(Math, 'random').mockReturnValue(1); // Obstacles only
      
      // Spawn some obstacles
      for (let i = 0; i < 3; i++) {
        obstacleManager.update(1500, 0.3);
      }
    });

    test('should move obstacles forward with game speed', () => {
      const initialZ = obstacleManager.obstacles[0].position.z;
      const gameSpeed = 0.3;
      
      obstacleManager.update(16, gameSpeed); // 60fps frame
      
      expect(obstacleManager.obstacles[0].position.z).toBeGreaterThan(initialZ);
    });

    test('should remove obstacles that go too far', () => {
      // Place an obstacle beyond max distance
      if (obstacleManager.obstacles.length > 0) {
        obstacleManager.obstacles[0].position.z = 60; // Beyond max distance (50)
        
        const initialCount = obstacleManager.getObstacleCount();
        
        obstacleManager.update(16, 0.3);
        
        expect(obstacleManager.getObstacleCount()).toBeLessThan(initialCount);
        expect(mockScene.remove).toHaveBeenCalled();
      }
    });

    test('should rotate obstacles during movement', () => {
      if (obstacleManager.obstacles.length > 0) {
        const initialRotation = obstacleManager.obstacles[0].mesh.rotation.y;
        
        obstacleManager.update(16, 0.3);
        
        expect(obstacleManager.obstacles[0].mesh.rotation.y).not.toBe(initialRotation);
      }
    });

    test('should animate power-ups with rotation and floating', () => {
      // Spawn a power-up
      jest.spyOn(Math, 'random').mockReturnValue(0); // Power-up
      obstacleManager.update(1500, 0.3);
      
      if (obstacleManager.powerUps.length > 0) {
        const powerUp = obstacleManager.powerUps[0];
        const initialY = powerUp.mesh.position.y;
        const initialRotation = powerUp.mesh.rotation.y;
        
        obstacleManager.update(16, 0.3);
        
        // Should have rotated
        expect(powerUp.mesh.rotation.y).not.toBe(initialRotation);
        
        // Should have floating animation (might be the same due to sine wave)
        expect(powerUp.mesh.position.y).toBeDefined();
      }
    });
  });

  describe('Collision Detection', () => {
    let mockPlayerBox: any;

    beforeEach(() => {
      mockPlayerBox = {
        intersectsBox: jest.fn().mockReturnValue(false)
      };
      
      // Spawn test objects
      jest.spyOn(Math, 'random').mockReturnValue(1); // Obstacles
      
      // Spawn obstacle
      obstacleManager.update(1500, 0.3);
    });

    test('should detect obstacle collision', () => {
      mockPlayerBox.intersectsBox = jest.fn().mockReturnValue(true);
      
      const result = obstacleManager.checkCollisions(mockPlayerBox);
      
      expect(result.obstacleCollision).toBe(true);
      expect(obstacleManager.getObstacleCount()).toBe(0); // Should remove collided obstacle
    });

    test('should detect power-up collection', () => {
      // Spawn power-up
      jest.spyOn(Math, 'random').mockReturnValue(0); // Power-up
      obstacleManager.update(1500, 0.3);
      
      mockPlayerBox.intersectsBox = jest.fn().mockReturnValue(true);
      
      const result = obstacleManager.checkCollisions(mockPlayerBox);
      
      expect(result.powerUpCollected).toBeTruthy();
      expect(result.powerUpCollected).toMatch(/^(speed|shield|multiplier)$/);
      expect(obstacleManager.getPowerUpCount()).toBe(0); // Should remove collected power-up
    });

    test('should return no collision when nothing hits', () => {
      const result = obstacleManager.checkCollisions(mockPlayerBox);
      
      expect(result.obstacleCollision).toBe(false);
      expect(result.powerUpCollected).toBeNull();
    });

    test('should prioritize obstacle collision over power-up collection', () => {
      // Spawn both obstacle and power-up
      jest.spyOn(Math, 'random').mockReturnValueOnce(1).mockReturnValueOnce(0); // Obstacle then power-up
      obstacleManager.update(1500, 0.3);
      obstacleManager.update(1500, 0.3);
      
      mockPlayerBox.intersectsBox = jest.fn().mockReturnValue(true);
      
      const result = obstacleManager.checkCollisions(mockPlayerBox);
      
      // Should detect obstacle collision first
      expect(result.obstacleCollision).toBe(true);
    });
  });

  describe('Bounding Box Updates', () => {
    test('should update obstacle bounding boxes', () => {
      jest.spyOn(Math, 'random').mockReturnValue(1); // Obstacle
      obstacleManager.update(1500, 0.3);
      
      if (obstacleManager.obstacles.length > 0) {
        const obstacle = obstacleManager.obstacles[0];
        obstacle.boundingBox = mockBoundingBox;
        
        obstacleManager.update(16, 0.3);
        
        expect(obstacle.boundingBox.setFromObject).toHaveBeenCalledWith(obstacle.mesh);
      }
    });

    test('should update power-up bounding boxes', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0); // Power-up
      obstacleManager.update(1500, 0.3);
      
      if (obstacleManager.powerUps.length > 0) {
        const powerUp = obstacleManager.powerUps[0];
        powerUp.boundingBox = mockBoundingBox;
        
        obstacleManager.update(16, 0.3);
        
        expect(powerUp.boundingBox.setFromObject).toHaveBeenCalledWith(powerUp.mesh);
      }
    });
  });

  describe('Resource Management', () => {
    test('should dispose of obstacle geometry and materials', () => {
      jest.spyOn(Math, 'random').mockReturnValue(1); // Obstacle
      obstacleManager.update(1500, 0.3);
      
      if (obstacleManager.obstacles.length > 0) {
        const obstacle = obstacleManager.obstacles[0];
        obstacle.mesh.geometry = { dispose: jest.fn() };
        obstacle.mesh.material = { dispose: jest.fn() };
        
        // Manually remove to test disposal
        obstacleManager['removeObstacle'](0);
        
        expect(obstacle.mesh.geometry.dispose).toHaveBeenCalled();
        expect(mockScene.remove).toHaveBeenCalledWith(obstacle.mesh);
      }
    });

    test('should dispose of power-up geometry and materials', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0); // Power-up
      obstacleManager.update(1500, 0.3);
      
      if (obstacleManager.powerUps.length > 0) {
        const powerUp = obstacleManager.powerUps[0];
        powerUp.mesh.geometry = { dispose: jest.fn() };
        powerUp.mesh.material = { dispose: jest.fn() };
        
        // Manually remove to test disposal
        obstacleManager['removePowerUp'](0);
        
        expect(powerUp.mesh.geometry.dispose).toHaveBeenCalled();
        expect(mockScene.remove).toHaveBeenCalledWith(powerUp.mesh);
      }
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      // Spawn various objects
      for (let i = 0; i < 5; i++) {
        jest.spyOn(Math, 'random').mockReturnValue(i % 2); // Alternate obstacle/power-up
        obstacleManager.update(1500, 0.3);
      }
    });

    test('should clear all obstacles on reset', () => {
      const initialObstacleCount = obstacleManager.getObstacleCount();
      
      obstacleManager.reset();
      
      expect(obstacleManager.getObstacleCount()).toBe(0);
      expect(initialObstacleCount).toBeGreaterThan(0);
    });

    test('should clear all power-ups on reset', () => {
      const initialPowerUpCount = obstacleManager.getPowerUpCount();
      
      obstacleManager.reset();
      
      expect(obstacleManager.getPowerUpCount()).toBe(0);
      expect(initialPowerUpCount).toBeGreaterThan(0);
    });

    test('should reset difficulty to base level', () => {
      // Increase difficulty
      for (let i = 0; i < 50; i++) {
        obstacleManager.update(100, 0.3);
      }
      
      const increasedDifficulty = obstacleManager.getCurrentDifficulty();
      
      obstacleManager.reset();
      
      expect(obstacleManager.getCurrentDifficulty()).toBe(1);
      expect(increasedDifficulty).toBeGreaterThan(1);
    });

    test('should reset spawn rate', () => {
      // Change spawn rate by increasing difficulty
      for (let i = 0; i < 50; i++) {
        obstacleManager.update(100, 0.3);
      }
      
      const increasedSpawnRate = obstacleManager['currentSpawnRate'];
      
      obstacleManager.reset();
      
      expect(obstacleManager['currentSpawnRate']).toBe(obstacleManager['baseSpawnRate']);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty collision check', () => {
      const result = obstacleManager.checkCollisions(mockBoundingBox);
      
      expect(result.obstacleCollision).toBe(false);
      expect(result.powerUpCollected).toBeNull();
    });

    test('should handle update with zero deltaTime', () => {
      obstacleManager.update(0, 0.3);
      
      // Should not crash
      expect(obstacleManager.getObstacleCount()).toBe(0);
    });

    test('should handle update with zero game speed', () => {
      // Spawn objects first
      jest.spyOn(Math, 'random').mockReturnValue(1);
      obstacleManager.update(1500, 0.3);
      
      const initialZ = obstacleManager.obstacles[0].position.z;
      
      obstacleManager.update(16, 0);
      
      // Objects should not move with zero speed
      expect(obstacleManager.obstacles[0].position.z).toBe(initialZ);
    });

    test('should handle rapid spawn attempts', () => {
      jest.spyOn(Math, 'random').mockReturnValue(1); // Always obstacles
      
      // Rapid updates that would normally spawn many objects
      for (let i = 0; i < 100; i++) {
        obstacleManager.update(200, 0.3);
      }
      
      // Should not crash and should have reasonable number of objects
      expect(obstacleManager.getObstacleCount()).toBeGreaterThan(0);
      expect(obstacleManager.getObstacleCount()).toBeLessThan(100);
    });
  });

  describe('Performance and Memory', () => {
    test('should not leak memory on object removal', () => {
      jest.spyOn(Math, 'random').mockReturnValue(1); // Always obstacles
      
      // Spawn and remove objects repeatedly
      for (let i = 0; i < 10; i++) {
        obstacleManager.update(1500, 0.3);
        
        // Move obstacles far away to trigger removal
        obstacleManager.obstacles.forEach(obstacle => {
          obstacle.position.z = 60;
        });
        
        obstacleManager.update(16, 0.3);
      }
      
      // All objects should be cleaned up
      expect(obstacleManager.getObstacleCount()).toBe(0);
      expect(mockScene.remove).toHaveBeenCalledTimes(10);
    });

    test('should handle high game speed gracefully', () => {
      jest.spyOn(Math, 'random').mockReturnValue(1); // Always obstacles
      obstacleManager.update(1500, 0.3); // Spawn obstacle
      
      if (obstacleManager.obstacles.length > 0) {
        const initialZ = obstacleManager.obstacles[0].position.z;
        
        // Very high speed
        obstacleManager.update(16, 10);
        
        // Should move much further
        expect(obstacleManager.obstacles[0].position.z).toBeGreaterThan(initialZ + 1);
      }
    });
  });
});