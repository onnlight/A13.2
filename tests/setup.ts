// Enhanced Mock Three.js for testing with realistic object interactions

// Mock localStorage for complex objects
export const mockLocalStorage = {
  store: {},
  getItem: jest.fn().mockImplementation((key) => {
    return mockLocalStorage.store[key] || null;
  }),
  setItem: jest.fn().mockImplementation((key, value) => {
    mockLocalStorage.store[key] = String(value);
  }),
  removeItem: jest.fn().mockImplementation((key) => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn().mockImplementation(() => {
    mockLocalStorage.store = {};
  }),
  // Add support for complex object storage
  getObject: jest.fn().mockImplementation((key) => {
    try {
      const value = mockLocalStorage.store[key];
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }),
  setObject: jest.fn().mockImplementation((key, value) => {
    mockLocalStorage.store[key] = JSON.stringify(value);
  })
};

// Enhanced THREE.js mock with realistic behavior
global.THREE = {
  Scene: jest.fn().mockImplementation(() => {
    const scene = {
      add: jest.fn().mockImplementation((object) => {
        object.parent = scene;
        scene.children.push(object);
      }),
      remove: jest.fn().mockImplementation((object) => {
        const index = scene.children.indexOf(object);
        if (index > -1) {
          scene.children.splice(index, 1);
          object.parent = null;
        }
      }),
      children: [],
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      getObjectByName: jest.fn().mockReturnValue(null),
      traverse: jest.fn(),
      updateMatrixWorld: jest.fn(),
      userData: {},
      fog: null,
      background: null,
      environment: null,
    };
    
    scene.traverse = jest.fn().mockImplementation((callback) => {
      callback(scene);
      scene.children.forEach(callback);
    });
    
    scene.getObjectByName = jest.fn().mockImplementation((name) => {
      const findInChildren = (children) => {
        for (const child of children) {
          if (child.name === name) return child;
          if (child.children) {
            const found = findInChildren(child.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findInChildren(scene.children);
    });
    
    return scene;
  }),
  
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { x: 0, y: 5, z: 10 },
    rotation: { x: 0, y: 0, z: 0 },
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    updateProjectionMatrix: jest.fn(),
    lookAt: jest.fn(),
    isCamera: true,
  })),
  
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas'),
    shadowMap: { enabled: false },
    setPixelRatio: jest.fn(),
    dispose: jest.fn(),
    setClearColor: jest.fn(),
    getContext: jest.fn().mockReturnValue(mockGLContext),
    info: { render: { frame: 0 } },
    forceContextLoss: jest.fn(),
    context: mockGLContext,
    capabilities: { isWebGL2: true, maxVertexUniforms: 1024 },
    state: { set: jest.fn() },
    xr: { present: false, isPresenting: false },
    shadowMapEnabled: false,
    gammaFactor: 2.0,
    toneMapping: 1,
    toneMappingExposure: 1.0
  })),
  
  BoxGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    parameters: { width: 1, height: 1, depth: 1 },
    name: 'BoxGeometry',
    boundingBox: { 
      setFromObject: jest.fn(),
      intersectsBox: jest.fn().mockReturnValue(false),
    },
    userData: {},
  })),
  
  SphereGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    parameters: { radius: 0.5 },
    name: 'SphereGeometry',
    boundingBox: { 
      setFromObject: jest.fn(),
      intersectsBox: jest.fn().mockReturnValue(false),
    },
    userData: {},
  })),
  
  CylinderGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    parameters: { radiusTop: 0.5, radiusBottom: 0.5, height: 1 },
    name: 'CylinderGeometry',
    boundingBox: { 
      setFromObject: jest.fn(),
      intersectsBox: jest.fn().mockReturnValue(false),
    },
    userData: {},
  })),
  
  ConeGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    parameters: { radius: 0.5, height: 1 },
    name: 'ConeGeometry',
    userData: {},
  })),
  
  OctahedronGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    parameters: { radius: 1 },
    name: 'OctahedronGeometry',
    userData: {},
  })),
  
  TetrahedronGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    parameters: { radius: 1 },
    name: 'TetrahedronGeometry',
    userData: {},
  })),
  
  IcosahedronGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    parameters: { radius: 1 },
    name: 'IcosahedronGeometry',
    userData: {},
  })),
  
  PlaneGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    parameters: { width: 1, height: 1 },
    name: 'PlaneGeometry',
    userData: {},
  })),
  
  BufferGeometry: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
    attributes: {},
    userData: {},
  })),
  
  MeshBasicMaterial: jest.fn().mockImplementation(() => {
    const material = {
      dispose: jest.fn(),
      color: { 
        set: jest.fn(), 
        clone: jest.fn().mockReturnValue({ r: 1, g: 1, b: 1 }),
        r: 1, 
        g: 1, 
        b: 1,
        getHex: jest.fn().mockReturnValue(0xffffff),
      },
      transparent: false,
      opacity: 1,
      name: 'MeshBasicMaterial',
      needsUpdate: false,
      userData: {},
    };
    
    material.color.clone = jest.fn().mockReturnValue({
      r: 1, g: 1, b: 1,
      set: jest.fn(),
      clone: jest.fn().mockReturnValue({ r: 1, g: 1, b: 1 }),
    });
    
    return material;
  }),
  
  MeshPhongMaterial: jest.fn().mockImplementation(() => {
    const material = {
      dispose: jest.fn(),
      color: { 
        set: jest.fn(), 
        clone: jest.fn().mockReturnValue({ r: 1, g: 1, b: 1 }),
        r: 1, 
        g: 1, 
        b: 1,
        getHex: jest.fn().mockReturnValue(0xffffff),
      },
      emissive: { 
        set: jest.fn(), 
        clone: jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
        r: 0, 
        g: 0, 
        b: 0,
        getHex: jest.fn().mockReturnValue(0x000000),
      },
      shininess: 30,
      specular: { 
        set: jest.fn(), 
        clone: jest.fn().mockReturnValue({ r: 1, g: 1, b: 1 }),
        r: 1, 
        g: 1, 
        b: 1,
      },
      transparent: false,
      opacity: 1,
      name: 'MeshPhongMaterial',
      needsUpdate: false,
      userData: {},
    };
    
    material.color.clone = jest.fn().mockReturnValue({
      r: 1, g: 1, b: 1,
      set: jest.fn(),
      clone: jest.fn().mockReturnValue({ r: 1, g: 1, b: 1 }),
    });
    
    material.emissive.clone = jest.fn().mockReturnValue({
      r: 0, g: 0, b: 0,
      set: jest.fn(),
      clone: jest.fn().mockReturnValue({ r: 0, g: 0, b: 0 }),
    });
    
    return material;
  }),
  
  Mesh: jest.fn().mockImplementation(() => {
    const mesh = {
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      castShadow: false,
      receiveShadow: false,
      add: jest.fn().mockImplementation((object) => {
        object.parent = mesh;
        mesh.children.push(object);
      }),
      remove: jest.fn().mockImplementation((object) => {
        const index = mesh.children.indexOf(object);
        if (index > -1) {
          mesh.children.splice(index, 1);
          object.parent = null;
        }
      }),
      children: [],
      geometry: { dispose: jest.fn() },
      material: { dispose: jest.fn() },
      userData: {},
      getObjectByName: jest.fn().mockReturnValue(null),
      parent: null,
      visible: true,
      frustumCulled: true,
      renderOrder: 0,
      matrixAutoUpdate: true,
      matrixWorldNeedsUpdate: false,
      type: 'Mesh',
      isMesh: true,
    };
    
    mesh.position.clone = jest.fn().mockImplementation(function(this) {
      return {
        x: this.x,
        y: this.y,
        z: this.z,
        clone: jest.fn().mockReturnValue({
          x: this.x,
          y: this.y,
          z: this.z,
        }),
      };
    });
    
    mesh.position.copy = jest.fn().mockImplementation(function(other) {
      this.x = other.x;
      this.y = other.y;
      this.z = other.z;
      return this;
    });
    
    mesh.rotation.clone = jest.fn().mockImplementation(function(this) {
      return {
        x: this.x,
        y: this.y,
        z: this.z,
        clone: jest.fn().mockReturnValue({
          x: this.x,
          y: this.y,
          z: this.z,
        }),
      };
    });
    
    mesh.scale.clone = jest.fn().mockImplementation(function(this) {
      return {
        x: this.x,
        y: this.y,
        z: this.z,
        clone: jest.fn().mockReturnValue({
          x: this.x,
          y: this.y,
          z: this.z,
        }),
      };
    });
    
    mesh.getObjectByName = jest.fn().mockImplementation((name) => {
      const findInChildren = (children) => {
        for (const child of children) {
          if (child.name === name) return child;
          if (child.children) {
            const found = findInChildren(child.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findInChildren(mesh.children);
    });
    
    mesh.traverse = jest.fn().mockImplementation((callback) => {
      callback(mesh);
      mesh.children.forEach(callback);
    });
    
    return mesh;
  }),
  
  Group: jest.fn().mockImplementation(() => {
    const group = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      add: jest.fn().mockImplementation((object) => {
        object.parent = group;
        group.children.push(object);
      }),
      remove: jest.fn().mockImplementation((object) => {
        const index = group.children.indexOf(object);
        if (index > -1) {
          group.children.splice(index, 1);
          object.parent = null;
        }
      }),
      children: [],
      userData: {},
      getObjectByName: jest.fn().mockReturnValue(null),
      parent: null,
      visible: true,
      type: 'Group',
      isGroup: true,
    };
    
    group.position.clone = jest.fn().mockImplementation(function(this) {
      return {
        x: this.x,
        y: this.y,
        z: this.z,
        clone: jest.fn().mockReturnValue({
          x: this.x,
          y: this.y,
          z: this.z,
        }),
      };
    });
    
    group.getObjectByName = jest.fn().mockImplementation((name) => {
      const findInChildren = (children) => {
        for (const child of children) {
          if (child.name === name) return child;
          if (child.children) {
            const found = findInChildren(child.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findInChildren(group.children);
    });
    
    group.traverse = jest.fn().mockImplementation((callback) => {
      callback(group);
      group.children.forEach(callback);
    });
    
    return group;
  }),
  
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => {
    const vector = {
      x, y, z,
      clone: jest.fn().mockImplementation(function(this) {
        return {
          x: this.x,
          y: this.y,
          z: this.z,
          clone: jest.fn().mockReturnValue({ x: this.x, y: this.y, z: this.z }),
          copy: jest.fn().mockImplementation(function(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
          }),
          set: jest.fn().mockImplementation(function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
          }),
          add: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
          sub: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
          multiplyScalar: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
          normalize: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
          length: jest.fn().mockReturnValue(1),
          dot: jest.fn().mockReturnValue(0),
          cross: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
        };
      }),
      copy: jest.fn().mockImplementation(function(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
      }),
      set: jest.fn().mockImplementation(function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      }),
      add: jest.fn().mockImplementation(function(v) {
        return {
          x: this.x + v.x,
          y: this.y + v.y,
          z: this.z + v.z,
        };
      }),
      sub: jest.fn().mockImplementation(function(v) {
        return {
          x: this.x - v.x,
          y: this.y - v.y,
          z: this.z - v.z,
        };
      }),
      multiplyScalar: jest.fn().mockImplementation(function(scalar) {
        return {
          x: this.x * scalar,
          y: this.y * scalar,
          z: this.z * scalar,
        };
      }),
      normalize: jest.fn().mockImplementation(function(this) {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return {
          x: this.x / length,
          y: this.y / length,
          z: this.z / length,
        };
      }),
      length: jest.fn().mockImplementation(function(this) {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      }),
      dot: jest.fn().mockImplementation(function(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
      }),
      cross: jest.fn().mockImplementation(function(v) {
        return {
          x: this.y * v.z - this.z * v.y,
          y: this.z * v.x - this.x * v.z,
          z: this.x * v.y - this.y * v.x,
        };
      }),
      lerp: jest.fn().mockImplementation(function(v, alpha) {
        return {
          x: this.x + (v.x - this.x) * alpha,
          y: this.y + (v.y - this.y) * alpha,
          z: this.z + (v.z - this.z) * alpha,
        };
      }),
    };
    
    return vector;
  }),
  
  Color: jest.fn().mockImplementation((color) => {
    const colorObj = {
      r: 1, g: 1, b: 1,
      set: jest.fn().mockImplementation(function(color) {
        if (typeof color === 'string') {
          if (color.startsWith('#')) {
            const hex = color.substring(1);
            this.r = parseInt(hex.substring(0, 2), 16) / 255;
            this.g = parseInt(hex.substring(2, 4), 16) / 255;
            this.b = parseInt(hex.substring(4, 6), 16) / 255;
          }
        } else if (typeof color === 'number') {
          this.r = ((color >> 16) & 255) / 255;
          this.g = ((color >> 8) & 255) / 255;
          this.b = (color & 255) / 255;
        }
        return this;
      }),
      clone: jest.fn().mockImplementation(function(this) {
        return {
          r: this.r,
          g: this.g,
          b: this.b,
          set: this.set,
          clone: this.clone,
          copy: this.copy,
          getHex: this.getHex,
        };
      }),
      copy: jest.fn().mockImplementation(function(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        return this;
      }),
      getHex: jest.fn().mockImplementation(function(this) {
        return (Math.round(this.r * 255) << 16) + 
               (Math.round(this.g * 255) << 8) + 
               Math.round(this.b * 255);
      }),
    };
    
    if (color) {
      colorObj.set(color);
    }
    
    return colorObj;
  }),
  
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { x: 0, y: 10, z: 0 },
    target: { position: { x: 0, y: 0, z: 0 } },
    intensity: 1,
    castShadow: false,
    color: { 
      r: 1, g: 1, b: 1,
      set: jest.fn(),
      clone: jest.fn(),
    },
    shadow: { 
      mapSize: { width: 1024, height: 1024 },
      camera: { near: 0.5, far: 500, left: -10, right: 10, top: 10, bottom: -10 },
      map: null,
      bias: 0,
    },
    type: 'DirectionalLight',
    isLight: true,
  })),
  
  HemisphereLight: jest.fn().mockImplementation(() => ({
    intensity: 1,
    position: { x: 0, y: 10, z: 0 },
    color: { r: 1, g: 1, b: 1, set: jest.fn(), clone: jest.fn() },
    groundColor: { r: 1, g: 1, b: 1, set: jest.fn(), clone: jest.fn() },
    type: 'HemisphereLight',
    isLight: true,
  })),
  
  AmbientLight: jest.fn().mockImplementation(() => ({
    intensity: 1,
    color: { r: 1, g: 1, b: 1, set: jest.fn(), clone: jest.fn() },
    type: 'AmbientLight',
    isLight: true,
  })),
  
  PointLight: jest.fn().mockImplementation(() => ({
    intensity: 1,
    position: { x: 0, y: 0, z: 0 },
    color: { r: 1, g: 1, b: 1, set: jest.fn(), clone: jest.fn() },
    distance: 0,
    decay: 1,
    type: 'PointLight',
    isLight: true,
  })),
  
  Fog: jest.fn().mockImplementation((color, near, far) => ({
    color: { r: 1, g: 1, b: 1, set: jest.fn(), clone: jest.fn() },
    near: near || 1,
    far: far || 1000,
    name: 'Fog',
  })),
  
  Clock: jest.fn().mockImplementation(() => ({
    getDelta: jest.fn().mockReturnValue(0.016),
    getElapsedTime: jest.fn().mockReturnValue(1.0),
    start: jest.fn(),
    stop: jest.fn(),
    running: true,
    autoStart: true,
    startTime: 0,
    oldTime: 0,
  })),
  
  ReinhardToneMapping: 'ReinhardToneMapping',
  ACESFilmicToneMapping: 'ACESFilmicToneMapping',
  
  TextureLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockImplementation((url, onLoad, onProgress, onError) => {
      setTimeout(() => {
        if (onLoad) onLoad({ 
          image: new Image(),
          wrapS: 1001,
          wrapT: 1001,
          magFilter: 1006,
          minFilter: 1008,
          name: 'Texture',
        });
      }, 10);
    }),
  })),
  
  Audio: jest.fn().mockImplementation(() => ({
    context: { 
      createGain: jest.fn().mockReturnValue({
        gain: { value: 1, connect: jest.fn() },
        connect: jest.fn(),
        disconnect: jest.fn(),
      }),
      createBufferSource: jest.fn().mockReturnValue({
        buffer: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        loop: false,
      }),
      decodeAudioData: jest.fn().mockResolvedValue({ 
        duration: 1.0,
        sampleRate: 44100,
        length: 44100,
      }),
      state: 'running',
      resume: jest.fn(),
      suspend: jest.fn(),
      destination: { connect: jest.fn() },
    },
    gain: { 
      gain: { value: 1, connect: jest.fn() },
      connect: jest.fn(),
      disconnect: jest.fn(),
    },
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    setVolume: jest.fn().mockImplementation(function(volume) {
      this.gain.gain.value = volume;
    }),
    connect: jest.fn(),
    disconnect: jest.fn(),
    source: null,
    hasPlaybackControl: true,
    startTime: 0,
    isPlaying: false,
  })),
  
  AudioListener: jest.fn().mockImplementation(() => ({
    context: {
      createGain: jest.fn().mockReturnValue({
        gain: { value: 1, connect: jest.fn() },
        connect: jest.fn(),
        disconnect: jest.fn(),
      }),
      state: 'running',
      resume: jest.fn(),
      suspend: jest.fn(),
      destination: { connect: jest.fn() },
    },
    position: { x: 0, y: 0, z: 0 },
    updateMatrixWorld: jest.fn(),
    gain: { gain: { value: 1, connect: jest.fn() } },
    type: 'AudioListener',
  })),
  
  Raycaster: jest.fn().mockImplementation(() => {
    const raycaster = {
      origin: { x: 0, y: 0, z: 0 },
      direction: { x: 0, y: 0, z: 0 },
      near: 0,
      far: Infinity,
      set: jest.fn().mockImplementation(function(origin, direction) {
        this.origin = origin;
        this.direction = direction;
      }),
      setFromCamera: jest.fn().mockImplementation(function(coords, camera) {
        this.origin = camera.position;
      }),
      intersectObject: jest.fn().mockReturnValue([]),
      intersectObjects: jest.fn().mockReturnValue([]),
    };
    
    raycaster.intersectObject = jest.fn().mockImplementation((object, recursive = false) => {
      return [{
        object: object,
        distance: 1,
        point: { x: 0, y: 0, z: 0 },
        face: { a: 0, b: 1, c: 2, normal: { x: 0, y: 1, z: 0 } },
        faceIndex: 0,
        uv: { x: 0.5, y: 0.5 },
      }];
    });
    
    raycaster.intersectObjects = jest.fn().mockImplementation((objects, recursive = false) => {
      return objects.map((object, index) => ({
        object: object,
        distance: index + 1,
        point: { x: index, y: 0, z: 0 },
        face: { a: 0, b: 1, c: 2, normal: { x: 0, y: 1, z: 0 } },
        faceIndex: 0,
        uv: { x: 0.5, y: 0.5 },
      }));
    });
    
    return raycaster;
  }),
  
  Box3: jest.fn().mockImplementation(() => {
    const box3 = {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 1, y: 1, z: 1 },
      setFromObject: jest.fn().mockImplementation(function(object) {
        this.min = { x: -0.5, y: -0.5, z: -0.5 };
        this.max = { x: 0.5, y: 0.5, z: 0.5 };
      }),
      intersectsBox: jest.fn().mockReturnValue(false),
      getCenter: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      getSize: jest.fn().mockReturnValue({ x: 1, y: 1, z: 1 }),
      containsPoint: jest.fn().mockReturnValue(false),
      clone: jest.fn().mockReturnValue({
        min: { x: 0, y: 0, z: 0 },
        max: { x: 1, y: 1, z: 1 },
        setFromObject: jest.fn(),
        intersectsBox: jest.fn().mockReturnValue(false),
        getCenter: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
        getSize: jest.fn().mockReturnValue({ x: 1, y: 1, z: 1 }),
        containsPoint: jest.fn().mockReturnValue(false),
      }),
    };
    
    return box3;
  }),
  
  BufferAttribute: jest.fn().mockImplementation(() => ({
    array: [],
    itemSize: 3,
    normalized: false,
    dynamic: false,
    version: 0,
    needsUpdate: false,
  })),
  
  Points: jest.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    castShadow: false,
    receiveShadow: false,
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    geometry: { dispose: jest.fn() },
    material: { dispose: jest.fn() },
    userData: {},
    type: 'Points',
  })),
  
  MathUtils: {
    lerp: jest.fn().mockImplementation((x, y, t) => {
      return x + (y - x) * t;
    }),
    degToRad: jest.fn().mockImplementation((deg) => deg * Math.PI / 180),
    radToDeg: jest.fn().mockImplementation((rad) => rad * 180 / Math.PI),
    mapLinear: jest.fn().mockImplementation((x, a1, a2, b1, b2) => {
      return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
    }),
  },
};

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn((id) => {
  return id;
});

