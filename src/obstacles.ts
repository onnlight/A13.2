import * as THREE from 'three';
import { CoinManager } from './coins';

export type ObstacleType = 'cube' | 'cylinder' | 'pyramid';
export type PowerUpTypeStr = 'speed' | 'shield' | 'multiplier' | 'magnet' | 'slowmotion';

export interface GameObject {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  boundingBox: THREE.Box3;
  type: 'obstacle' | 'powerup';
  subtype: ObstacleType | PowerUpTypeStr;
}

export class ObstacleManager {
  public obstacles: GameObject[] = [];
  public powerUps: GameObject[] = [];
  private scene: THREE.Scene;
  private spawnDistance: number = -30;
  private maxDistance: number = 50;
  private baseSpawnRate: number = 1000; // milliseconds
  private currentSpawnRate: number = this.baseSpawnRate;
  private spawnTimer: number = 0;
  private difficulty: number = 1;
  private powerUpSpawnChance: number = 0.1; // 10% chance for power-up
  private obstaclesPassed: number = 0;
  private powerUpsCollected: number = 0;
  private coinManager: CoinManager;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.coinManager = new CoinManager(scene);
  }

  public update(deltaTime: number, gameSpeed: number, playerPosition?: THREE.Vector3): void {
    this.spawnTimer += deltaTime;

    // Increase difficulty over time
    this.updateDifficulty();

    // Spawn new obstacles/power-ups
    if (this.spawnTimer > this.currentSpawnRate) {
      this.spawnObject();
      this.spawnTimer = 0;
    }

    // Update obstacle positions
    this.updateObstacles(gameSpeed);

    // Update power-up positions
    this.updatePowerUps(gameSpeed);

    // Update coin positions
    this.coinManager.update(deltaTime, gameSpeed, playerPosition);
  }

  // difficulty adjustment moved to public updateDifficulty below

  private spawnObject(): void {
    // Decide whether to spawn obstacle or power-up
    const spawnPowerUp = Math.random() < this.powerUpSpawnChance;

    if (spawnPowerUp) {
      this.spawnPowerUp();
    } else {
      this.spawnObstacle();
    }

    // Chance to spawn coins with obstacles
    if (Math.random() < this.coinManager.getSpawnChance()) {
      const lanes = [-3, -1, 1, 3];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      this.coinManager.spawnCoins(lane);
    }
  }

  private spawnObstacle(): void {
    const types: ObstacleType[] = ['cube', 'cylinder', 'pyramid'];
    const type = types[Math.floor(Math.random() * types.length)];

    const obstacle = this.createObstacle(type);

    // Random lane position
    const lanes = [-3, -1, 1, 3];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    obstacle.position.set(lane, 0.5, this.spawnDistance);
    obstacle.velocity.set(0, 0, 0);

    // Set initial bounding box
    obstacle.boundingBox = new THREE.Box3().setFromObject(obstacle.mesh);

    this.obstacles.push(obstacle);
    this.scene.add(obstacle.mesh);
  }

  private createObstacle(type: ObstacleType): GameObject {
    let geometry: THREE.BufferGeometry;
    let material: THREE.MeshPhongMaterial;

    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        material = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.2, shininess: 100 });
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.7, 0.7, 2, 8);
        material = new THREE.MeshPhongMaterial({ color: 0xff8000, emissive: 0xff4000, emissiveIntensity: 0.2, shininess: 80 });
        break;
      case 'pyramid':
        geometry = new THREE.ConeGeometry(1, 2, 4);
        material = new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0xff0080, emissiveIntensity: 0.2, shininess: 90 });
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add glow effect
    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.2, side: THREE.BackSide });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.set(1.2, 1.2, 1.2);
    mesh.add(glowMesh);

    return {
      mesh,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      boundingBox: new THREE.Box3(),
      type: 'obstacle',
      subtype: type
    };
  }

  private spawnPowerUp(): void {
    const types: PowerUpTypeStr[] = ['speed', 'shield', 'multiplier', 'magnet', 'slowmotion'];
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUp = this.createPowerUp(type);

    // Random lane position
    const lanes = [-3, -1, 1, 3];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    powerUp.position.set(lane, 1, this.spawnDistance);
    powerUp.velocity.set(0, 0, 0);

    // Set initial bounding box
    powerUp.boundingBox = new THREE.Box3().setFromObject(powerUp.mesh);

    // Initialize simple animation data to avoid undefined access
    (powerUp.mesh as any).userData = {
      rotationSpeed: new THREE.Vector3(0.02, 0.03, 0.01),
      floatOffset: Math.random() * 2 * Math.PI
    };
    this.powerUps.push(powerUp);
    this.scene.add(powerUp.mesh);
  }

  private createPowerUp(type: PowerUpTypeStr): GameObject {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    let glowColor: number;

    switch (type) {
      case 'speed':
        geometry = new THREE.SphereGeometry(0.6, 16, 16);
        material = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0xffff00 });
        glowColor = 0xffff00;
        break;
      case 'shield':
        geometry = new THREE.IcosahedronGeometry(0.6, 1);
        material = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff });
        glowColor = 0x00ffff;
        break;
      case 'multiplier':
        geometry = new THREE.TorusGeometry(0.4, 0.2, 8, 16);
        material = new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0xff00ff });
        glowColor = 0xff00ff;
        break;
      case 'magnet':
        geometry = new THREE.OctahedronGeometry(0.6, 0);
        material = new THREE.MeshPhongMaterial({ color: 0xff0080, emissive: 0xff0080 });
        glowColor = 0xff0080;
        break;
      case 'slowmotion':
        geometry = new THREE.TetrahedronGeometry(0.6, 0);
        material = new THREE.MeshPhongMaterial({ color: 0x0080ff, emissive: 0x0080ff });
        glowColor = 0x0080ff;
        break;
      default:
        geometry = new THREE.SphereGeometry(0.6, 16, 16);
        material = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0xffff00 });
        glowColor = 0xffff00;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Glow helper
    const glowGeometry = geometry.clone();
    const glowMaterial = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.25, side: THREE.BackSide });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.set(1.2, 1.2, 1.2);
    mesh.add(glowMesh);

    return {
      mesh,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      boundingBox: new THREE.Box3(),
      type: 'powerup',
      subtype: type
    };
  }

  private updateObstacles(gameSpeed: number): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position.z += gameSpeed;
      obstacle.mesh.position.copy(obstacle.position);
      obstacle.mesh.rotation.y += 0.02;
      obstacle.mesh.rotation.x += 0.01;
      obstacle.boundingBox.setFromObject(obstacle.mesh);
      if (obstacle.position.z > this.maxDistance) {
        this.removeObstacle(i);
      }
    }
  }

  private updatePowerUps(gameSpeed: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.position.z += gameSpeed;
      powerUp.mesh.position.copy(powerUp.position);
      const userData = (powerUp.mesh as any).userData;
      if (userData) {
        powerUp.mesh.rotation.x += userData.rotationSpeed.x;
        powerUp.mesh.rotation.y += userData.rotationSpeed.y;
        powerUp.mesh.rotation.z += userData.rotationSpeed.z;
        const floatTime = Date.now() * 0.001 + userData.floatOffset;
        powerUp.mesh.position.y = powerUp.position.y + Math.sin(floatTime) * 0.2;
      }
      powerUp.boundingBox.setFromObject(powerUp.mesh);
      if (powerUp.position.z > this.maxDistance) {
        this.removePowerUp(i);
      }
    }
  }

  private removeObstacle(index: number): void {
    const obstacle = this.obstacles[index];
    this.scene.remove(obstacle.mesh);
    obstacle.mesh.geometry.dispose();
    if (Array.isArray(obstacle.mesh.material)) {
      obstacle.mesh.material.forEach(m => (m as THREE.Material).dispose());
    } else {
      (obstacle.mesh.material as THREE.Material).dispose();
    }
    this.obstacles.splice(index, 1);
  }

  private removePowerUp(index: number): void {
    const powerUp = this.powerUps[index];
    this.scene.remove(powerUp.mesh);
    powerUp.mesh.geometry.dispose();
    if (Array.isArray(powerUp.mesh.material)) {
      powerUp.mesh.material.forEach(m => (m as THREE.Material).dispose());
    } else {
      (powerUp.mesh.material as THREE.Material).dispose();
    }
    this.powerUps.splice(index, 1);
  }

  public checkCollisions(playerBox: THREE.Box3): {
    obstacleCollision: boolean;
    powerUpCollected: PowerUpTypeStr | null;
    coinsCollected: number;
  } {
    let obstacleCollision = false as boolean;
    let powerUpCollected: PowerUpTypeStr | null = null;

    // Check obstacle collisions
    for (const obstacle of this.obstacles) {
      if (playerBox.intersectsBox(obstacle.boundingBox)) {
        obstacleCollision = true;
        this.removeObstacle(this.obstacles.indexOf(obstacle));
        break;
      }
    }

    // Check power-up collections
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (playerBox.intersectsBox(powerUp.boundingBox)) {
        powerUpCollected = powerUp.subtype as PowerUpTypeStr;
        this.removePowerUp(i);
        this.powerUpsCollected++;
        break;
      }
    }

    // Check coin collections
    const coinsCollected = this.coinManager.checkCollisions(playerBox);

    return { obstacleCollision, powerUpCollected, coinsCollected } as any;
  }

  public reset(): void {
    this.obstacles.forEach(obstacle => {
      this.scene.remove(obstacle.mesh);
      obstacle.mesh.geometry.dispose();
      if (Array.isArray(obstacle.mesh.material)) {
        obstacle.mesh.material.forEach(m => (m as THREE.Material).dispose());
      } else {
        (obstacle.mesh.material as THREE.Material).dispose();
      }
    });
    this.powerUps.forEach(powerUp => {
      this.scene.remove(powerUp.mesh);
      powerUp.mesh.geometry.dispose();
      if (Array.isArray(powerUp.mesh.material)) {
        powerUp.mesh.material.forEach(m => (m as THREE.Material).dispose());
      } else {
        (powerUp.mesh.material as THREE.Material).dispose();
      }
    });
    this.coinManager.reset();
    this.obstacles = [];
    this.powerUps = [];
    this.spawnTimer = 0;
    this.difficulty = 1;
    this.currentSpawnRate = this.baseSpawnRate;
    this.obstaclesPassed = 0;
    this.powerUpsCollected = 0;
  }

  public getObstaclesPassed(): number { return this.obstaclesPassed; }
  public getPowerUpsCollected(): number { return this.powerUpsCollected; }

  public setDifficulty(level: 'easy' | 'medium' | 'hard'): void {
    switch (level) {
      case 'easy': this.baseSpawnRate = 1500; this.powerUpSpawnChance = 0.15; break;
      case 'medium': this.baseSpawnRate = 1000; this.powerUpSpawnChance = 0.10; break;
      case 'hard': this.baseSpawnRate = 700; this.powerUpSpawnChance = 0.05; break;
    }
    this.currentSpawnRate = this.baseSpawnRate;
  }

  public getDifficulty(): 'easy' | 'medium' | 'hard' {
    if (this.baseSpawnRate >= 1400) return 'easy';
    if (this.baseSpawnRate >= 900) return 'medium';
    return 'hard';
  }

  public updateDifficulty(): void {
    // Gradually increase difficulty over time
    this.difficulty += 0.001;
    this.currentSpawnRate = Math.max(300, this.baseSpawnRate / this.difficulty);
    this.powerUpSpawnChance = Math.min(0.3, 0.1 + (this.difficulty * 0.01));
  }

  public setMagnetActive(active: boolean): void {
    this.coinManager.setMagnetActive(active);
  }

  public dispose(): void { this.reset(); }
}
