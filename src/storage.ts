// Robust Storage System with Error Handling and Data Validation

export interface LeaderboardEntry {
  score: number;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skin: 'neon' | 'fire' | 'ice' | 'rainbow' | 'gold' | 'shadow' | 'crystal';
  playTime: number;
  obstaclesDodged: number;
  powerUpsCollected: number;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  maxEntries: number;
  version: string;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  skin: 'neon' | 'fire' | 'ice' | 'rainbow' | 'gold' | 'shadow' | 'crystal';
  version: string;
}

export interface ShopData {
  ownedSkins: ('neon' | 'fire' | 'ice' | 'rainbow' | 'gold' | 'shadow' | 'crystal')[];
  coinBalance: number;
  totalCoinsEarned: number;
  version: string;
}

export interface SkinPrice {
  skin: 'neon' | 'fire' | 'ice' | 'rainbow' | 'gold' | 'shadow' | 'crystal';
  price: number;
  owned: boolean;
}

export interface StorageStats {
  used: number;
  quota: number | null;
  percentage: number;
}

const STORAGE_VERSION = '1.1';
const MAX_LEADERBOARD_ENTRIES = 10;

// Storage key constants
const LEADERBOARD_KEY = 'endlessRunnerLeaderboard';
const SETTINGS_KEY = 'endlessRunnerSettings';
const HIGH_SCORE_KEY = 'endlessRunnerHighScore';
const SHOP_KEY = 'endlessRunnerShop';

/**
 * Get storage statistics
 */
export function getStorageStats(): StorageStats {
  try {
    if (typeof localStorage !== 'undefined') {
      const used = JSON.stringify(localStorage).length;
      let quota = null;
      
      // Try to estimate quota (varies by browser)
      try {
        const testKey = '__storage_test__';
        let testSize = 1024; // 1KB
        let testData = 'x'.repeat(testSize);
        
        while (true) {
          try {
            localStorage.setItem(testKey, testData);
            testSize *= 2;
            testData = 'x'.repeat(testSize);
          } catch (e) {
            quota = testSize / 2;
            break;
          }
        }
        
        localStorage.removeItem(testKey);
      } catch (e) {
        // Quota estimation failed
      }
      
      return {
        used,
        quota,
        percentage: quota ? Math.round((used / quota) * 100) : 0
      };
    }
  } catch (error) {
    console.error('Failed to get storage stats:', error);
  }
  
  return { used: 0, quota: null, percentage: 0 };
}

/**
 * Check if storage is available and writable
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate leaderboard data structure
 */
export function validateLeaderboard(leaderboard: any): leaderboard is Leaderboard {
  if (!leaderboard || typeof leaderboard !== 'object') return false;
  if (!Array.isArray(leaderboard.entries)) return false;
  if (typeof leaderboard.maxEntries !== 'number') return false;
  if (typeof leaderboard.version !== 'string') return false;
  
  // Validate each entry
  for (const entry of leaderboard.entries) {
    if (typeof entry.score !== 'number') return false;
    if (typeof entry.date !== 'string') return false;
  if (!['easy', 'medium', 'hard'].includes(entry.difficulty)) return false;
    if (!['neon', 'fire', 'ice', 'rainbow', 'gold', 'shadow', 'crystal'].includes(entry.skin)) return false;
    if (typeof entry.playTime !== 'number') return false;
    if (typeof entry.obstaclesDodged !== 'number') return false;
    if (typeof entry.powerUpsCollected !== 'number') return false;
  }
  
  return true;
}

/**
 * Validate game settings data structure
 */
export function validateSettings(settings: any): settings is GameSettings {
  if (!settings || typeof settings !== 'object') return false;
  if (typeof settings.musicVolume !== 'number') return false;
  if (typeof settings.sfxVolume !== 'number') return false;
  if (typeof settings.musicEnabled !== 'boolean') return false;
  if (typeof settings.sfxEnabled !== 'boolean') return false;
  if (!['easy', 'medium', 'hard'].includes(settings.difficulty)) return false;
  if (!['neon', 'fire', 'ice', 'rainbow', 'gold', 'shadow', 'crystal'].includes(settings.skin)) return false;
  if (typeof settings.version !== 'string') return false;
  
  return true;
}

