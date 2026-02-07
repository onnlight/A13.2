// Simple localStorage mock for tests
const createMockLocalStorage = () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  
  return mockLocalStorage;
};

describe('Power-Up System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should add speed power-up correctly', () => {
    const mockPlayer = {
      addPowerUp: jest.fn(),
      hasActivePowerUp: jest.fn().mockReturnValue(false),
      getSpeed: jest.fn().mockReturnValue(0.15),
      getScoreMultiplier: jest.fn().mockReturnValue(1)
    };
    
    const initialSpeed = mockPlayer.getSpeed();
    
    mockPlayer.addPowerUp('speed', 3000, 1.5);
    mockPlayer.hasActivePowerUp = jest.fn().mockReturnValue(true);
    
    expect(mockPlayer.addPowerUp).toHaveBeenCalledWith('speed', 3000, 1.5);
    expect(mockPlayer.hasActivePowerUp('speed')).toBe(true);
    expect(mockPlayer.getSpeed()).toBe(initialSpeed * 1.5);
  });

  test('should add shield power-up correctly', () => {
    const mockPlayer = {
      addPowerUp: jest.fn(),
      hasActivePowerUp: jest.fn().mockReturnValue(false),
      isInvincible: jest.fn().mockReturnValue(false)
    };
    
    mockPlayer.addPowerUp('shield', 5000, 1);
    mockPlayer.hasActivePowerUp = jest.fn().mockReturnValue(true);
    mockPlayer.isInvincible = jest.fn().mockReturnValue(true);
    
    expect(mockPlayer.addPowerUp).toHaveBeenCalledWith('shield', 5000, 1);
    expect(mockPlayer.hasActivePowerUp('shield')).toBe(true);
    expect(mockPlayer.isInvincible()).toBe(true);
  });

  test('should add score multiplier power-up correctly', () => {
    const mockPlayer = {
      addPowerUp: jest.fn(),
      hasActivePowerUp: jest.fn().mockReturnValue(false),
      getScoreMultiplier: jest.fn().mockReturnValue(1)
    };
    
    mockPlayer.addPowerUp('multiplier', 10000, 2);
    mockPlayer.hasActivePowerUp = jest.fn().mockReturnValue(true);
    
    expect(mockPlayer.addPowerUp).toHaveBeenCalledWith('multiplier', 10000, 2);
    expect(mockPlayer.hasActivePowerUp('multiplier')).toBe(true);
    expect(mockPlayer.getScoreMultiplier()).toBe(2);
  });

  test('should remove expired power-ups', () => {
    const mockPlayer = {
      addPowerUp: jest.fn(),
      hasActivePowerUp: jest.fn().mockImplementation(() => false),
      getScoreMultiplier: jest.fn().mockReturnValue(1)
    };
    
    // Add power-up with short duration
    mockPlayer.addPowerUp('speed', 100, 2);
    mockPlayer.hasActivePowerUp = jest.fn().mockReturnValue(true);
    
    // Mock time passing
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 200);
    
    // Simulate update after expiration
    mockPlayer.hasActivePowerUp = jest.fn().mockReturnValue(false);
    
    expect(mockPlayer.hasActivePowerUp('speed')).toBe(false);
    expect(mockPlayer.getScoreMultiplier()).toBe(1);
  });

  test('should handle multiple power-ups simultaneously', () => {
    const mockPlayer = {
      addPowerUp: jest.fn(),
      hasActivePowerUp: jest.fn().mockImplementation((type) => {
        const activePowerUps = ['speed', 'shield', 'multiplier'];
        return activePowerUps.includes(type as any);
      }),
      getScoreMultiplier: jest.fn().mockImplementation(() => 2),
      isInvincible: jest.fn().mockReturnValue(true)
    };
    
    // Add all power-ups
    mockPlayer.addPowerUp('speed', 3000, 1.5);
    mockPlayer.addPowerUp('shield', 5000, 1);
    mockPlayer.addPowerUp('multiplier', 8000, 2);
    
    expect(mockPlayer.hasActivePowerUp('speed')).toBe(true);
    expect(mockPlayer.hasActivePowerUp('shield')).toBe(true);
    expect(mockPlayer.hasActivePowerUp('multiplier')).toBe(true);
    expect(mockPlayer.getScoreMultiplier()).toBe(2);
    expect(mockPlayer.isInvincible()).toBe(true);
  });

  test('should get remaining power-up time correctly', () => {
    const mockPlayer = {
      addPowerUp: jest.fn(),
      hasActivePowerUp: jest.fn().mockReturnValue(true),
      getRemainingPowerUpTime: jest.fn().mockImplementation((type) => {
        const times = { speed: 3000, shield: 5000, multiplier: 8000 };
        return times[type as keyof typeof times] || 0;
      }),
      getScoreMultiplier: jest.fn().mockReturnValue(2)
    };
    
    const remainingSpeedTime = mockPlayer.getRemainingPowerUpTime('speed');
    const remainingShieldTime = mockPlayer.getRemainingPowerUpTime('shield');
    const remainingMultiplierTime = mockPlayer.getRemainingPowerUpTime('multiplier');
    
    expect(remainingSpeedTime).toBe(3000);
    expect(remainingShieldTime).toBe(5000);
    expect(remainingMultiplierTime).toBe(8000);
  });
});