// Enhanced Canvas mocking with WebGL support
const mockGLContext = {
  getExtension: jest.fn().mockReturnValue(null),
  getParameter: jest.fn().mockImplementation((param) => {
    switch (param) {
      case 0x1F02: return 'WebGL 2.0'; // VERSION
      case 0x8BAA: return true;         // MAX_VERTEX_ATTRIBS
      case 0x8B4B: return 16;          // MAX_TEXTURE_SIZE
      default: return 1;
    }
  }),
  createShader: jest.fn().mockReturnValue({}),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  getShaderParameter: jest.fn().mockReturnValue(true),
  createProgram: jest.fn().mockReturnValue({}),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  getProgramParameter: jest.fn().mockReturnValue(true),
  useProgram: jest.fn(),
  createBuffer: jest.fn().mockReturnValue({}),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  drawArrays: jest.fn(),
  drawElements: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  clear: jest.fn(),
  clearColor: jest.fn(),
  clearDepth: jest.fn(),
  depthFunc: jest.fn(),
  viewport: jest.fn(),
  getUniformLocation: jest.fn(),
  uniform1f: jest.fn(),
  uniform2f: jest.fn(),
  uniform3f: jest.fn(),
  uniform4f: jest.fn(),
  uniformMatrix4fv: jest.fn(),
  getAttribLocation: jest.fn(),
  canvas: document.createElement('canvas')
};

