import * as THREE from 'three';

export interface Coin {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  boundingBox: THREE.Box3;
  value: number;
  collected: boolean;
}

export class CoinManager {
  public coins: Coin[] = [];
  private scene: THREE.Scene;
  private spawnDistance: number = -30;
  private maxDistance: number = 50;
  private spawnChance: number = 0.3; // 30% chance to spawn coins per obstacle
  private maxCoinsPerSpawn: number = 3;
  private coinValue: number = 10;
  private magnetRange: number = 8;
  private isMagnetActive: boolean = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public update(deltaTime: number, gameSpeed: number, playerPosition?: THREE.Vector3): void {
    // Update coin positions
    this.updateCoins(gameSpeed, playerPosition);
  }

  public spawnCoins(lane: number): void {
    // Random number of coins to spawn (1-3)
    const numCoins = Math.floor(Math.random() * this.maxCoinsPerSpawn) + 1;
    
    for (let i = 0; i < numCoins; i++) {
      const coin = this.createCoin();
      
      // Position coins in the lane with slight offset for variety
      const xOffset = (Math.random() - 0.5) * 0.8; // Small random offset within lane
      coin.position.set(lane + xOffset, 1.2, this.spawnDistance - (i * 2)); // Stagger coins
      
      coin.velocity.set(0, 0, 0);
      
      // Set initial bounding box
      coin.boundingBox = new THREE.Box3().setFromObject(coin.mesh);
      
      // Initialize animation data
      (coin.mesh as any).userData = {
        rotationSpeed: new THREE.Vector3(0.01, 0.02, 0.005),
        floatOffset: Math.random() * 2 * Math.PI,
        pulseOffset: Math.random() * 2 * Math.PI
      };
      
      this.coins.push(coin);
      this.scene.add(coin.mesh);
    }
  }

  private createCoin(): Coin {
    // Create golden sphere for coin
    const geometry = new THREE.SphereGeometry(0.4, 12, 12);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.3,
      shininess: 100,
      specular: 0xffffff
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.5, 12, 12);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.set(1.2, 1.2, 1.2);
    mesh.add(glowMesh);

    return {
      mesh,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      boundingBox: new THREE.Box3(),
      value: this.coinValue,
      collected: false
    };
  }

  private updateCoins(gameSpeed: number, playerPosition?: THREE.Vector3): void {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      
      if (coin.collected) {
        this.removeCoin(i);
        continue;
      }

      // Move coin forward
      coin.position.z += gameSpeed;
      
      // Apply magnet effect if active and player position is provided
      if (this.isMagnetActive && playerPosition) {
        const distance = coin.position.distanceTo(playerPosition);
        if (distance < this.magnetRange) {
          // Attract coin to player
          const direction = new THREE.Vector3().subVectors(playerPosition, coin.position).normalize();
          const magnetStrength = (1 - distance / this.magnetRange) * 0.3;
          coin.position.add(direction.multiplyScalar(magnetStrength));
        }
      }

      coin.mesh.position.copy(coin.position);
      
      // Animate coin
      const userData = (coin.mesh as any).userData;
      if (userData) {
        coin.mesh.rotation.x += userData.rotationSpeed.x;
        coin.mesh.rotation.y += userData.rotationSpeed.y;
        coin.mesh.rotation.z += userData.rotationSpeed.z;
        
        // Float animation
        const floatTime = Date.now() * 0.001 + userData.floatOffset;
        coin.mesh.position.y = coin.position.y + Math.sin(floatTime) * 0.15;
        
        // Pulse glow effect
        const pulseTime = Date.now() * 0.002 + userData.pulseOffset;
        const glowMesh = coin.mesh.children[0] as THREE.Mesh;
        if (glowMesh && glowMesh.material) {
          (glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(pulseTime) * 0.1;
        }
      }
      
      coin.boundingBox.setFromObject(coin.mesh);
      
      // Remove coins that are too far behind
      if (coin.position.z > this.maxDistance) {
        this.removeCoin(i);
      }
    }
  }

  private removeCoin(index: number): void {
    const coin = this.coins[index];
    this.scene.remove(coin.mesh);
    coin.mesh.geometry.dispose();
    if (Array.isArray(coin.mesh.material)) {
      coin.mesh.material.forEach(m => (m as THREE.Material).dispose());
    } else {
      (coin.mesh.material as THREE.Material).dispose();
    }
    this.coins.splice(index, 1);
  }

  public checkCollisions(playerBox: THREE.Box3): number {
    let coinsCollected = 0;
    
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (!coin.collected && playerBox.intersectsBox(coin.boundingBox)) {
        coinsCollected += coin.value;
        coin.collected = true;
      }
    }
    
    return coinsCollected;
  }

  public setMagnetActive(active: boolean): void {
    this.isMagnetActive = active;
  }

  public reset(): void {
    this.coins.forEach(coin => {
      this.scene.remove(coin.mesh);
      coin.mesh.geometry.dispose();
      if (Array.isArray(coin.mesh.material)) {
        coin.mesh.material.forEach(m => (m as THREE.Material).dispose());
      } else {
        (coin.mesh.material as THREE.Material).dispose();
      }
    });
    this.coins = [];
    this.isMagnetActive = false;
  }

  public getSpawnChance(): number {
    return this.spawnChance;
  }

  public setSpawnChance(chance: number): void {
    this.spawnChance = Math.max(0, Math.min(1, chance));
  }

  public dispose(): void {
    this.reset();
  }
}