/**
 * Validate shop data structure
 */
export function validateShopData(shopData: any): shopData is ShopData {
  if (!shopData || typeof shopData !== 'object') return false;
  if (!Array.isArray(shopData.ownedSkins)) return false;
  if (typeof shopData.coinBalance !== 'number') return false;
  if (typeof shopData.totalCoinsEarned !== 'number') return false;
  if (typeof shopData.version !== 'string') return false;
  
  // Validate owned skins
  const validSkins = ['neon', 'fire', 'ice', 'rainbow', 'gold', 'shadow', 'crystal'];
  for (const skin of shopData.ownedSkins) {
    if (!validSkins.includes(skin)) return false;
  }
  
  return true;
}

/**
 * Load leaderboard with error handling and data validation
 */
export function loadLeaderboard(): Leaderboard {
  if (!isStorageAvailable()) {
    return createDefaultLeaderboard();
  }
  
  try {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Validate and migrate if needed
      if (validateLeaderboard(parsed)) {
        // Handle version upgrades
        if (parsed.version !== STORAGE_VERSION) {
          return migrateLeaderboard(parsed);
        }
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load leaderboard, creating new one:', error);
  }
  
  return createDefaultLeaderboard();
}

/**
 * Save leaderboard with error handling
 */
export function saveLeaderboard(leaderboard: Leaderboard): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    // Validate before saving
    if (!validateLeaderboard(leaderboard)) {
      console.error('Invalid leaderboard data, cannot save');
      return false;
    }
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
    return true;
  } catch (error) {
    console.error('Failed to save leaderboard:', error);
    
    // Try to clean up and save again
    try {
      const stats = getStorageStats();
      if (stats.percentage > 90) {
        console.warn('Storage quota nearly full, attempting cleanup');
        cleanupStorage();
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        return true;
      }
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    }
    
    return false;
  }
}

/**
 * Load game settings with error handling and data validation
 */
export function loadSettings(): GameSettings {
  if (!isStorageAvailable()) {
    return createDefaultSettings();
  }
  
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Validate and migrate if needed
      if (validateSettings(parsed)) {
        // Handle version upgrades
        if (parsed.version !== STORAGE_VERSION) {
          return migrateSettings(parsed);
        }
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load settings, creating new ones:', error);
  }
  
  return createDefaultSettings();
}

/**
 * Save game settings with error handling
 */
export function saveSettings(settings: GameSettings): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    // Validate before saving
    if (!validateSettings(settings)) {
      console.error('Invalid settings data, cannot save');
      return false;
    }
    
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    
    // Try to clean up and save again
    try {
      const stats = getStorageStats();
      if (stats.percentage > 90) {
        console.warn('Storage quota nearly full, attempting cleanup');
        cleanupStorage();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
      }
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    }
    
    return false;
  }
}

/**
 * Load high score (legacy support)
 */
export function loadHighScore(): number {
  if (!isStorageAvailable()) {
    return 0;
  }
  
  try {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) {
      return parseInt(saved) || 0;
    }
  } catch (error) {
    console.error('Failed to load high score:', error);
  }
  
  return 0;
}

/**
 * Save high score (legacy support)
 */
export function saveHighScore(score: number): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    return true;
  } catch (error) {
    console.error('Failed to save high score:', error);
    return false;
  }
}

/**
 * Load shop data with error handling and data validation
 */
export function loadShopData(): ShopData {
  if (!isStorageAvailable()) {
    return createDefaultShopData();
  }
  
  try {
    const saved = localStorage.getItem(SHOP_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Validate and migrate if needed
      if (validateShopData(parsed)) {
        // Handle version upgrades
        if (parsed.version !== STORAGE_VERSION) {
          return migrateShopData(parsed);
        }
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load shop data, creating new one:', error);
  }
  
  return createDefaultShopData();
}

/**
 * Save shop data with error handling
 */
export function saveShopData(shopData: ShopData): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    // Validate before saving
    if (!validateShopData(shopData)) {
      console.error('Invalid shop data, cannot save');
      return false;
    }
    
    localStorage.setItem(SHOP_KEY, JSON.stringify(shopData));
    return true;
  } catch (error) {
    console.error('Failed to save shop data:', error);
    
    // Try to clean up and save again
    try {
      const stats = getStorageStats();
      if (stats.percentage > 90) {
        console.warn('Storage quota nearly full, attempting cleanup');
        cleanupStorage();
        localStorage.setItem(SHOP_KEY, JSON.stringify(shopData));
        return true;
      }
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    }
    
    return false;
  }
}

