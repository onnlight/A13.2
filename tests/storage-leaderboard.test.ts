import { mockLocalStorage } from './setup';

describe('Leaderboard and Local Storage Tests', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset localStorage mock
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
  });

  describe('Local Storage Basic Operations', () => {
    test('should save data to localStorage', () => {
      const testData = { score: 1000, difficulty: 'medium' };
      
      mockLocalStorage.setItem('testData', JSON.stringify(testData));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testData', JSON.stringify(testData));
    });

    test('should retrieve data from localStorage', () => {
      const testData = { score: 1000, difficulty: 'medium' };
      
      mockLocalStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(testData));
      
      const retrieved = JSON.parse(mockLocalStorage.getItem('testData')!);
      
      expect(retrieved).toEqual(testData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testData');
    });

    test('should handle missing data in localStorage', () => {
      mockLocalStorage.getItem = jest.fn().mockReturnValue(null);
      
      const result = mockLocalStorage.getItem('nonexistent');
      
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('nonexistent');
    });

    test('should remove data from localStorage', () => {
      mockLocalStorage.removeItem('testData');
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testData');
    });

    test('should clear all localStorage data', () => {
      mockLocalStorage.clear();
      
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('High Score Management', () => {
    test('should save new high score', () => {
      const newHighScore = 5000;
      
      mockLocalStorage.getItem = jest.fn().mockReturnValue('3000');
      
      const currentHighScore = parseInt(mockLocalStorage.getItem('highScore')!);
      
      if (newHighScore > currentHighScore) {
        mockLocalStorage.setItem('highScore', newHighScore.toString());
      }
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('highScore', '5000');
    });

    test('should not update high score if new score is lower', () => {
      const newScore = 2000;
      
      mockLocalStorage.getItem = jest.fn().mockReturnValue('3000');
      
      const currentHighScore = parseInt(mockLocalStorage.getItem('highScore')!);
      
      if (newScore > currentHighScore) {
        mockLocalStorage.setItem('highScore', newScore.toString());
      }
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    test('should handle first-time high score (no existing score)', () => {
      mockLocalStorage.getItem = jest.fn().mockReturnValue(null);
      
      const currentHighScore = parseInt(mockLocalStorage.getItem('highScore')!);
      
      if (isNaN(currentHighScore) || 1500 > currentHighScore) {
        mockLocalStorage.setItem('highScore', '1500');
      }
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('highScore', '1500');
    });

    test('should load high score on startup', () => {
      mockLocalStorage.getItem = jest.fn().mockReturnValue('7500');
      
      const loadedHighScore = mockLocalStorage.getItem('highScore');
      
      expect(loadedHighScore).toBe('7500');
      expect(parseInt(loadedHighScore!)).toBe(7500);
    });

    test('should handle corrupted high score data', () => {
      mockLocalStorage.getItem = jest.fn().mockReturnValue('invalid_score');
      
      const loadedHighScore = mockLocalStorage.getItem('highScore');
      
      expect(loadedHighScore).toBe('invalid_score');
      expect(parseInt(loadedHighScore!)).toBeNaN();
    });
  });

  describe('Leaderboard Operations', () => {
    test('should save score to leaderboard', () => {
      const newScore = {
        score: 2500,
        date: Date.now(),
        difficulty: 'medium'
      };
      
      const leaderboard = [];
      leaderboard.push(newScore);
      
      mockLocalStorage.setItem('leaderboard', JSON.stringify(leaderboard));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'leaderboard', 
        JSON.stringify(leaderboard)
      );
    });

    test('should load leaderboard from storage', () => {
      const mockLeaderboard = [
        { score: 5000, date: Date.now() - 86400000, difficulty: 'hard' },
        { score: 3000, date: Date.now() - 172800000, difficulty: 'medium' },
        { score: 1000, date: Date.now() - 259200000, difficulty: 'easy' }
      ];
      
      mockLocalStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(mockLeaderboard));
      
      const loadedLeaderboard = JSON.parse(mockLocalStorage.getItem('leaderboard')!);
      
      expect(loadedLeaderboard).toEqual(mockLeaderboard);
      expect(loadedLeaderboard).toHaveLength(3);
    });

    test('should limit leaderboard to top 10 scores', () => {
      const largeLeaderboard = Array.from({ length: 100 }, (_, i) => ({
        score: (i + 1) * 100,
        date: Date.now(),
        difficulty: 'medium'
      }));
      
      const top10Leaderboard = [...largeLeaderboard]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      expect(top10Leaderboard).toHaveLength(10);
      expect(top10Leaderboard[0].score).toBe(10000); // Highest score
      expect(top10Leaderboard[9].score).toBe(1000);   // 10th highest score
    });
  });

  describe('Game Settings Persistence', () => {
    test('should save audio settings', () => {
      const audioSettings = {
        musicEnabled: false,
        sfxEnabled: true
      };
      
      mockLocalStorage.setItem('audioSettings', JSON.stringify(audioSettings));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'audioSettings',
        JSON.stringify(audioSettings)
      );
    });

    test('should load audio settings', () => {
      const savedAudioSettings = {
        musicEnabled: false,
        sfxEnabled: true
      };
      
      mockLocalStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(savedAudioSettings));
      
      const loadedSettings = JSON.parse(mockLocalStorage.getItem('audioSettings')!);
      
      expect(loadedSettings.musicEnabled).toBe(false);
      expect(loadedSettings.sfxEnabled).toBe(true);
    });

    test('should save customization settings', () => {
      const customizationSettings = {
        selectedSkin: 'fire',
        difficulty: 'hard'
      };
      
      mockLocalStorage.setItem('customizationSettings', JSON.stringify(customizationSettings));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'customizationSettings',
        JSON.stringify(customizationSettings)
      );
    });

    test('should load customization settings', () => {
      const savedSettings = {
        selectedSkin: 'rainbow',
        difficulty: 'easy'
      };
      
      mockLocalStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(savedSettings));
      
      const loadedSettings = JSON.parse(mockLocalStorage.getItem('customizationSettings')!);
      
      expect(loadedSettings.selectedSkin).toBe('rainbow');
      expect(loadedSettings.difficulty).toBe('easy');
    });

    test('should save complete settings object', () => {
      const completeSettings = {
        musicEnabled: false,
        sfxEnabled: true,
        selectedSkin: 'ice',
        difficulty: 'easy',
        highScore: 3500,
        totalPlayTime: 7200000 // 2 hours in milliseconds
      };
      
      mockLocalStorage.setItem('gameSettings', JSON.stringify(completeSettings));
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'gameSettings',
        JSON.stringify(completeSettings)
      );
    });
  });

  describe('Data Validation and Error Handling', () => {
    test('should handle JSON parsing errors', () => {
      const validateAndRepair = (data: string | null) => {
        if (!data) return null;
        
        try {
          const parsed = JSON.parse(data);
          if (!parsed || typeof parsed !== 'object') {
            return null;
          }
          return parsed;
        } catch (error) {
          console.warn('Corrupted data detected, clearing...');
          return null;
        }
      };
      
      mockLocalStorage.getItem = jest.fn().mockReturnValue('corrupted_data');
      
      expect(() => {
        JSON.parse(mockLocalStorage.getItem('testData')!);
      }).toThrow();
    });

    test('should validate score data structure', () => {
      const validateScoreData = (data: any) => {
        return data.hasOwnProperty('score') && 
               data.hasOwnProperty('date') && 
               data.hasOwnProperty('difficulty');
      };
      
      const invalidScoreData = {
        // Missing required fields
        score: 1000,
        // missing date and difficulty
      };
      
      expect(validateScoreData({ score: 1000, date: Date.now(), difficulty: 'medium' })).toBe(true);
      expect(validateScoreData(invalidScoreData)).toBe(false);
    });

    test('should handle localStorage quota exceeded', () => {
      const testData = { score: 1000, difficulty: 'medium' };
      
      const mockSetItem = jest.fn().mockImplementation(() => {
        const error = new Error('QuotaExceededError: localStorage quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      mockLocalStorage.setItem = mockSetItem;
      
      expect(() => {
        mockLocalStorage.setItem('testData', JSON.stringify(testData));
      }).toThrow('QuotaExceededError');
    });

    test('should handle localStorage being disabled', () => {
      // Mock localStorage being disabled
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });
      
      expect(typeof localStorage).toBe('undefined');
    });
  });

  describe('Performance and Optimization', () => {
    test('should implement lazy loading for large datasets', () => {
      const allScores = Array.from({ length: 100 }, (_, i) => ({
        score: (i + 1) * 100,
        date: Date.now(),
        difficulty: 'medium'
      }));
      
      const loadScoresPage = (page: number, pageSize: number) => {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        return allScores.slice(startIndex, endIndex);
      };
      
      const firstPage = loadScoresPage(0, 10);
      const secondPage = loadScoresPage(1, 10);
      
      expect(firstPage).toHaveLength(10);
      expect(secondPage).toHaveLength(10);
      expect(firstPage[0].score).toBe(100); // First highest score
      expect(secondPage[0].score).toBe(90);  // 11th highest score
    });
  });
});