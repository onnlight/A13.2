import * as THREE from 'three';

export class GameScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public road: THREE.Group;
  
  private gridSize = 100;
  private roadWidth = 10;
  private roadLength = 500;
  private roadSegments: THREE.Mesh[] = [];
  private currentTheme = 0;
  
  private themes = [
    { primaryColor: 0x00ffff, secondaryColor: 0xff00ff, fogColor: 0x000033 },
    { primaryColor: 0xff0080, secondaryColor: 0x80ff00, fogColor: 0x330011 },
    { primaryColor: 0xffff00, secondaryColor: 0x00ffff, fogColor: 0x111133 },
    { primaryColor: 0xff8000, secondaryColor: 0x00ff80, fogColor: 0x331100 },
  ];

  constructor(canvas: HTMLCanvasElement) {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, -10);
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: false 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000);
    
    // Initialize road group
    this.road = new THREE.Group();
    this.scene.add(this.road);
    
    this.setupLighting();
    this.createRoad();
    this.createEnvironment();
    this.setupEventListeners();
  }

  private setupLighting(): void {
    // Ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Neon lights for road
    const neonLight1 = new THREE.PointLight(0x00ffff, 2, 50);
    neonLight1.position.set(-this.roadWidth/2, 2, -10);
    this.scene.add(neonLight1);
    
    const neonLight2 = new THREE.PointLight(0xff00ff, 2, 50);
    neonLight2.position.set(this.roadWidth/2, 2, -10);
    this.scene.add(neonLight2);
    
    // Fog for depth perception
    this.applyTheme(0);
  }

  private applyTheme(themeIndex: number): void {
    const theme = this.themes[themeIndex % this.themes.length];
    
    // Update fog
    this.scene.fog = new THREE.Fog(theme.fogColor, 20, 100);
    
    // Update existing road materials
    this.roadSegments.forEach(segment => {
      if (segment.material) {
        const material = segment.material as THREE.MeshPhongMaterial;
        material.emissive = new THREE.Color(theme.primaryColor);
        material.emissiveIntensity = 0.2;
      }
    });
  }

  private createRoad(): void {
    const theme = this.themes[0];
    
    // Create road segments
    for (let z = 0; z > -this.roadLength; z -= 2) {
      // Main road surface
      const roadGeometry = new THREE.PlaneGeometry(this.roadWidth, 2);
      const roadMaterial = new THREE.MeshPhongMaterial({
        color: 0x222222,
        emissive: new THREE.Color(theme.primaryColor),
        emissiveIntensity: 0.1,
        shininess: 100
      });
      
      const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
      roadSegment.rotation.x = -Math.PI / 2;
      roadSegment.position.set(0, 0, z);
      roadSegment.receiveShadow = true;
      this.road.add(roadSegment);
      this.roadSegments.push(roadSegment);
      
      // Left neon line
      const leftLineGeometry = new THREE.PlaneGeometry(0.1, 2);
      const leftLineMaterial = new THREE.MeshBasicMaterial({
        color: theme.primaryColor,
        emissive: theme.primaryColor,
        emissiveIntensity: 1
      });
      
      const leftLine = new THREE.Mesh(leftLineGeometry, leftLineMaterial);
      leftLine.rotation.x = -Math.PI / 2;
      leftLine.position.set(-this.roadWidth/2 + 0.05, 0.01, z);
      this.road.add(leftLine);
      
      // Right neon line
      const rightLine = new THREE.Mesh(leftLineGeometry, leftLineMaterial);
      rightLine.rotation.x = -Math.PI / 2;
      rightLine.position.set(this.roadWidth/2 - 0.05, 0.01, z);
      this.road.add(rightLine);
      
      // Center dashed line
      if (Math.floor(Math.abs(z) / 4) % 2 === 0) {
        const centerLineGeometry = new THREE.PlaneGeometry(0.05, 1.5);
        const centerLineMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 1
        });
        
        const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.set(0, 0.01, z + 0.25);
        this.road.add(centerLine);
      }
    }
  }

  private createEnvironment(): void {
    // Create grid floor beyond road
    const gridGeometry = new THREE.PlaneGeometry(this.gridSize, this.roadLength);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
      side: THREE.DoubleSide
    });
    
    const gridFloor = new THREE.Mesh(gridGeometry, gridMaterial);
    gridFloor.rotation.x = -Math.PI / 2;
    gridFloor.position.set(0, -1, -this.roadLength/2);
    this.scene.add(gridFloor);
    
    // Create side barriers
    this.createSideBarriers();
    
    // Create particle system for ambiance
    this.createParticleSystem();
  }

  private createSideBarriers(): void {
    const barrierHeight = 3;
    const barrierSpacing = 5;
    
    for (let z = 0; z > -this.roadLength; z -= barrierSpacing) {
      // Left barrier
      const leftBarrierGeometry = new THREE.BoxGeometry(0.5, barrierHeight, 1);
      const leftBarrierMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8
      });
      
      const leftBarrier = new THREE.Mesh(leftBarrierGeometry, leftBarrierMaterial);
      leftBarrier.position.set(-this.roadWidth/2 - 1, barrierHeight/2, z);
      leftBarrier.castShadow = true;
      this.scene.add(leftBarrier);
      
      // Right barrier
      const rightBarrier = new THREE.Mesh(leftBarrierGeometry, leftBarrierMaterial);
      rightBarrier.position.set(this.roadWidth/2 + 1, barrierHeight/2, z);
      rightBarrier.castShadow = true;
      this.scene.add(rightBarrier);
    }
  }

  private createParticleSystem(): void {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMesh.position.z = -50;
    this.scene.add(particlesMesh);
  }

  public updateRoad(speed: number): void {
    // Move road segments
    this.roadSegments.forEach((segment, index) => {
      segment.position.z += speed * 0.1;
      
      // Reset segment when it goes too far
      if (segment.position.z > 2) {
        segment.position.z = -this.roadLength + 2;
      }
    });
    
    // Rotate road group for dynamic effect
    this.road.rotation.y = Math.sin(Date.now() * 0.0001) * 0.02;
  }

  public changeTheme(themeIndex: number): void {
    this.currentTheme = themeIndex;
    this.applyTheme(themeIndex);
  }

  public updateCameraToPlayer(playerPosition: THREE.Vector3): void {
    // Smooth camera follow
    const targetPosition = new THREE.Vector3(
      playerPosition.x,
      playerPosition.y + 5,
      playerPosition.z + 10
    );
    
    this.camera.position.lerp(targetPosition, 0.1);
    this.camera.lookAt(playerPosition);
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}