/**
 * Create default leaderboard
 */
export function createDefaultLeaderboard(): Leaderboard {
  return {
    entries: [],
    maxEntries: MAX_LEADERBOARD_ENTRIES,
    version: STORAGE_VERSION
  };
}

/**
 * Create default settings
 */
export function createDefaultSettings(): GameSettings {
  return {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    musicEnabled: true,
    sfxEnabled: true,
    difficulty: 'medium',
    skin: 'neon',
    version: STORAGE_VERSION
  };
}

/**
 * Create default shop data
 */
export function createDefaultShopData(): ShopData {
  return {
    ownedSkins: ['neon'], // Neon is free by default
    coinBalance: 0,
    totalCoinsEarned: 0,
    version: STORAGE_VERSION
  };
}

/**
 * Add entry to leaderboard
 */
export function addToLeaderboard(entry: Omit<LeaderboardEntry, 'date'>): Leaderboard {
  const leaderboard = loadLeaderboard();
  
  const newEntry: LeaderboardEntry = {
    ...entry,
    date: new Date().toISOString()
  };
  
  // Add new entry
  leaderboard.entries.push(newEntry);
  
  // Sort by score (descending)
  leaderboard.entries.sort((a, b) => b.score - a.score);
  
  // Keep only top entries
  if (leaderboard.entries.length > leaderboard.maxEntries) {
    leaderboard.entries = leaderboard.entries.slice(0, leaderboard.maxEntries);
  }
  
  // Save updated leaderboard
  saveLeaderboard(leaderboard);
  
  return leaderboard;
}

/**
 * Migrate old leaderboard format
 */
export function migrateLeaderboard(oldLeaderboard: any): Leaderboard {
  console.log('Migrating leaderboard from old format');
  
  const newLeaderboard = createDefaultLeaderboard();
  
  if (Array.isArray(oldLeaderboard)) {
    // Old format was just an array of scores
    newLeaderboard.entries = oldLeaderboard
      .map((score: number, index: number) => ({
        score,
        date: new Date(Date.now() - index * 10000).toISOString(),
        difficulty: 'medium' as const,
        skin: 'neon' as const,
        playTime: 30 + Math.floor(Math.random() * 120),
        obstaclesDodged: 10 + Math.floor(Math.random() * 50),
        powerUpsCollected: 1 + Math.floor(Math.random() * 10)
      }))
      .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
      .slice(0, MAX_LEADERBOARD_ENTRIES);
  } else if (oldLeaderboard && Array.isArray(oldLeaderboard.entries)) {
    // Partial migration for semi-compatible formats
    newLeaderboard.entries = oldLeaderboard.entries
      .map((entry: any) => ({
        score: entry.score || 0,
        date: entry.date || new Date().toISOString(),
        difficulty: entry.difficulty || 'medium',
        skin: entry.skin || 'neon',
        playTime: entry.playTime || 30,
        obstaclesDodged: entry.obstaclesDodged || 10,
        powerUpsCollected: entry.powerUpsCollected || 1
      }))
      .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
      .slice(0, MAX_LEADERBOARD_ENTRIES);
  }
  
  return newLeaderboard;
}

/**
 * Migrate old settings format
 */
export function migrateSettings(oldSettings: any): GameSettings {
  console.log('Migrating settings from old format');
  
  const newSettings = createDefaultSettings();
  
  if (oldSettings) {
    if (typeof oldSettings.musicVolume === 'number') {
      newSettings.musicVolume = oldSettings.musicVolume;
    }
    if (typeof oldSettings.sfxVolume === 'number') {
      newSettings.sfxVolume = oldSettings.sfxVolume;
    }
    if (typeof oldSettings.musicEnabled === 'boolean') {
      newSettings.musicEnabled = oldSettings.musicEnabled;
    }
    if (typeof oldSettings.sfxEnabled === 'boolean') {
      newSettings.sfxEnabled = oldSettings.sfxEnabled;
    }
    if (oldSettings.difficulty && ['easy', 'medium', 'hard'].includes(oldSettings.difficulty)) {
      newSettings.difficulty = oldSettings.difficulty;
    }
    if (oldSettings.skin && ['neon', 'fire', 'ice', 'rainbow', 'gold', 'shadow', 'crystal'].includes(oldSettings.skin)) {
      newSettings.skin = oldSettings.skin;
    }
  }
  
  return newSettings;
}

