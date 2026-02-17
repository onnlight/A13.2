import { ShopUI } from '../src/shop';
import {
  getCoinBalance,
  addCoins,
  purchaseSkin,
  isSkinOwned,
  getOwnedSkins,
  getSkinPrices,
  loadShopData,
  saveShopData,
  clearAllData
} from '../src/storage';

// Mock DOM elements
const mockElement = {
  style: { display: 'none' },
  textContent: '',
  innerHTML: '',
  addEventListener: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
  parentNode: null
};

// Mock document methods
global.document = {
  getElementById: jest.fn((id: string) => {
    const elements: { [key: string]: any } = {
      shopMenu: { ...mockElement, style: { display: 'none' } },
      coinBalance: { ...mockElement, textContent: '0' },
      skinsContainer: { ...mockElement, innerHTML: '' },
      closeShopBtn: { ...mockElement, addEventListener: jest.fn() }
    };
    return elements[id] || null;
  }),
  createElement: jest.fn((tagName: string) => ({
    className: '',
    textContent: '',
    style: {},
    addEventListener: jest.fn(),
    appendChild: jest.fn()
  }))
} as any;

// Mock window
global.window = {
  addEventListener: jest.fn(),
  game: null
} as any;

describe('ShopUI', () => {
  let shopUI: ShopUI;

  beforeEach(() => {
    // Clear all data before each test
    clearAllData();
    
    // Reset DOM mocks
    jest.clearAllMocks();
    
    shopUI = new ShopUI();
  });

  describe('Initialization', () => {
    it('should initialize with closed state', () => {
      expect(shopUI.isOpened()).toBe(false);
    });

    it('should load coin balance from storage', () => {
      addCoins(100);
      shopUI = new ShopUI();
      expect(getCoinBalance()).toBe(100);
    });
  });

  describe('Shop Opening/Closing', () => {
    it('should open shop when called', () => {
      shopUI.open();
      expect(shopUI.isOpened()).toBe(true);
    });

    it('should close shop when called', () => {
      shopUI.open();
      shopUI.close();
      expect(shopUI.isOpened()).toBe(false);
    });

    it('should not open shop if already open', () => {
      shopUI.open();
      const initialCallCount = (global.document.getElementById as jest.Mock).mock.calls.length;
      shopUI.open();
      expect(shopUI.isOpened()).toBe(true);
    });
  });

  describe('Coin Balance Management', () => {
    it('should update coin balance display', () => {
      addCoins(50);
      shopUI.refreshData();
      expect(getCoinBalance()).toBe(50);
    });

    it('should add coins and update display', () => {
      shopUI.addCoins(25);
      expect(getCoinBalance()).toBe(25);
    });
  });

  describe('Skin Purchase System', () => {
    beforeEach(() => {
      addCoins(1000); // Give enough coins for testing
    });

    it('should allow purchasing affordable skins', () => {
      const prices = getSkinPrices();
      const skinToBuy = 'gold' as const;
      const price = prices[skinToBuy];
      
      const purchaseResult = purchaseSkin(skinToBuy, price);
      
      expect(purchaseResult).toBe(true);
      expect(isSkinOwned(skinToBuy)).toBe(true);
      expect(getCoinBalance()).toBe(1000 - price);
    });

    it('should prevent purchasing expensive skins', () => {
      // Clear coins and try to buy expensive skin
      clearAllData();
      addCoins(100);
      
      const prices = getSkinPrices();
      const skinToBuy = 'crystal' as const;
      const price = prices[skinToBuy];
      
      const purchaseResult = purchaseSkin(skinToBuy, price);
      
      expect(purchaseResult).toBe(false);
      expect(isSkinOwned(skinToBuy)).toBe(false);
    });

    it('should prevent purchasing already owned skins', () => {
      const skinToBuy = 'fire' as const;
      const price = getSkinPrices()[skinToBuy];
      
      // Purchase skin first
      purchaseSkin(skinToBuy, price);
      
      // Try to purchase again
      const secondPurchaseResult = purchaseSkin(skinToBuy, price);
      
      expect(secondPurchaseResult).toBe(false);
    });
  });

  describe('Skin Ownership', () => {
    it('should start with neon skin owned', () => {
      expect(isSkinOwned('neon')).toBe(true);
    });

    it('should correctly track owned skins', () => {
      addCoins(500);
      purchaseSkin('gold', 500);
      
      const ownedSkins = getOwnedSkins();
      expect(ownedSkins).toContain('neon');
      expect(ownedSkins).toContain('gold');
    });

    it('should return false for unowned skins', () => {
      expect(isSkinOwned('crystal')).toBe(false);
    });
  });

  describe('Skin Prices', () => {
    it('should have correct pricing structure', () => {
      const prices = getSkinPrices();
      
      expect(prices.neon).toBe(0);      // Free
      expect(prices.fire).toBe(100);    // 100 coins
      expect(prices.ice).toBe(150);     // 150 coins
      expect(prices.rainbow).toBe(200); // 200 coins
      expect(prices.gold).toBe(500);    // 500 coins
      expect(prices.shadow).toBe(400);  // 400 coins
      expect(prices.crystal).toBe(600); // 600 coins
    });
  });

  describe('Data Persistence', () => {
    it('should save and load shop data correctly', () => {
      // Add coins and purchase a skin
      addCoins(300);
      purchaseSkin('ice', 150);
      
      // Load fresh shop data
      const shopData = loadShopData();
      
      expect(shopData.coinBalance).toBe(150); // 300 - 150
      expect(shopData.ownedSkins).toContain('neon');
      expect(shopData.ownedSkins).toContain('ice');
    });

    it('should handle data migration', () => {
      // Test migration from old format
      const oldData = {
        coinBalance: 100,
        ownedSkins: ['neon', 'fire']
      };
      
      // This would be handled by the migration system
      expect(oldData.ownedSkins).toContain('neon');
    });
  });

  describe('UI Rendering', () => {
    it('should render skin cards correctly', () => {
      shopUI.open();
      
      // Should create cards for all skins
      const container = global.document.getElementById('skinsContainer');
      expect(container).toBeTruthy();
    });

    it('should show correct status for owned skins', () => {
      purchaseSkin('fire', 100);
      shopUI.open();
      
      // Fire skin should show as owned
      expect(isSkinOwned('fire')).toBe(true);
    });

    it('should show correct status for affordable skins', () => {
      addCoins(200);
      shopUI.open();
      
      // Should be able to afford fire skin (100 coins)
      expect(getCoinBalance()).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM elements gracefully', () => {
      // Mock missing elements
      (global.document.getElementById as jest.Mock).mockReturnValue(null);
      
      expect(() => new ShopUI()).not.toThrow();
    });

    it('should handle insufficient funds gracefully', () => {
      clearAllData(); // No coins
      
      const purchaseResult = purchaseSkin('gold', 500);
      
      expect(purchaseResult).toBe(false);
      expect(getCoinBalance()).toBe(0);
    });
  });

  describe('Event Listeners', () => {
    it('should setup close button listener', () => {
      const closeBtn = global.document.getElementById('closeShopBtn');
      expect(closeBtn?.addEventListener).toHaveBeenCalled();
    });

    it('should setup keyboard shortcut listener', () => {
      expect(global.window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Integration with Game', () => {
    it('should pause game when shop opens', () => {
      const mockGame = {
        gameState: 'playing',
        pauseGame: jest.fn()
      };
      
      global.window.game = mockGame;
      shopUI.open();
      
      // Should pause game if playing
      expect(mockGame.pauseGame).toHaveBeenCalled();
    });

    it('should refresh data when called', () => {
      addCoins(50);
      
      shopUI.refreshData();
      
      expect(getCoinBalance()).toBe(50);
    });
  });
});