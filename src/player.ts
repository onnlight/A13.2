import * as THREE from 'three';

export type CubeSkin = 'neon' | 'fire' | 'ice' | 'rainbow';
export type PowerUpType = 'speed' | 'shield' | 'multiplier';

export interface PowerUp {
  type: PowerUpType;
  startTime: number;
  duration: number;
  value: number;
}

export class Player {
  public mesh!: THREE.Mesh;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public boundingBox: THREE.Box3;
  
  private skin: CubeSkin;
  private moveSpeed: number;
  private baseSpeed: number;
  private roadWidth: number;
  private targetX: number;
  private isMoving: boolean;
  private powerUps: PowerUp[];
  private isShielded: boolean;
  private shieldMesh?: THREE.Mesh;
  
  // Animation properties
  private rotationSpeed: number;
  private bounceSpeed: number;
  private bounceTime: number;
  private glowIntensity: number;
  private glowDirection: number;

  constructor(skin: CubeSkin = 'neon') {
    this.skin = skin;
    this.baseSpeed = 0.15;
    this.moveSpeed = this.baseSpeed;
    this.roadWidth = 8; // Slightly less than road width for margin
    this.targetX = 0;
    this.isMoving = false;
    this.powerUps = [];
    this.isShielded = false;
    
    // Animation properties
    this.rotationSpeed = 0.02;
    this.bounceSpeed = 0.05;
    this.bounceTime = 0;
    this.glowIntensity = 0.5;
    this.glowDirection = 1;
    
    this.position = new THREE.Vector3(0, 1, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    
    this.createMesh();
    this.boundingBox = new THREE.Box3();
    this.updateBoundingBox();
  }

  private createMesh(): void {
    // Create main cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = this.createMaterialForSkin(this.skin);
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Add glow effect
    const glowGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.getGlowColor(),
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.name = 'glow';
    this.mesh.add(glowMesh);
  }

  private createMaterialForSkin(skin: CubeSkin): THREE.MeshPhongMaterial {
    const skinConfigs = {
      neon: {
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3,
        shininess: 100
      },
      fire: {
        color: 0xff4500,
        emissive: 0xff0000,
        emissiveIntensity: 0.3,
        shininess: 80
      },
      ice: {
        color: 0x87ceeb,
        emissive: 0x4169e1,
        emissiveIntensity: 0.2,
        shininess: 150
      },
      rainbow: {
        color: 0xff00ff,
        emissive: 0x00ff00,
        emissiveIntensity: 0.4,
        shininess: 120
      }
    };

    const config = skinConfigs[skin];
    return new THREE.MeshPhongMaterial({
      color: config.color,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      shininess: config.shininess,
      specular: 0xffffff
    });
  }

  private getGlowColor(): number {
    const colors = {
      neon: 0x00ffff,
      fire: 0xff4500,
      ice: 0x87ceeb,
      rainbow: 0xff00ff
    };
    return colors[this.skin];
  }

  public moveLeft(): void {
    const newX = Math.max(this.position.x - 2, -this.roadWidth / 2);
    if (newX !== this.position.x) {
      this.targetX = newX;
      this.isMoving = true;
    }
  }

  public moveRight(): void {
    const newX = Math.min(this.position.x + 2, this.roadWidth / 2);
    if (newX !== this.position.x) {
      this.targetX = newX;
      this.isMoving = true;
    }
  }

  public update(_deltaTime: number): void {
    // Smooth horizontal movement
    if (this.isMoving) {
      const diff = this.targetX - this.position.x;
      if (Math.abs(diff) > 0.01) {
        this.position.x += diff * 0.2;
      } else {
        this.position.x = this.targetX;
        this.isMoving = false;
      }
    }

    // Update mesh position
    this.mesh.position.copy(this.position);
    
    // Animate rotation
    this.mesh.rotation.x += this.rotationSpeed;
    this.mesh.rotation.y += this.rotationSpeed * 0.7;
    
    // Animate bounce
    this.bounceTime += this.bounceSpeed;
    this.mesh.position.y = this.position.y + Math.sin(this.bounceTime) * 0.1;
    
    // Animate glow
    this.animateGlow();
    
    // Update power-ups
    this.updatePowerUps();
    
    // Update bounding box
    this.updateBoundingBox();
    
    // Update shield
    this.updateShield();
  }

  private animateGlow(): void {
    this.glowIntensity += this.glowDirection * 0.02;
    if (this.glowIntensity > 1) {
      this.glowIntensity = 1;
      this.glowDirection = -1;
    } else if (this.glowIntensity < 0.3) {
      this.glowIntensity = 0.3;
      this.glowDirection = 1;
    }
    
    const glowMesh = this.mesh.getObjectByName('glow');
    if (glowMesh) {
      ((glowMesh as any).material as THREE.MeshBasicMaterial).opacity = this.glowIntensity * 0.3;
    }
  }

  private updatePowerUps(): void {
    const currentTime = Date.now();
    
    // Remove expired power-ups
    this.powerUps = this.powerUps.filter(powerUp => {
      const elapsed = currentTime - powerUp.startTime;
      return elapsed < powerUp.duration;
    });
    
    // Apply active power-up effects
    this.powerUps.forEach(powerUp => {
      // const elapsed = currentTime - powerUp.startTime;
      
      switch (powerUp.type) {
        case 'speed':
          this.moveSpeed = this.baseSpeed * powerUp.value;
          break;
        case 'shield':
          this.isShielded = true;
          this.showShield();
          console.log('Shield activated - Player is now invincible');
          break;
        case 'multiplier':
          // Score multiplier is handled in main game loop
          break;
      }
    });
    
    // Reset effects if no active power-ups
    if (this.powerUps.length === 0) {
      this.moveSpeed = this.baseSpeed;
      this.isShielded = false;
      this.hideShield();
      console.log('Shield deactivated - Player is vulnerable');
    }
  }

  private showShield(): void {
    if (!this.shieldMesh) {
      const shieldGeometry = new THREE.SphereGeometry(1.5, 16, 16);
      const shieldMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });
      
      this.shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
      this.shieldMesh.name = 'shield';
      this.mesh.add(this.shieldMesh);
    }
  }

  private hideShield(): void {
    if (this.shieldMesh) {
      this.mesh.remove(this.shieldMesh);
      this.shieldMesh = undefined;
    }
  }

  private updateShield(): void {
    if (this.shieldMesh && this.isShielded) {
      this.shieldMesh.rotation.y += 0.05;
      this.shieldMesh.rotation.z += 0.03;
    }
  }

  public addPowerUp(type: PowerUpType, duration: number = 5000, value: number = 2): void {
    this.powerUps.push({
      type,
      startTime: Date.now(),
      duration,
      value
    });
  }

  public hasActivePowerUp(type: PowerUpType): boolean {
    return this.powerUps.some(powerUp => powerUp.type === type);
  }

  public getScoreMultiplier(): number {
    const multiplierPowerUp = this.powerUps.find(powerUp => powerUp.type === 'multiplier');
    return multiplierPowerUp ? multiplierPowerUp.value : 1;
  }

  public getRemainingPowerUpTime(type: PowerUpType): number {
    const powerUp = this.powerUps.find(p => p.type === type);
    if (!powerUp) return 0;
    
    const elapsed = Date.now() - powerUp.startTime;
    return Math.max(0, powerUp.duration - elapsed);
  }

  private updateBoundingBox(): void {
    this.boundingBox.setFromObject(this.mesh);
  }

  public checkCollision(otherBox: THREE.Box3): boolean {
    if (this.isShielded && this.hasActivePowerUp('shield')) {
      return false; // Invincible when shielded
    }
    return this.boundingBox.intersectsBox(otherBox);
  }

  public changeSkin(newSkin: CubeSkin): void {
    this.skin = newSkin;
    const newMaterial = this.createMaterialForSkin(newSkin);
    this.mesh.material = newMaterial;
    
    // Update glow color
    const glowMesh = this.mesh.getObjectByName('glow');
    if (glowMesh) {
      (glowMesh.material as THREE.MeshBasicMaterial).color = new THREE.Color(this.getGlowColor());
    }
  }

  public reset(): void {
    this.position.set(0, 1, 0);
    this.velocity.set(0, 0, 0);
    this.targetX = 0;
    this.isMoving = false;
    this.powerUps = [];
    this.isShielded = false;
    this.moveSpeed = this.baseSpeed;
    this.mesh.position.copy(this.position);
    this.hideShield();
    this.updateBoundingBox();
  }

  public getSpeed(): number {
    return this.moveSpeed;
  }

  public isInvincible(): boolean {
    const invincible = this.isShielded && this.hasActivePowerUp('shield');
    console.log(`isInvincible check: isShielded=${this.isShielded}, hasShieldPowerUp=${this.hasActivePowerUp('shield')}, result=${invincible}`);
    console.log(`Active power-ups:`, this.powerUps.map(p => ({type: p.type, startTime: p.startTime, duration: p.duration})));
    return invincible;
  }

  public debugPowerUpStatus(): void {
    console.log('=== Power-up Status ===');
    console.log(`Total power-ups: ${this.powerUps.length}`);
    console.log(`Is shielded: ${this.isShielded}`);
    console.log(`Has shield power-up: ${this.hasActivePowerUp('shield')}`);
    console.log(`Is invincible: ${this.isInvincible()}`);
    console.log('Active power-ups:', this.powerUps.map(p => ({type: p.type, startTime: p.startTime, duration: p.duration})));
    console.log('========================');
  }

  public dispose(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      (this.mesh.material as any[]).forEach((material: any) => material.dispose());
    } else {
      (this.mesh.material as any).dispose();
    }
  }
}