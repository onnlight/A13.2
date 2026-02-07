import { Game, GameState } from '../src/main';

// Mock setup for game state testing
jest.mock('../src/audio', () => ({
  AudioManager: jest.fn().mockImplementation(() => ({
    getListener: jest.fn().mockReturnValue({}),
    loadSound: jest.fn(),
    playSound: jest.fn(),
    stopSound: jest.fn(),
    playBackgroundMusic: jest.fn(),
    stopBackgroundMusic: jest.fn(),
    setMusicEnabled: jest.fn(),
    setSFXEnabled: jest.fn(),
    setMusicVolume: jest.fn(),
    setSFXVolume: jest.fn(),
    resumeAudioContext: jest.fn(),
    dispose: jest.fn(),
  }))
}));

describe('Game State Management Tests', () => {
  let game: Game;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock DOM elements
    document.body.innerHTML = `
      <canvas id="gameCanvas"></canvas>
      <div id="score">0</div>
      <div id="finalScore">0</div>
      <div id="highScore">0</div>
      <div id="mainMenu"></div>
      <div id="gameOverMenu"></div>
      <div id="powerUpIndicator"></div>
      <div id="leaderboard"></div>
      <div id="pauseMenu"></div>
      <div id="settingsMenu"></div>
      <div id="tutorialOverlay"></div>
      <button id="musicToggle"></button>
      <button id="sfxToggle"></button>
      <button id="playBtn"></button>
      <button id="restartBtn"></button>
      <button id="leftBtn"></button>
      <button id="rightBtn"></button>
      <button id="pauseBtn"></button>
      <button id="homeBtn"></button>
    `;
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    
    // Initialize game
    game = new Game();
  });

  afterEach(() => {
    if (game) {
      game.dispose();
    }
  });

  describe('Initial State', () => {
    test('should initialize with menu state', () => {
      // Check if game starts in menu state
      expect(game).toBeDefined();
      expect(game).toBeInstanceOf(Game);
    });

    test('should have default settings', () => {
      // Check default audio settings
      expect((game as any).musicEnabled).toBe(true);
      expect((game as any).sfxEnabled).toBe(true);
    });
  });

  describe('Pause System', () => {
    test('should pause game when P is pressed', () => {
      // Simulate starting game
      (game as any).gameState = 'playing';
      
      // Simulate P key press
      const pEvent = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(pEvent);
      
      // Check if game is paused
      expect((game as any).gameState).toBe('paused');
      expect((game as any).isPaused).toBe(true);
    });

    test('should resume game when P is pressed again', () => {
      // First pause the game
      (game as any).gameState = 'paused';
      (game as any).isPaused = true;
      
      // Then resume
      const pEvent = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(pEvent);
      
      // Check if game is resumed
      expect((game as any).gameState).toBe('playing');
      expect((game as any).isPaused).toBe(false);
    });

    test('should pause game when ESC is pressed', () => {
      // Simulate playing game
      (game as any).gameState = 'playing';
      
      // Simulate ESC key press
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);
      
      // Check if game is paused
      expect((game as any).gameState).toBe('paused');
      expect((game as any).isPaused).toBe(true);
    });

    test('should not pause game if not playing', () => {
      // Simulate being in menu
      (game as any).gameState = 'menu';
      
      // Try to pause
      const pEvent = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(pEvent);
      
      // Should not pause
      expect((game as any).gameState).toBe('menu');
      expect((game as any).isPaused).toBe(false);
    });

    test('should save game state when paused', () => {
      // Simulate playing game with some progress
      (game as any).gameState = 'playing';
      (game as any).score = 1000;
      (game as any).gameTime = 5000;
      
      // Pause the game
      const pauseEvent = new KeyboardEvent('keydown', { key: 'p' });
      document.dispatchEvent(pauseEvent);
      
      // Check if state is saved
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'savedGameState',
        expect.stringContaining('1000') // score should be in saved state
      );
    });
  });

  describe('Navigation System', () => {
    test('should go to main menu when H is pressed', () => {
      // Simulate playing game
      (game as any).gameState = 'playing';
      
      // Simulate H key press
      const hEvent = new KeyboardEvent('keydown', { key: 'h' });
      document.dispatchEvent(hEvent);
      
      // Check if game returns to menu
      expect((game as any).gameState).toBe('menu');
    });

    test('should restart game when R is pressed', () => {
      // Simulate game over
      (game as any).gameState = 'gameover';
      
      // Simulate R key press
      const rEvent = new KeyboardEvent('keydown', { key: 'r' });
      document.dispatchEvent(rEvent);
      
      // Check if game restarts
      expect((game as any).gameState).toBe('playing');
      expect((game as any).score).toBe(0);
      expect((game as any).gameTime).toBe(0);
    });

    test('should show tutorial when T is pressed', () => {
      // Simulate being in menu
      (game as any).gameState = 'menu';
      
      // Simulate T key press
      const tEvent = new KeyboardEvent('keydown', { key: 't' });
      document.dispatchEvent(tEvent);
      
      // Check if tutorial is shown
      expect((game as any).gameState).toBe('tutorial');
    });

    test('should show settings when S is pressed', () => {
      // Simulate being in menu
      (game as any).gameState = 'menu';
      
      // Simulate S key press
      const sEvent = new KeyboardEvent('keydown', { key: 's' });
      document.dispatchEvent(sEvent);
      
      // Check if settings is shown
      expect((game as any).gameState).toBe('settings');
    });
  });

  describe('Settings Management', () => {
    test('should load settings from localStorage', () => {
      // Mock saved settings
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        musicEnabled: false,
        sfxEnabled: false,
        selectedSkin: 'fire',
        difficulty: 'hard'
      }));
      
      // Initialize game
      const newGame = new Game();
      
      // Check if settings are loaded
      expect((newGame as any).musicEnabled).toBe(false);
      expect((newGame as any).sfxEnabled).toBe(false);
      expect((newGame as any).selectedSkin).toBe('fire');
      expect((newGame as any).difficulty).toBe('hard');
    });

    test('should save settings to localStorage', () => {
      // Change some settings
      (game as any).musicEnabled = false;
      (game as any).selectedSkin = 'rainbow';
      
      // Call save settings
      (game as any).saveSettings();
      
      // Check if settings are saved
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'gameSettings',
        expect.stringContaining('musicEnabled')
      );
    });
  });

  describe('Game State Transitions', () => {
    test('should handle menu to gameplay transition', () => {
      // Start in menu
      expect((game as any).gameState).toBe('menu');
      
      // Start game
      (game as any).startGame();
      
      // Check if state changed to playing
      expect((game as any).gameState).toBe('playing');
    });

    test('should handle gameplay to game over transition', () => {
      // Start game
      (game as any).startGame();
      expect((game as any).gameState).toBe('playing');
      
      // Trigger game over
      (game as any).gameOver();
      
      // Check if state changed to game over
      expect((game as any).gameState).toBe('gameover');
    });

    test('should handle game over to menu transition', () => {
      // End game
      (game as any).gameOver();
      expect((game as any).gameState).toBe('gameover');
      
      // Go to main menu
      (game as any).goToMainMenu();
      
      // Check if state changed to menu
      expect((game as any).gameState).toBe('menu');
    });
  });

  describe('Touch Controls', () => {
    test('should handle pause button click', () => {
      // Start game
      (game as any).startGame();
      expect((game as any).gameState).toBe('playing');
      
      // Click pause button
      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) {
        pauseBtn.click();
      }
      
      // Check if game is paused
      expect((game as any).gameState).toBe('paused');
    });

    test('should handle home button click', () => {
      // Start game
      (game as any).startGame();
      expect((game as any).gameState).toBe('playing');
      
      // Click home button
      const homeBtn = document.getElementById('homeBtn');
      if (homeBtn) {
        homeBtn.click();
      }
      
      // Check if game returns to menu
      expect((game as any).gameState).toBe('menu');
    });
  });

  describe('Audio Integration', () => {
    test('should mute SFX during pause', () => {
      // Mock audio manager
      const mockAudioManager = (game as any).audioManager;
      
      // Start game and pause it
      (game as any).startGame();
      (game as any).pauseGame();
      
      // Check if SFX is disabled during pause
      expect(mockAudioManager.setSFXEnabled).toHaveBeenCalledWith(false);
    });

    test('should restore SFX when resuming', () => {
      // Mock audio manager
      const mockAudioManager = (game as any).audioManager;
      
      // Start game, pause, then resume
      (game as any).startGame();
      (game as any).pauseGame();
      (game as any).resumeGame();
      
      // Check if SFX settings are restored
      expect(mockAudioManager.setSFXEnabled).toHaveBeenCalledWith(true);
    });

    test('should play menu sounds for navigation', () => {
      // Mock audio manager
      const mockAudioManager = (game as any).audioManager;
      
      // Go to main menu (should play menu sound)
      (game as any).goToMainMenu();
      
      // Check if menu sound is played
      expect(mockAudioManager.playSound).toHaveBeenCalledWith('menu');
    });

    test('should stop background music on game over', () => {
      // Mock audio manager
      const mockAudioManager = (game as any).audioManager;
      
      // Trigger game over
      (game as any).gameOver();
      
      // Check if background music is stopped
      expect(mockAudioManager.stopBackgroundMusic).toHaveBeenCalled();
    });
  });
});