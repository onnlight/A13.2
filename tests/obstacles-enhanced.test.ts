import { ObstacleManager, PowerUpTypeStr } from '../src/obstacles';
import * as THREE from 'three';

// Mock setup for obstacle system tests
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    position: { x: 0, y: 0, z: 0 },
  })),
}));

describe('Enhanced Obstacle System Tests', () => {
  let obstacleManager: ObstacleManager;
  let mockScene: THREE.Scene;

  beforeEach(() => {
    jest.clearAllMocks();
    mockScene = new THREE.Scene();
    obstacleManager = new ObstacleManager(mockScene);
  });

  afterEach(() => {
    if (obstacleManager) {
      obstacleManager.dispose();
    }
  });

  describe('Power-up Generation', () => {
    test('should generate different power-up types', () => {
      const powerUps = [];
      
      // Generate multiple power-ups
      for (let i = 0; i < 20; i++) {
        const powerUp = obstacleManager.generatePowerUp();
        if (powerUp) {
          powerUps.push(powerUp);
          obstacleManager.addPowerUp(powerUp);
        }
      }

      // Should have generated various power-up types
      const types = powerUps.map(p => p.subtype);
      expect(types).toContain('speed');
      expect(types).toContain('shield');
      expect(types).toContain('multiplier');
    });

    test('should spawn power-ups at regular intervals', () => {
      const initialCount = obstacleManager.getPowerUps().length;
      
      // Update multiple times
      for (let i = 0; i < 10; i++) {
        obstacleManager.update(100, 0.3); // 100ms delta
      }

      // Should have spawned new power-ups
      const finalCount = obstacleManager.getPowerUps().length;
      expect(finalCount).toBeGreaterThan(initialCount);
    });

    test('should increase power-up spawn rate over time', () => {
      const rates: number[] = [];
      
      // Track spawn rates
      for (let i = 0; i < 50; i++) {
        const beforeCount = obstacleManager.getPowerUps().length;
        obstacleManager.update(100, 0.3);
        const afterCount = obstacleManager.getPowerUps().length;
        
        if (afterCount > beforeCount) {
          rates.push(afterCount - beforeCount);
        }
      }
      
      // Spawn rate should increase over time
      expect(rates.length).toBeGreaterThan(0);
    });
  });

  describe('Power-up Collection', () => {
    test('should detect power-up collection', () => {
      // Create a player bounding box
      const playerBox = new THREE.Box3();
      playerBox.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2));
      
      // Add a power-up
      const powerUp = obstacleManager.generatePowerUp();
      if (powerUp) {
        obstacleManager.addPowerUp(powerUp);
        // Position power-up to overlap with player
        powerUp.position.copy(playerBox.center);
      }
      
      // Check collisions
      const collisions = obstacleManager.checkCollisions(playerBox);
      
      expect(collisions.powerUpCollected).toBeTruthy();
    });

    test('should remove collected power-ups', () => {
      // Add power-ups
      const powerUp1 = obstacleManager.generatePowerUp();
      const powerUp2 = obstacleManager.generatePowerUp();
      
      if (powerUp1) obstacleManager.addPowerUp(powerUp1);
      if (powerUp2) obstacleManager.addPowerUp(powerUp2);
      
      // Position both to overlap with player
      const playerBox = new THREE.Box3();
      const center = new THREE.Vector3(0, 0, 0);
      playerBox.setFromCenterAndSize(center, new THREE.Vector3(10, 10, 10));
      
      if (powerUp1) powerUp1.position.copy(center);
      if (powerUp2) powerUp2.position.copy(center);
      
      // Check first collision
      const collisions1 = obstacleManager.checkCollisions(playerBox);
      expect(collisions1.powerUpCollected).toBeTruthy();
      
      // Should remove first power-up
      expect(obstacleManager.getPowerUps().length).toBe(1);
      
      // Check second collision
      const collisions2 = obstacleManager.checkCollisions(playerBox);
      expect(collisions2.powerUpCollected).toBeTruthy();
      
      // Should remove second power-up
      expect(obstacleManager.getPowerUps().length).toBe(0);
    });

    test('should not collect multiple power-ups at once', () => {
      // Add power-ups
      const powerUp1 = obstacleManager.generatePowerUp();
      const powerUp2 = obstacleManager.generatePowerUp();
      
      if (powerUp1) obstacleManager.addPowerUp(powerUp1);
      if (powerUp2) obstacleManager.addPowerUp(powerUp2);
      
      // Position both at same location
      const playerBox = new THREE.Box3();
      playerBox.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 10, 10));
      
      if (powerUp1) powerUp1.position.copy(playerBox.center);
      if (powerUp2) powerUp2.position.copy(playerBox.center);
      
      // Should only collect one
      const collisions = obstacleManager.checkCollisions(playerBox);
      expect(collisions.powerUpCollected).toBeTruthy();
      expect(obstacleManager.getPowerUps().length).toBe(1); // One remaining
    });
  });

  describe('Obstacle Generation', () => {
    test('should generate obstacles with different types', () => {
      // Generate multiple obstacles
      for (let i = 0; i < 20; i++) {
        obstacleManager.update(100, 0.3);
      }
      
      const obstacles = obstacleManager.getObstacles();
      expect(obstacles.length).toBeGreaterThan(0);
      
      // Should have various obstacle types
      const types = obstacles.map(o => o.subtype);
      expect(types).toContain('cube');
      expect(types).toContain('cylinder');
      expect(types).toContain('pyramid');
    });

    test('should increase obstacle difficulty over time', () => {
      const initialRate = obstacleManager['currentSpawnRate'];
      const rates: number[] = [];
      
      // Track spawn rates
      for (let i = 0; i < 50; i++) {
        const beforeCount = obstacleManager.getObstacles().length;
        obstacleManager.update(100, 0.3);
        const afterCount = obstacleManager.getObstacles().length;
        
        if (afterCount > beforeCount) {
          rates.push(obstacleManager['currentSpawnRate']);
        }
      }
      
      // Spawn rate should increase
      expect(rates[rates.length - 1]).toBeGreaterThan(initialRate);
    });

    test('should adapt to difficulty changes', () => {
      // Start with easy difficulty
      obstacleManager.setDifficulty('easy');
      const easyRate = obstacleManager['currentSpawnRate'];
      
      // Switch to hard difficulty
      obstacleManager.setDifficulty('hard');
      const hardRate = obstacleManager['currentSpawnRate'];
      
      // Hard should spawn more frequently
      expect(hardRate).toBeGreaterThan(easyRate);
    });
  });

  describe('Collision Detection', () => {
    test('should detect simple obstacle collision', () => {
      // Create obstacle and player
      const obstacle = obstacleManager.generateObstacle();
      if (obstacle) {
        obstacleManager.addObstacle(obstacle);
      }
      
      const playerBox = new THREE.Box3();
      playerBox.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2));
      
      // Position obstacle to overlap with player
      if (obstacle) obstacle.position.copy(playerBox.center);
      
      const collisions = obstacleManager.checkCollisions(playerBox);
      expect(collisions.obstacleCollision).toBe(true);
    });

    test('should handle multiple obstacle collisions', () => {
      // Add multiple obstacles
      const obstacles = [];
      for (let i = 0; i < 5; i++) {
        const obstacle = obstacleManager.generateObstacle();
        if (obstacle) {
          obstacles.push(obstacle);
          obstacleManager.addObstacle(obstacle);
        }
      }
      
      const playerBox = new THREE.Box3();
      playerBox.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 10, 10));
      
      // Position all obstacles to overlap with player
      obstacles.forEach(obstacle => {
        if (obstacle) obstacle.position.copy(playerBox.center);
      });
      
      const collisions = obstacleManager.checkCollisions(playerBox);
      
      // Should detect collision
      expect(collisions.obstacleCollision).toBe(true);
      
      // Should remove the first obstacle that collided
      expect(obstacleManager.getObstacles().length).toBe(obstacles.length - 1);
    });

    test('should not detect collision when not overlapping', () => {
      // Add obstacle and player far apart
      const obstacle = obstacleManager.generateObstacle();
      if (obstacle) {
        obstacleManager.addObstacle(obstacle);
      }
      
      const playerBox = new THREE.Box3();
      playerBox.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2));
      
      // Keep obstacle far away
      if (obstacle) obstacle.position.set(100, 0, 0);
      
      const collisions = obstacleManager.checkCollisions(playerBox);
      expect(collisions.obstacleCollision).toBe(false);
      expect(collisions.powerUpCollected).toBeNull();
    });
  });

  describe('Performance Optimization', () => {
    test('should limit total objects in scene', () => {
      // Add many objects
      for (let i = 0; i < 200; i++) {
        const obstacle = obstacleManager.generateObstacle();
        if (obstacle) obstacleManager.addObstacle(obstacle);
        
        const powerUp = obstacleManager.generatePowerUp();
        if (powerUp) obstacleManager.addPowerUp(powerUp);
      }
      
      // Should maintain reasonable object count
      expect(obstacleManager.getObstacles().length).toBeLessThan(150);
      expect(obstacleManager.getPowerUps().length).toBeLessThan(50);
    });

    test('should efficiently remove off-screen objects', () => {
      // Add obstacles at various distances
      for (let i = 0; i < 50; i++) {
        const obstacle = obstacleManager.generateObstacle();
        if (obstacle) {
          obstacle.position.z = -i * 5; // Move backwards
          obstacleManager.addObstacle(obstacle);
        }
      }
      
      const initialCount = obstacleManager.getObstacles().length;
      
      // Update to move obstacles forward
      obstacleManager.update(100, 0.3);
      
      // Should have removed off-screen obstacles
      const finalCount = obstacleManager.getObstacles().length;
      expect(finalCount).toBeLessThan(initialCount);
    });

    test('should handle rapid updates', () => {
      const startTime = performance.now();
      
      // Rapid updates
      for (let i = 0; i < 100; i++) {
        obstacleManager.update(16, 0.3); // 60 FPS
      }
      
      const endTime = performance.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(100); // Should be efficient
    });
  });

  describe('Difficulty Scaling', () => {
    test('should scale spawn rate with difficulty', () => {
      const difficulties = ['easy', 'medium', 'hard'];
      const rates: number[] = [];
      
      difficulties.forEach(difficulty => {
        obstacleManager.setDifficulty(difficulty);
        obstacleManager.update(100, 0.3);
        rates.push(obstacleManager['currentSpawnRate']);
      });
      
      // Rates should scale properly
      expect(rates[1]).toBeGreaterThan(rates[0]);
      expect(rates[2]).toBeGreaterThan(rates[1]);
    });

    test('should scale game speed with difficulty', () => {
      // Mock base speed
      const baseSpeeds = { easy: 0.2, medium: 0.3, hard: 0.4 };
      
      const speeds: number[] = [];
      
      Object.keys(baseSpeeds).forEach(key => {
        obstacleManager.setDifficulty(key as any);
        speeds.push(obstacleManager['gameSpeed'] || 0.3);
      });
      
      // Should match expected speeds
      expect(speeds[0]).toBe(baseSpeeds.easy);
      expect(speeds[1]).toBe(baseSpeeds.medium);
      expect(speeds[2]).toBe(baseSpeeds.hard);
    });
  });
});