// Mock Canvas getContext with both 2D and WebGL support
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation((context) => {
  if (context === 'webgl' || context === 'webgl2') {
    return mockGLContext;
  }
  if (context === '2d') {
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn().mockReturnValue({ data: new Array(4) }),
      putImageData: jest.fn(),
      createImageData: jest.fn().mockReturnValue({ data: new Array(4) }),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 0 }),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn()
    };
  }
  return null;
});

// Enhanced DOM element mocking
Object.defineProperty(Element.prototype, 'querySelectorAll', {
  value: jest.fn().mockImplementation(function(selector) {
    // Return an array-like object that mimics NodeList
    return [];
  }),
  configurable: true,
});

Object.defineProperty(Element.prototype, 'querySelector', {
  value: jest.fn().mockImplementation(function(selector) {
    return null;
  }),
  configurable: true,
});

// Mock document methods that might be missing
Object.defineProperty(Document.prototype, 'querySelectorAll', {
  value: jest.fn().mockImplementation(function(selector) {
    return [];
  }),
  configurable: true,
});

Object.defineProperty(Document.prototype, 'querySelector', {
  value: jest.fn().mockImplementation(function(selector) {
    return null;
  }),
  configurable: true,
});

// Mock addEventListener properly
Object.defineProperty(EventTarget.prototype, 'addEventListener', {
  value: jest.fn(),
  configurable: true,
});

Object.defineProperty(EventTarget.prototype, 'removeEventListener', {
  value: jest.fn(),
  configurable: true,
});

// Mock Image
global.Image = jest.fn().mockImplementation(() => ({
  src: '',
  width: 0,
  height: 0,
  onload: null,
  onerror: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue('mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    type: 'sine',
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  }),
  createGainNode: jest.fn().mockReturnValue({
    gain: { setValueAtTime: jest.fn() },
    connect: jest.fn()
  }),
  createAnalyser: jest.fn().mockReturnValue({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: jest.fn()
  }),
  destination: {},
  state: 'running'
})) as any;

// Export for easy access
export { mockLocalStorage };