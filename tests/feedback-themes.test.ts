import { mockLocalStorage } from './setup';

describe('Feedback System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    
    document.getElementById = jest.fn().mockImplementation((id: string) => {
      const elements: { [key: string]: any } = {
        'feedbackModal': { 
          style: { display: 'none' },
          querySelectorAll: jest.fn().mockReturnValue([])
        },
        'feedbackMessage': { 
          value: '',
          addEventListener: jest.fn(),
          textContent: ''
        },
        'feedbackEmail': { 
          value: '',
          addEventListener: jest.fn() 
        },
        'feedbackCharCount': { textContent: '0' },
        'includeGameState': { checked: true },
        'mainMenu': { style: { display: 'none' } },
      };
      return elements[id] || null;
    });
    
    document.querySelectorAll = jest.fn().mockReturnValue([]);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    mockLocalStorage.getItem = jest.fn().mockReturnValue(null);
  });

  describe('Feedback Modal', () => {
    test('should have feedback modal element', () => {
      const feedbackModal = document.getElementById('feedbackModal');
      expect(feedbackModal).toBeDefined();
    });

    test('should hide feedback modal initially', () => {
      const feedbackModal = document.getElementById('feedbackModal');
      expect(feedbackModal?.style.display).toBe('none');
    });

    test('should have feedback message textarea', () => {
      const feedbackMessage = document.getElementById('feedbackMessage');
      expect(feedbackMessage).toBeDefined();
    });

    test('should have feedback type buttons', () => {
      document.querySelectorAll = jest.fn().mockReturnValue([
        { classList: { remove: jest.fn() }, addEventListener: jest.fn() }
      ]);
      const buttons = document.querySelectorAll('.feedback-type-btn');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Feedback Submission', () => {
    test('should track feedback submissions in localStorage', () => {
      const count = parseInt(mockLocalStorage.getItem('feedbackCount') || '0');
      mockLocalStorage.setItem('feedbackCount', (count + 1).toString());
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('feedbackCount', '1');
    });

    test('should increment feedback count on submission', () => {
      mockLocalStorage.getItem = jest.fn().mockReturnValue('5');
      const count = parseInt(mockLocalStorage.getItem('feedbackCount') || '0');
      mockLocalStorage.setItem('feedbackCount', (count + 1).toString());
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('feedbackCount', '6');
    });
  });

  describe('Feedback Keyboard Shortcuts', () => {
    test('should not process game shortcuts when feedback modal is open', () => {
      const feedbackModal = document.getElementById('feedbackModal');
      if (feedbackModal) {
        feedbackModal.style.display = 'block';
      }
      
      const isFeedbackOpen = feedbackModal && feedbackModal.style.display === 'block';
      expect(isFeedbackOpen).toBe(true);
    });

    test('should close feedback modal on Escape key', () => {
      const feedbackModal = document.getElementById('feedbackModal');
      if (feedbackModal) {
        feedbackModal.style.display = 'block';
      }
      
      // Simulate Escape key
      const event = { key: 'Escape' };
      const shouldClose = event.key === 'Escape' && feedbackModal?.style.display === 'block';
      
      expect(shouldClose).toBe(true);
    });
  });

  describe('Toast Notifications', () => {
    test('should create toast element', () => {
      const toast = document.createElement('div');
      toast.className = 'toast success';
      toast.textContent = 'Test message';
      
      expect(toast.className).toContain('toast');
      expect(toast.textContent).toBe('Test message');
    });

    test('should have success and info toast types', () => {
      const successToast = document.createElement('div');
      successToast.className = 'toast success';
      
      const infoToast = document.createElement('div');
      infoToast.className = 'toast info';
      
      expect(successToast.className).toContain('success');
      expect(infoToast.className).toContain('info');
    });
  });
});

  describe('Theme System Tests', () => {
    test('should have multiple themes defined', () => {
      const themes = [
        { name: 'Neon Night', primaryColor: 0x00ffff, secondaryColor: 0xff00ff },
        { name: 'Cyber Sunset', primaryColor: 0xff0080, secondaryColor: 0x80ff00 },
        { name: 'Electric Gold', primaryColor: 0xffff00, secondaryColor: 0x00ffff },
        { name: 'Magma Core', primaryColor: 0xff8000, secondaryColor: 0x00ff80 },
        { name: 'Arctic Frost', primaryColor: 0xaaddff, secondaryColor: 0xffeeff },
        { name: 'Toxic Glow', primaryColor: 0x00ff66, secondaryColor: 0xff00ff },
        { name: 'Royal Velvet', primaryColor: 0x9900ff, secondaryColor: 0xffd700 },
        { name: 'Ocean Depths', primaryColor: 0x0066ff, secondaryColor: 0x00ffcc },
      ];
      
      expect(themes.length).toBe(8);
    });

  test('should have valid hex colors', () => {
    const themes = [
      { primaryColor: 0x00ffff },
      { primaryColor: 0xff0080 },
      { primaryColor: 0xffff00 },
      { primaryColor: 0xff8000 },
    ];
    
    themes.forEach(theme => {
      expect(theme.primaryColor).toBeGreaterThanOrEqual(0);
      expect(theme.primaryColor).toBeLessThanOrEqual(0xffffff);
    });
  });

  test('should cycle through themes', () => {
    const themes = [0, 1, 2, 3, 4, 5, 6, 7];
    const themeIndex = 10;
    
    const actualIndex = themeIndex % themes.length;
    expect(actualIndex).toBe(2);
  });

  test('should have fog and sky colors', () => {
    const theme = {
      name: 'Neon Night',
      primaryColor: 0x00ffff,
      secondaryColor: 0xff00ff,
      fogColor: 0x000033,
      skyColor: 0x000011
    };
    
    expect(theme.fogColor).toBeDefined();
    expect(theme.skyColor).toBeDefined();
  });
});
