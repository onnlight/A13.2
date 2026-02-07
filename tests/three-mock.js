// THREE.js Module Mock
const Scene = jest.fn(() => ({
  add: jest.fn(),
  remove: jest.fn(),
  position: { x: 0, y: 0, z: 0 },
  children: []
}));

const PerspectiveCamera = jest.fn(() => ({
  position: { x: 0, y: 5, z: 10 },
  lookAt: jest.fn()
}));

const WebGLRenderer = jest.fn(() => ({
  setSize: jest.fn(),
  render: jest.fn(),
  domElement: document.createElement('canvas'),
  getContext: jest.fn().mockReturnValue({
    getParameter: jest.fn().mockReturnValue('WebGL 2.0'),
    getExtension: jest.fn().mockReturnValue(true)
  })
}));

const BoxGeometry = jest.fn(() => ({ dispose: jest.fn() }));
const SphereGeometry = jest.fn(() => ({ dispose: jest.fn() }));
const CylinderGeometry = jest.fn(() => ({ dispose: jest.fn() }));
const ConeGeometry = jest.fn(() => ({ dispose: jest.fn() }));

const MeshPhongMaterial = jest.fn(() => ({
  dispose: jest.fn(),
  color: { set: jest.fn() }
}));

const Mesh = jest.fn(() => ({
  position: { x: 0, y: 0, z: 0, copy: jest.fn() },
  rotation: { x: 0, y: 0, z: 0 },
  add: jest.fn(),
  remove: jest.fn(),
  visible: true
}));

const DirectionalLight = jest.fn(() => ({
  position: { x: 0, y: 10, z: 0 }
}));

const AmbientLight = jest.fn();

const Fog = jest.fn();

const Box3 = jest.fn(() => ({
  setFromCenterAndSize: jest.fn(),
  intersectsBox: jest.fn().mockReturnValue(false)
}));

const Vector3 = jest.fn((x = 0, y = 0, z = 0) => ({
  x, y, z,
  set: jest.fn(),
  copy: jest.fn()
}));

const Color = jest.fn(() => ({
  set: jest.fn(),
  getHex: jest.fn().mockReturnValue(0x000000)
}));

const TextureLoader = jest.fn(() => ({
  load: jest.fn().mockImplementation((url, onLoad) => {
    if (onLoad) onLoad({});
    return {};
  })
}));

module.exports = {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  MeshPhongMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  Fog,
  Box3,
  Vector3,
  Color,
  TextureLoader
};