/**
 * Migrate old shop data format
 */
export function migrateShopData(oldShopData: any): ShopData {
  console.log('Migrating shop data from old format');
  
  const newShopData = createDefaultShopData();
  
  if (oldShopData) {
    if (Array.isArray(oldShopData.ownedSkins)) {
      newShopData.ownedSkins = oldShopData.ownedSkins.filter((skin: any) => 
        ['neon', 'fire', 'ice', 'rainbow', 'gold', 'shadow', 'crystal'].includes(skin)
      );
    }
    if (typeof oldShopData.coinBalance === 'number') {
      newShopData.coinBalance = oldShopData.coinBalance;
    }
    if (typeof oldShopData.totalCoinsEarned === 'number') {
      newShopData.totalCoinsEarned = oldShopData.totalCoinsEarned;
    }
  }
  
  return newShopData;
}

/**
 * Clean up old or corrupted storage data
 */
export function cleanupStorage(): void {
  try {
    const keysToKeep = [LEADERBOARD_KEY, SETTINGS_KEY, HIGH_SCORE_KEY, SHOP_KEY];
    const allKeys: string[] = [];
    
    // Collect all keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }
    
    // Remove old keys
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Storage cleanup completed');
  } catch (error) {
    console.error('Storage cleanup failed:', error);
  }
}

/**
 * Clear all game data (for testing or reset)
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(HIGH_SCORE_KEY);
    localStorage.removeItem(SHOP_KEY);
    console.log('All game data cleared');
  } catch (error) {
    console.error('Failed to clear game data:', error);
  }
}

/**
 * Add coins to player balance
 */
export function addCoins(amount: number): boolean {
  if (amount <= 0) return false;
  
  const shopData = loadShopData();
  shopData.coinBalance += amount;
  shopData.totalCoinsEarned += amount;
  
  return saveShopData(shopData);
}

/**
 * Spend coins from player balance
 */
export function spendCoins(amount: number): boolean {
  if (amount <= 0) return false;
  
  const shopData = loadShopData();
  if (shopData.coinBalance < amount) return false;
  
  shopData.coinBalance -= amount;
  return saveShopData(shopData);
}

/**
 * Get current coin balance
 */
export function getCoinBalance(): number {
  const shopData = loadShopData();
  return shopData.coinBalance;
}

/**
 * Purchase a skin
 */
export function purchaseSkin(skin: 'neon' | 'fire' | 'ice' | 'rainbow' | 'gold' | 'shadow' | 'crystal', price: number): boolean {
  const shopData = loadShopData();
  
  // Check if already owned
  if (shopData.ownedSkins.includes(skin)) return false;
  
  // Check if enough coins
  if (shopData.coinBalance < price) return false;
  
  // Purchase
  shopData.coinBalance -= price;
  shopData.ownedSkins.push(skin);
  
  return saveShopData(shopData);
}

/**
 * Check if skin is owned
 */
export function isSkinOwned(skin: 'neon' | 'fire' | 'ice' | 'rainbow' | 'gold' | 'shadow' | 'crystal'): boolean {
  const shopData = loadShopData();
  return shopData.ownedSkins.includes(skin);
}

/**
 * Get all owned skins
 */
export function getOwnedSkins(): ('neon' | 'fire' | 'ice' | 'rainbow' | 'gold' | 'shadow' | 'crystal')[] {
  const shopData = loadShopData();
  return [...shopData.ownedSkins];
}

/**
 * Get skin prices
 */
export function getSkinPrices(): Record<string, number> {
  return {
    neon: 0,      // Free
    fire: 100,    // 100 coins
    ice: 150,     // 150 coins
    rainbow: 200, // 200 coins
    gold: 500,    // 500 coins (premium)
    shadow: 400,  // 400 coins (premium)
    crystal: 600  // 600 coins (premium)
  };
}