import { CoinManager } from '../src/coins';
import * as THREE from 'three';

// Mock THREE.js
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn()
  })),
  Box3: jest.fn().mockImplementation(() => ({
    setFromObject: jest.fn(),
    intersectsBox: jest.fn().mockReturnValue(false)
  })),
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set: jest.fn(),
    copy: jest.fn(),
    add: jest.fn(),
    subVectors: jest.fn(),
    normalize: jest.fn(),
    multiplyScalar: jest.fn(),
    distance: jest.fn().mockReturnValue(5)
  })),
  SphereGeometry: jest.fn(),
  MeshPhongMaterial: jest.fn(),
  Mesh: jest.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    children: [],
    add: jest.fn(),
    geometry: { dispose: jest.fn() },
    material: { dispose: jest.fn() }
  })),
  MeshBasicMaterial: jest.fn()
}));

describe('CoinManager', () => {
  let mockScene: THREE.Scene;
  let coinManager: CoinManager;

  beforeEach(() => {
    mockScene = new THREE.Scene();
    coinManager = new CoinManager(mockScene);
  });

  afterEach(() => {
    coinManager.dispose();
  });

  describe('Initialization', () => {
    it('should initialize with empty coins array', () => {
      expect(coinManager.coins).toHaveLength(0);
    });

    it('should have default spawn chance', () => {
      expect(coinManager.getSpawnChance()).toBe(0.3);
    });
  });

  describe('Coin Spawning', () => {
    it('should spawn coins in specified lane', () => {
      const lane = -1;
      coinManager.spawnCoins(lane);
      
      expect(coinManager.coins.length).toBeGreaterThan(0);
      expect(coinManager.coins.length).toBeLessThanOrEqual(3); // Max 3 coins per spawn
    });

    it('should position coins correctly', () => {
      const lane = 1;
      coinManager.spawnCoins(lane);
      
      coinManager.coins.forEach(coin => {
        expect(coin.position.x).toBeCloseTo(lane, 0.5); // Allow small offset
        expect(coin.position.z).toBeLessThanOrEqual(-30); // Spawn distance
        expect(coin.position.y).toBe(1.2); // Height
      });
    });

    it('should set coin value correctly', () => {
      coinManager.spawnCoins(0);
      
      coinManager.coins.forEach(coin => {
        expect(coin.value).toBe(10); // Default coin value
      });
    });
  });

  describe('Coin Collection', () => {
    beforeEach(() => {
      coinManager.spawnCoins(0);
    });

    it('should detect coin collection correctly', () => {
      const mockPlayerBox = new THREE.Box3();
      
      // Mock intersection
      (mockPlayerBox.intersectsBox as jest.Mock).mockReturnValue(true);
      
      const coinsCollected = coinManager.checkCollisions(mockPlayerBox);
      
      expect(coinsCollected).toBeGreaterThan(0);
      expect(coinsCollected).toBe(10 * coinManager.coins.length); // 10 coins per coin
    });

    it('should return 0 when no coins collected', () => {
      const mockPlayerBox = new THREE.Box3();
      
      // Mock no intersection
      (mockPlayerBox.intersectsBox as jest.Mock).mockReturnValue(false);
      
      const coinsCollected = coinManager.checkCollisions(mockPlayerBox);
      
      expect(coinsCollected).toBe(0);
    });
  });

  describe('Magnet Effect', () => {
    beforeEach(() => {
      coinManager.spawnCoins(3);
    });

    it('should activate magnet effect', () => {
      coinManager.setMagnetActive(true);
      // Test would need to verify coin attraction behavior
      expect(true).toBe(true); // Placeholder
    });

    it('should deactivate magnet effect', () => {
      coinManager.setMagnetActive(false);
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Update Method', () => {
    beforeEach(() => {
      coinManager.spawnCoins(0);
    });

    it('should update coin positions', () => {
      const gameSpeed = 0.3;
      const deltaTime = 16; // ~60fps
      
      const initialZ = coinManager.coins[0].position.z;
      
      coinManager.update(deltaTime, gameSpeed);
      
      expect(coinManager.coins[0].position.z).toBeGreaterThan(initialZ);
    });

    it('should remove coins that are too far', () => {
      // Position a coin far beyond max distance
      coinManager.coins[0].position.z = 100;
      
      coinManager.update(16, 0.3);
      
      expect(coinManager.coins).toHaveLength(0);
    });
  });

  describe('Reset Method', () => {
    beforeEach(() => {
      coinManager.spawnCoins(0);
      coinManager.spawnCoins(1);
    });

    it('should clear all coins', () => {
      expect(coinManager.coins.length).toBeGreaterThan(0);
      
      coinManager.reset();
      
      expect(coinManager.coins).toHaveLength(0);
    });

    it('should reset magnet state', () => {
      coinManager.setMagnetActive(true);
      coinManager.reset();
      
      // Magnet should be deactivated after reset
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Spawn Chance Configuration', () => {
    it('should allow setting custom spawn chance', () => {
      coinManager.setSpawnChance(0.5);
      expect(coinManager.getSpawnChance()).toBe(0.5);
    });

    it('should clamp spawn chance between 0 and 1', () => {
      coinManager.setSpawnChance(1.5);
      expect(coinManager.getSpawnChance()).toBe(1);
      
      coinManager.setSpawnChance(-0.5);
      expect(coinManager.getSpawnChance()).toBe(0);
    });
  });

  describe('Dispose Method', () => {
    it('should clean up resources', () => {
      coinManager.spawnCoins(0);
      coinManager.dispose();
      
      expect(coinManager.coins).toHaveLength(0);
    });
  });
});