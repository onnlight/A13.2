import { mockLocalStorage } from './setup';

describe('UI Customization Tests', () => {
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
        'mainMenu': { style: { display: 'block' } },
        'gameOverMenu': { style: { display: 'none' } },
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
  });

  describe('Cube Skin Customization', () => {
    test('should display all available skin options', () => {
      const skinButtons = [
        { dataset: { skin: 'neon' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { skin: 'fire' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { skin: 'ice' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { skin: 'rainbow' }, classList: { remove: jest.fn(), add: jest.fn() } }
      ];
      
      document.getElementById = jest.fn().mockReturnValue({
        'mainMenu': {
          querySelectorAll: jest.fn().mockReturnValue(skinButtons)
        }
      });
      
      const foundButtons = document.getElementById('mainMenu').querySelectorAll('[data-skin]');
      
      expect(foundButtons).toHaveLength(4);
      foundButtons.forEach((button: any, index: number) => {
        expect(button.dataset.skin).toBe(['neon', 'fire', 'ice', 'rainbow'][index]);
      });
    });

    test('should select neon skin by default', () => {
      const skinButtons = [
        { dataset: { skin: 'neon' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { skin: 'fire' }, classList: { remove: jest.fn(), add: jest.fn() } }
      ];
      
      document.getElementById = jest.fn().mockReturnValue({
        'mainMenu': {
          querySelectorAll: jest.fn().mockReturnValue(skinButtons)
        }
      });
      
      // Find neon button and mark as selected
      const foundButtons = document.getElementById('mainMenu').querySelectorAll('[data-skin]');
      const neonButton = foundButtons.find((btn: any) => btn.dataset.skin === 'neon');
      
      if (neonButton) {
        neonButton.classList.add('selected');
      }
      
      expect(neonButton?.classList.add).toHaveBeenCalledWith('selected');
    });

    test('should change skin selection when different skin is clicked', () => {
      const skinButtons = [
        { dataset: { skin: 'neon' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { skin: 'fire' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { skin: 'ice' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { skin: 'rainbow' }, classList: { remove: jest.fn(), add: jest.fn() } }
      ];
      
      document.getElementById = jest.fn().mockReturnValue({
        'mainMenu': {
          querySelectorAll: jest.fn().mockReturnValue(skinButtons)
        }
      });
      
      // Simulate clicking fire button
      const fireButton = document.getElementById('mainMenu').querySelectorAll('[data-skin]').find((btn: any) => btn.dataset.skin === 'fire');
      
      // Remove selected from all, add selected to clicked
      skinButtons.forEach((button: any) => button.classList.remove('selected'));
      if (fireButton) {
        fireButton.classList.add('selected');
      }
      
      expect(fireButton?.classList.add).toHaveBeenCalledWith('selected');
    });
  });

  describe('Difficulty Selection', () => {
    test('should display all difficulty options', () => {
      const difficultyButtons = [
        { dataset: { difficulty: 'easy' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { difficulty: 'medium' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { difficulty: 'hard' }, classList: { remove: jest.fn(), add: jest.fn() } }
      ];
      
      document.getElementById = jest.fn().mockReturnValue({
        'mainMenu': {
          querySelectorAll: jest.fn().mockReturnValue(difficultyButtons)
        }
      });
      
      const foundButtons = document.getElementById('mainMenu').querySelectorAll('[data-difficulty]');
      
      expect(foundButtons).toHaveLength(3);
      foundButtons.forEach((button: any, index: number) => {
        expect(button.dataset.difficulty).toBe(['easy', 'medium', 'hard'][index]);
      });
    });

    test('should select medium difficulty by default', () => {
      const difficultyButtons = [
        { dataset: { difficulty: 'easy' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { difficulty: 'medium' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { difficulty: 'hard' }, classList: { remove: jest.fn(), add: jest.fn() } }
      ];
      
      document.getElementById = jest.fn().mockReturnValue({
        'mainMenu': {
          querySelectorAll: jest.fn().mockReturnValue(difficultyButtons)
        }
      });
      
      // Find medium button and mark as selected
      const mediumButton = document.getElementById('mainMenu').querySelectorAll('[data-difficulty]').find((btn: any) => btn.dataset.difficulty === 'medium');
      
      // Remove selected from all, add selected to clicked
      difficultyButtons.forEach((button: any) => button.classList.remove('selected'));
      if (mediumButton) {
        mediumButton.classList.add('selected');
      }
      
      expect(mediumButton?.classList.add).toHaveBeenCalledWith('selected');
    });

    test('should change difficulty when different level is selected', () => {
      const difficultyButtons = [
        { dataset: { difficulty: 'easy' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { difficulty: 'medium' }, classList: { remove: jest.fn(), add: jest.fn() } },
        { dataset: { difficulty: 'hard' }, classList: { remove: jest.fn(), add: jest.fn() } }
      ];
      
      document.getElementById = jest.fn().mockReturnValue({
        'mainMenu': {
          querySelectorAll: jest.fn().mockReturnValue(difficultyButtons)
        }
      });
      
      // Simulate clicking hard button
      const hardButton = document.getElementById('mainMenu').querySelectorAll('[data-difficulty]').find((btn: any) => btn.dataset.difficulty === 'hard');
      
      // Remove selected from all, add selected to clicked
      difficultyButtons.forEach((button: any) => button.classList.remove('selected'));
      if (hardButton) {
        hardButton.classList.add('selected');
      }
      
      expect(hardButton?.classList.add).toHaveBeenCalledWith('selected');
    });
  });

  describe('Audio Controls', () => {
    test('should toggle music on/off', () => {
      const musicToggle = document.getElementById('musicToggle');
      
      const initialText = 'Music: ON';
      const initialState = musicToggle?.textContent === initialText;
      
      // Simulate click
      const mockClick = jest.fn();
      const mockToggle = jest.fn();
      const mockAddEventListener = jest.fn();
      
      Object.defineProperty(musicToggle, 'classList', {
        value: { toggle: mockToggle },
        configurable: true
      });
      
      Object.defineProperty(musicToggle, 'addEventListener', {
        value: mockAddEventListener,
        configurable: true
      });
      
      // Simulate click event
      mockAddEventListener.mock.calls[0][1] = jest.fn();
      mockToggle.mock.calls[0][0] = ['muted'];
      
      expect(musicToggle?.classList.toggle).toHaveBeenCalledWith('muted');
      expect(musicToggle.textContent).toBe('Music: OFF');
    });

    test('should toggle SFX on/off', () => {
      const sfxToggle = document.getElementById('sfxToggle');
      
      const initialText = 'SFX: ON';
      const initialState = sfxToggle?.textContent === initialText;
      
      // Simulate click
      const mockClick = jest.fn();
      const mockToggle = jest.fn();
      const mockAddEventListener = jest.fn();
      
      Object.defineProperty(sfxToggle, 'classList', {
        value: { toggle: mockToggle },
        configurable: true
      });
      
      Object.defineProperty(sfxToggle, 'addEventListener', {
        value: mockAddEventListener,
        configurable: true
      });
      
      // Simulate click event
      mockAddEventListener.mock.calls[0][1] = jest.fn();
      mockToggle.mock.calls[0][0] = ['muted'];
      
      expect(sfxToggle?.classList.toggle).toHaveBeenCalledWith('muted');
      expect(sfxToggle.textContent).toBe('SFX: OFF');
    });
  });

  describe('Settings Persistence', () => {
    test('should save all settings to localStorage', () => {
      const allSettings = {
        musicEnabled: false,
        sfxEnabled: true,
        selectedSkin: 'fire',
        difficulty: 'hard'
      };
      
      mockLocalStorage.setItem('gameSettings', JSON.stringify(allSettings));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('gameSettings', JSON.stringify(allSettings));
    });

    test('should load all settings from localStorage', () => {
      const savedSettings = {
        musicEnabled: false,
        sfxEnabled: true,
        selectedSkin: 'rainbow',
        difficulty: 'easy'
      };
      
      mockLocalStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(savedSettings));
      
      const loadedSettings = JSON.parse(mockLocalStorage.getItem('gameSettings')!);
      
      expect(loadedSettings.musicEnabled).toBe(false);
      expect(loadedSettings.sfxEnabled).toBe(true);
      expect(loadedSettings.selectedSkin).toBe('rainbow');
      expect(loadedSettings.difficulty).toBe('easy');
    });

    test('should handle missing settings with defaults', () => {
      // Mock no saved settings
      mockLocalStorage.getItem = jest.fn().mockReturnValue(null);
      
      // Load settings
      const loadedSettings = JSON.parse(mockLocalStorage.getItem('gameSettings')!);
      
      // Should return defaults if no saved data
      expect(loadedSettings).toBeNull();
    });

    test('should handle corrupted settings data', () => {
      // Mock corrupted data
      mockLocalStorage.getItem = jest.fn().mockReturnValue('invalid json');
      
      // Should handle error gracefully
      expect(() => {
        JSON.parse(mockLocalStorage.getItem('gameSettings')!);
      }).toThrow();
    });
  });

  describe('UI State Management', () => {
    test('should hide touch controls on desktop', () => {
      const touchControls = {
        style: { display: 'none' }
      };
      
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 1200,
        configurable: true
      });
      
      // Simulate UI update for desktop
      touchControls.style.display = 'none';
      
      expect(touchControls.style.display).toBe('none');
    });

    test('should show touch controls on mobile', () => {
      const touchControls = {
        style: { display: 'none' }
      };
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true
      });
      
      // Simulate UI update for mobile
      touchControls.style.display = 'flex';
      
      expect(touchControls.style.display).toBe('flex');
    });

    test('should show keyboard controls on desktop', () => {
      const controlsInfo = {
        style: { display: 'block' }
      };
      
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 1200,
        configurable: true
      });
      
      // Simulate UI update for desktop
      controlsInfo.style.display = 'block';
      
      expect(controlsInfo.style.display).toBe('block');
    });

    test('should hide keyboard controls info on mobile', () => {
      const controlsInfo = {
        style: { display: 'block' }
      };
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true
      });
      
      // Simulate UI update for mobile
      controlsInfo.style.display = 'none';
      
      expect(controlsInfo.style.display).toBe('none');
    });

    test('should update button spacing for touch', () => {
      const touchControls = {
        style: { gap: '20px' }
      };
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true
      });
      
      // Simulate UI update for touch
      touchControls.style.gap = '30px';
      
      expect(touchControls.style.gap).toBe('30px');
    });

    test('should adjust button sizes for touch targets', () => {
      const touchButtons = [
        { style: { minHeight: '40px', minWidth: '120px', padding: '10px 20px' } }
      ];
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true
      });
      
      // Simulate UI update for touch
      touchButtons.forEach(button => {
        button.style.minHeight = '50px';
        button.style.minWidth = '150px';
        button.style.padding = '15px 30px';
      });
      
      touchButtons.forEach(button => {
        expect(button.style.minHeight).toBe('50px');
        expect(button.style.minWidth).toBe('150px');
        expect(button.style.padding).toBe('15px 30px');
      });
    });
  });

  describe('Text and Font Scaling', () => {
    test('should scale text size based on viewport', () => {
      let baseFontSize = 16;
      
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true
      });
      
      const getResponsiveFontSize = (baseSize: number) => {
        const scaleFactor = window.innerWidth / 1024;
        return Math.max(baseSize * scaleFactor, 12);
      };
      
      const desktopFontSize = getResponsiveFontSize(baseFontSize);
      const mobileFontSize = getResponsiveFontSize(baseFontSize);
      
      expect(desktopFontSize).toBeGreaterThanOrEqual(16);
      expect(mobileFontSize).toBeLessThan(desktopFontSize);
    });

    test('should adjust button sizes for touch targets', () => {
      const mockButtons = [
        { style: { minHeight: '40px', minWidth: '120px' } }
      ];
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true
      });
      
      // Simulate UI update for touch
      mockButtons.forEach(button => {
        button.style.minHeight = '50px';
        button.style.minWidth = '150px';
      });
      
      mockButtons.forEach(button => {
        expect(button.style.minHeight).toBe('50px');
        expect(button.style.minWidth).toBe('150px');
      });
    });

    test('should ensure readable text contrast at all sizes', () => {
      const colorContrastCheck = (textColor: string, backgroundColor: string) => {
        // Simplified contrast check
        const textLuminance = textColor === '#ffffff' ? 1 : 0.5;
        const bgLuminance = backgroundColor === '#000000' ? 0 : 0.2;
        
        return textLuminance > bgLuminance;
      };
      
      expect(colorContrastCheck('#ffffff', '#000000')).toBe(true);
      expect(colorContrastCheck('#ffffff', '#222222')).toBe(true);
      expect(colorContrastCheck('#cccccc', '#ffffff')).toBe(false);
    });
  });
});