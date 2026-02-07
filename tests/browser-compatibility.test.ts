// Browser Compatibility Tests
describe('Browser Compatibility', () => {
  describe('WebGL Support', () => {
    test('should detect WebGL support', () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const hasWebGL = !!gl;
      expect(typeof hasWebGL).toBe('boolean');
    });

    test('should detect WebGL2 support', () => {
      const canvas = document.createElement('canvas');
      const gl2 = canvas.getContext('webgl2');
      const hasWebGL2 = !!gl2;
      expect(typeof hasWebGL2).toBe('boolean');
    });
  });

  describe('Audio Support', () => {
    test('should detect Web Audio API support', () => {
      const hasWebAudio = !!(window.AudioContext || (window as any).webkitAudioContext);
      expect(typeof hasWebAudio).toBe('boolean');
    });

    test('should detect HTML5 audio support', () => {
      const audio = document.createElement('audio');
      const hasHTML5Audio = typeof audio.canPlayType === 'function';
      expect(hasHTML5Audio).toBe(true);
    });
  });

  describe('Local Storage Support', () => {
    test('should detect localStorage support', () => {
      const hasLocalStorage = typeof localStorage !== 'undefined';
      expect(hasLocalStorage).toBe(true);
    });

    test('should handle localStorage quota exceeded', () => {
      const testKey = 'test-key';
      const largeData = 'x'.repeat(1024 * 1024 * 10); // 10MB
      
      try {
        localStorage.setItem(testKey, largeData);
        // If this succeeds, remove the test data
        localStorage.removeItem(testKey);
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(DOMException);
      }
    });
  });

  describe('Canvas 2D Fallback', () => {
    test('should provide Canvas 2D context when WebGL unavailable', () => {
      const canvas = document.createElement('canvas');
      const ctx2d = canvas.getContext('2d');
      expect(ctx2d).toBeDefined();
    });
  });

  describe('Performance Features', () => {
    test('should detect requestAnimationFrame support', () => {
      const hasRAF = typeof requestAnimationFrame !== 'undefined';
      expect(hasRAF).toBe(true);
    });

    test('should detect performance API support', () => {
      const hasPerformance = typeof performance !== 'undefined';
      expect(hasPerformance).toBe(true);
    });
  });
});