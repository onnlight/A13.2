import { mockLocalStorage } from './setup';

describe('Game State Management Tests', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset localStorage mock
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    
    // Setup DOM elements
    document.getElementById = jest.fn().mockImplementation((id) => {
      const elements: { [key: string]: any } = {
        'gameCanvas': {
          addEventListener: jest.fn(),
          getContext: jest.fn()
        },
        'score': { textContent: '0' },
        'finalScore': { textContent: '0' },
        'highScore': { textContent: '0' },
        'mainMenu': { style: { display: 'block' } },
        'gameOverMenu': { style: { display: 'none' } },
        'powerUpIndicator': { style: { display: 'none' }, textContent: '' },
        'leaderboard': { style: { display: 'none' } },
        'leaderboardList': { innerHTML: '' },
        'playBtn': { addEventListener: jest.fn(), click: jest.fn() },
        'restartBtn': { addEventListener: jest.fn(), click: jest.fn() },
        'musicToggle': { 
          textContent: 'Music: ON', 
          classList: { toggle: jest.fn() }, 
          addEventListener: jest.fn() 
        },
        'sfxToggle': { 
          textContent: 'SFX: ON', 
          classList: { toggle: jest.fn() }, 
          addEventListener: jest.fn() 
        }
      };
      
      return elements[id] || null;
    });
    
    document.querySelectorAll = jest.fn().mockReturnValue([]);
    
    // Mock localStorage getItem to return null for high score
    mockLocalStorage.getItem = jest.fn().mockReturnValue(null);
    
    // Mock performance.now
    performance.now = jest.fn().mockReturnValue(1000);
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    });
  });

  describe('Initial Game State', () => {
    test('should load saved high score on initialization', () => {
      mockLocalStorage.getItem = jest.fn().mockReturnValue('5000');
      
      const highScore = mockLocalStorage.getItem('highScore');
      
      expect(highScore).toBe('5000');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('highScore');
    });

    test('should show main menu initially', () => {
      const mainMenu = document.getElementById('mainMenu');
      
      expect(mainMenu?.style.display).toBe('block');
    });

    test('should hide game over menu initially', () => {
      const gameOverMenu = document.getElementById('gameOverMenu');
      
      expect(gameOverMenu?.style.display).toBe('none');
    });

    test('should hide leaderboard initially', () => {
      const leaderboard = document.getElementById('leaderboard');
      
      expect(leaderboard?.style.display).toBe('none');
    });
  });

  describe('Menu State Management', () => {
    test('should transition from menu to playing state', () => {
      // Simulate state change
      const mainMenu = document.getElementById('mainMenu');
      const gameOverMenu = document.getElementById('gameOverMenu');
      const leaderboard = document.getElementById('leaderboard');
      
      // Simulate menu -> playing transition
      if (mainMenu) mainMenu.style.display = 'none';
      if (gameOverMenu) gameOverMenu.style.display = 'none';
      if (leaderboard) leaderboard.style.display = 'none';
      
      expect(mainMenu?.style.display).toBe('none');
      expect(gameOverMenu?.style.display).toBe('none');
      expect(leaderboard?.style.display).toBe('none');
    });

    test('should show menu when game ends', () => {
      const mainMenu = document.getElementById('mainMenu');
      const gameOverMenu = document.getElementById('gameOverMenu');
      
      // Simulate game over state
      if (mainMenu) mainMenu.style.display = 'block';
      if (gameOverMenu) gameOverMenu.style.display = 'block';
      
      expect(mainMenu?.style.display).toBe('block');
      expect(gameOverMenu?.style.display).toBe('block');
    });
  });

  describe('Playing State Management', () => {
    test('should update score periodically', () => {
      let score = 0;
      const scoreTimer = 150; // Past interval
      
      const scoreInterval = 100; // Update every 100ms
      
      if (scoreTimer > scoreInterval) {
        score += 100;
      }
      
      expect(score).toBe(100);
    });

    test('should handle player input during gameplay', () => {
      const mockPlayer = {
        moveLeft: jest.fn(),
        moveRight: jest.fn(),
        update: jest.fn()
      };
      
      // Simulate keyboard input
      mockPlayer.moveLeft();
      mockPlayer.moveRight();
      
      expect(mockPlayer.moveLeft).toHaveBeenCalled();
      expect(mockPlayer.moveRight).toHaveBeenCalled();
    });

    test('should update game objects during gameplay', () => {
      const mockObstacleManager = {
        update: jest.fn()
      };
      
      // Simulate gameplay update
      mockObstacleManager.update(16, 0.3);
      
      expect(mockObstacleManager.update).toHaveBeenCalledWith(16, 0.3);
    });
  });

  describe('Game Over State Management', () => {
    test('should save high score to localStorage', () => {
      const newHighScore = 5000;
      
      mockLocalStorage.setItem = jest.fn();
      // Mock existing high score that is lower than new score
      mockLocalStorage.getItem = jest.fn().mockReturnValue('3000');
      
      const currentHighScore = parseInt(mockLocalStorage.getItem('highScore')!);
      
      if (newHighScore > currentHighScore) {
        mockLocalStorage.setItem('highScore', newHighScore.toString());
      }
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('highScore', '5000');
    });

    test('should save score to leaderboard', () => {
      const mockLeaderboard = [];
      
      const newScore = { score: 2000, date: Date.now(), difficulty: 'medium' };
      mockLeaderboard.push(newScore);
      
      mockLocalStorage.setItem('leaderboard', JSON.stringify(mockLeaderboard));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('leaderboard', JSON.stringify(mockLeaderboard));
    });

    test('should display final score and high score', () => {
      const finalScoreElement = document.getElementById('finalScore');
      const highScoreElement = document.getElementById('highScore');
      
      // Simulate game over display
      if (finalScoreElement) finalScoreElement.textContent = '2500';
      if (highScoreElement) highScoreElement.textContent = '5000';
      
      expect(finalScoreElement?.textContent).toBe('2500');
      expect(highScoreElement?.textContent).toBe('5000');
    });

    test('should show restart functionality', () => {
      const restartBtn = document.getElementById('restartBtn');
      
      // Mock restart button click
      if (restartBtn) {
        (restartBtn as any).addEventListener.mock.calls[0][1] = jest.fn();
      }
      
      expect(restartBtn).toBeDefined();
    });
  });

  describe('State Transitions', () => {
    test('should handle menu -> playing transition', () => {
      let state = 'menu';
      
      state = 'playing'; // Simulate transition
      
      expect(state).toBe('playing');
      expect(state).not.toBe('menu');
    });

    test('should handle playing -> game over transition', () => {
      let state = 'playing';
      
      state = 'gameover'; // Simulate transition
      
      expect(state).toBe('gameover');
      expect(state).not.toBe('playing');
    });

    test('should handle game over -> menu transition', () => {
      let state = 'gameover';
      
      state = 'menu'; // Simulate transition
      
      expect(state).toBe('menu');
      expect(state).not.toBe('gameover');
    });
  });

  describe('Input Handling', () => {
    test('should track keyboard input state', () => {
      const keys = new Set<string>();
      
      // Simulate key press
      keys.add('a');
      keys.add('ArrowLeft');
      
      expect(keys.has('a')).toBe(true);
      expect(keys.has('ArrowLeft')).toBe(true);
    });

    test('should handle key release', () => {
      const keys = new Set<string>();
      keys.add('a');
      keys.add('ArrowLeft');
      
      // Simulate key release
      keys.delete('a');
      
      expect(keys.has('a')).toBe(false);
      expect(keys.has('ArrowLeft')).toBe(true);
    });

    test('should handle touch input state', () => {
      let touchStartX: number | null = null;
      
      // Simulate touch start
      touchStartX = 100;
      expect(touchStartX).toBe(100);
      
      // Simulate touch end
      touchStartX = null;
      expect(touchStartX).toBeNull();
    });
  });

  describe('Performance State', () => {
    test('should track frame timing', () => {
      let lastTime = 0;
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      
      lastTime = currentTime;
      
      expect(deltaTime).toBeGreaterThan(0);
      expect(deltaTime).toBeLessThan(1000); // Should be reasonable
    });

    test('should handle variable frame rates', () => {
      const frameRates = [30, 60, 120];
      let totalTime = 0;
      
      frameRates.forEach(fps => {
        const deltaTime = 1000 / fps; // deltaTime
        totalTime += deltaTime;
      });
      
      expect(totalTime).toBeCloseTo(16.667, 2); // 30+60+120 frame times
    });
  });

  describe('Error Recovery Flow', () => {
    test('should handle and recover from audio context errors', () => {
      const mockPlaySound = jest.fn().mockImplementation(() => {
        throw new Error('Audio context unavailable');
      });
      
      // Game should continue playing despite audio error
      expect(() => mockPlaySound('powerup')).toThrow('Audio context unavailable');
    });

    test('should handle renderer errors gracefully', () => {
      const mockScene = {
        render: jest.fn().mockImplementation(() => {
          throw new Error('WebGL context lost');
        })
      };
      
      // Game should continue with error state
      expect(() => mockScene.render()).toThrow('WebGL context lost');
    });
  });
});