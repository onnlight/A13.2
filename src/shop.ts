import { CubeSkin } from './player';
import { 
  getCoinBalance, 
  getOwnedSkins, 
  getSkinPrices, 
  purchaseSkin, 
  isSkinOwned,
  ShopData,
  loadShopData,
  saveShopData
} from './storage';

export class ShopUI {
  private shopElement: HTMLElement;
  private coinBalanceElement: HTMLElement;
  private skinsContainer: HTMLElement;
  private closeButton: HTMLElement;
  private isOpen: boolean = false;
  
  // Shop data
  private coinBalance: number = 0;
  private ownedSkins: CubeSkin[] = [];
  private skinPrices: Record<string, number> = {};
  
  constructor() {
    this.initializeElements();
    this.loadShopData();
    this.setupEventListeners();
  }
  
  private initializeElements(): void {
    this.shopElement = document.getElementById('shopMenu')!;
    this.coinBalanceElement = document.getElementById('coinBalance')!;
    this.skinsContainer = document.getElementById('skinsContainer')!;
    this.closeButton = document.getElementById('closeShopBtn')!;
    
    if (!this.shopElement) {
      console.warn('Shop menu element not found');
    }
  }
  
  private loadShopData(): void {
    const shopData = loadShopData();
    this.coinBalance = shopData.coinBalance;
    this.ownedSkins = shopData.ownedSkins;
    this.skinPrices = getSkinPrices();
    
    this.updateCoinDisplay();
  }
  
  private setupEventListeners(): void {
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }
    
    // Close shop when clicking outside
    if (this.shopElement) {
      this.shopElement.addEventListener('click', (e) => {
        if (e.target === this.shopElement) {
          this.close();
        }
      });
    }
    
    // Keyboard shortcut to open shop (S key)
    window.addEventListener('keydown', (e) => {
      if (e.key === 's' || e.key === 'S') {
        if (!this.isOpen) {
          this.open();
        }
      }
    });
  }
  
  public open(): void {
    if (this.isOpen || !this.shopElement) return;
    
    this.loadShopData();
    this.renderSkins();
    this.shopElement.style.display = 'flex';
    this.isOpen = true;
    
    // Pause game if playing
    const game = (window as any).game;
    if (game && game.gameState === 'playing') {
      game.pauseGame();
    }
  }
  
  public close(): void {
    if (!this.isOpen || !this.shopElement) return;
    
    this.shopElement.style.display = 'none';
    this.isOpen = false;
    
    // Resume game if it was paused by shop
    const game = (window as any).game;
    if (game && game.gameState === 'paused' && game.previousGameState === 'playing') {
      game.resumeGame();
    }
  }
  
  private updateCoinDisplay(): void {
    if (this.coinBalanceElement) {
      this.coinBalanceElement.textContent = this.coinBalance.toString();
    }
  }
  
  private renderSkins(): void {
    if (!this.skinsContainer) return;
    
    this.skinsContainer.innerHTML = '';
    
    const allSkins: CubeSkin[] = ['neon', 'fire', 'ice', 'rainbow', 'gold', 'shadow', 'crystal'];
    
    allSkins.forEach(skin => {
      const skinCard = this.createSkinCard(skin);
      this.skinsContainer.appendChild(skinCard);
    });
  }
  
  private createSkinCard(skin: CubeSkin): HTMLElement {
    const card = document.createElement('div');
    card.className = 'skin-card';
    
    const isOwned = this.ownedSkins.includes(skin);
    const price = this.skinPrices[skin];
    const canAfford = this.coinBalance >= price;
    
    // Skin preview
    const preview = document.createElement('div');
    preview.className = 'skin-preview';
    preview.style.backgroundColor = this.getSkinColor(skin);
    preview.style.boxShadow = `0 0 20px ${this.getSkinColor(skin)}`;
    
    // Skin name
    const name = document.createElement('h3');
    name.textContent = this.getSkinDisplayName(skin);
    name.className = 'skin-name';
    
    // Status/price
    const status = document.createElement('div');
    status.className = 'skin-status';
    
    if (isOwned) {
      status.textContent = 'OWNED';
      status.className += ' owned';
      card.className += ' owned';
    } else if (price === 0) {
      status.textContent = 'FREE';
      status.className += ' free';
      card.className += ' free';
    } else {
      status.textContent = `${price} COINS`;
      status.className += canAfford ? 'affordable' : 'expensive';
      card.className += canAfford ? 'affordable' : 'expensive';
    }
    
    // Action button
    const actionButton = document.createElement('button');
    actionButton.className = 'skin-action-btn';
    
    if (isOwned) {
      actionButton.textContent = 'EQUIP';
      actionButton.addEventListener('click', () => this.equipSkin(skin));
    } else if (price === 0) {
      actionButton.textContent = 'EQUIP';
      actionButton.addEventListener('click', () => this.equipSkin(skin));
    } else if (canAfford) {
      actionButton.textContent = 'BUY';
      actionButton.addEventListener('click', () => this.buySkin(skin, price));
    } else {
      actionButton.textContent = 'INSUFFICIENT';
      actionButton.disabled = true;
    }
    
    card.appendChild(preview);
    card.appendChild(name);
    card.appendChild(status);
    card.appendChild(actionButton);
    
    return card;
  }
  
  private getSkinColor(skin: CubeSkin): string {
    const colors = {
      neon: '#00ffff',
      fire: '#ff4500',
      ice: '#87ceeb',
      rainbow: '#ff00ff',
      gold: '#ffd700',
      shadow: '#2f2f2f',
      crystal: '#e0ffff'
    };
    return colors[skin];
  }
  
  private getSkinDisplayName(skin: CubeSkin): string {
    const names = {
      neon: 'Neon',
      fire: 'Fire',
      ice: 'Ice',
      rainbow: 'Rainbow',
      gold: 'Gold',
      shadow: 'Shadow',
      crystal: 'Crystal'
    };
    return names[skin];
  }
  
  private buySkin(skin: CubeSkin, price: number): void {
    if (purchaseSkin(skin, price)) {
      // Update local data
      this.ownedSkins.push(skin);
      this.coinBalance -= price;
      
      // Update display
      this.updateCoinDisplay();
      this.renderSkins();
      
      // Show success message
      this.showMessage(`Purchased ${this.getSkinDisplayName(skin)} skin!`, 'success');
      
      // Play purchase sound
      const game = (window as any).game;
      if (game && game.audioManager) {
        game.audioManager.playSound('purchase');
      }
    } else {
      this.showMessage('Failed to purchase skin', 'error');
    }
  }
  
  private equipSkin(skin: CubeSkin): void {
    const game = (window as any).game;
    if (game) {
      game.changeSkin(skin);
      this.showMessage(`Equipped ${this.getSkinDisplayName(skin)} skin!`, 'info');
      
      // Play equip sound
      if (game.audioManager) {
        game.audioManager.playSound('equip');
      }
    }
  }
  
  private showMessage(text: string, type: 'success' | 'error' | 'info'): void {
    const message = document.createElement('div');
    message.className = `shop-message ${type}`;
    message.textContent = text;
    
    if (this.shopElement) {
      this.shopElement.appendChild(message);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 3000);
    }
  }
  
  public refreshData(): void {
    this.loadShopData();
    if (this.isOpen) {
      this.renderSkins();
    }
  }
  
  public addCoins(amount: number): void {
    this.coinBalance += amount;
    this.updateCoinDisplay();
    
    if (this.isOpen) {
      this.renderSkins();
    }
  }
  
  public isOpened(): boolean {
    return this.isOpen;
  }
}