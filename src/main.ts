import * as THREE from 'three';
import { GameScene } from './scene';
import { Player, CubeSkin, PowerUpType } from './player';
import { ObstacleManager } from './obstacles';
import { AudioManager } from './audio';
import { ShopUI } from './shop';
import {
  loadSettings as loadStorageSettings,
  saveSettings as saveStorageSettings,
  GameSettings,
  loadLeaderboard,
  addToLeaderboard,
  LeaderboardEntry,
  addCoins,
  getCoinBalance
} from './storage';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'tutorial' | 'settings';

export class Game {
  private canvas: HTMLCanvasElement;
  private scene!: GameScene;
  private player!: Player;
  private obstacleManager!: ObstacleManager;
  private audioManager!: AudioManager;
  private shopUI!: ShopUI;
  
  private gameState: GameState;
  private previousGameState: GameState;
  private score: number;
  private highScore: number;
  private gameSpeed: number;
  private baseSpeed: number;
  private difficulty: Difficulty;
  private selectedSkin: CubeSkin;
  
  private lastTime: number;
  private gameTime: number;
  private scoreTimer: number;
  private isPaused: boolean = false;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;
  private savedGameState?: {
    score: number;
    gameTime: number;
    gameSpeed: number;
    playerPosition: { x: number; y: number; z: number };
    powerUps: any[];
  };
  
  // Input handling
  private keys: Set<string>;
  private touchStartX: number | null;
  private touchThreshold: number;
  
  // UI Elements
  private scoreElement!: HTMLElement;
  private finalScoreElement!: HTMLElement;
  private highScoreElement!: HTMLElement;
  private coinBalanceElement!: HTMLElement;
  private mainMenuElement!: HTMLElement;
  private gameOverMenuElement!: HTMLElement;
  private powerUpIndicatorElement!: HTMLElement;
  private leaderboardElement!: HTMLElement;
  private pauseMenuElement!: HTMLElement;
  private settingsMenuElement!: HTMLElement;
  private tutorialOverlayElement!: HTMLElement;
  private shopButtonElement!: HTMLElement;
  
  // Audio
  private musicEnabled: boolean;
  private sfxEnabled: boolean;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  
  // Game statistics for leaderboard
  private gameStartTime: number = 0;
  private obstaclesDodged: number = 0;
  private powerUpsCollected: number = 0;
  private coinsCollected: number = 0;
  
  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }
    
    this.gameState = 'menu';
    this.previousGameState = 'menu';
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.gameSpeed = 0.3;
    this.baseSpeed = 0.3;
    this.difficulty = 'medium';
    this.selectedSkin = 'neon';
    
    this.lastTime = 0;
    this.gameTime = 0;
    this.scoreTimer = 0;
    
    this.keys = new Set();
    this.touchStartX = null;
    this.touchThreshold = 50;
    
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    
    this.initializeGame();
    this.setupUI();
    this.setupEventListeners();
    this.loadSettings();
    
    // Initialize shop UI
    this.shopUI = new ShopUI();
    
    // Show main menu
    this.showMenu();
  }

  private initializeGame(): void {
    // Create audio manager first
    this.audioManager = new AudioManager();
    
    // Create game scene
    this.scene = new GameScene(this.canvas);
    
    // Add audio listener to camera
    this.scene.camera.add(this.audioManager.getListener());
    
    // Create player
    this.player = new Player(this.selectedSkin);
    this.scene.scene.add(this.player.mesh);
    
    // Create obstacle manager
    this.obstacleManager = new ObstacleManager(this.scene.scene);
    this.obstacleManager.setDifficulty(this.difficulty);
    
    // Load essential sounds
    this.loadEssentialSounds();
  }

  private setupUI(): void {
    // Get UI elements
    this.scoreElement = document.getElementById('score')!;
    this.finalScoreElement = document.getElementById('finalScore')!;
    this.highScoreElement = document.getElementById('highScore')!;
    this.coinBalanceElement = document.getElementById('coinBalance')!;
    this.mainMenuElement = document.getElementById('mainMenu')!;
    this.gameOverMenuElement = document.getElementById('gameOverMenu')!;
    this.powerUpIndicatorElement = document.getElementById('powerUpIndicator')!;
    this.leaderboardElement = document.getElementById('leaderboard')!;
    this.pauseMenuElement = document.getElementById('pauseMenu')!;
    this.settingsMenuElement = document.getElementById('settingsMenu')!;
    this.tutorialOverlayElement = document.getElementById('tutorialOverlay')!;
    this.shopButtonElement = document.getElementById('shopBtn')!;
    
    // Update displays
    this.highScoreElement.textContent = this.highScore.toString();
    this.updateCoinBalanceDisplay();
    
    // Initialize pause menu (hidden by default)
    if (this.pauseMenuElement) {
      this.pauseMenuElement.style.display = 'none';
    }
    
    // Initialize settings menu (hidden by default)
    if (this.settingsMenuElement) {
      this.settingsMenuElement.style.display = 'none';
    }
    
    // Initialize tutorial overlay (hidden by default)
    if (this.tutorialOverlayElement) {
      this.tutorialOverlayElement.style.display = 'none';
    }
    
    // Setup shop button
    if (this.shopButtonElement) {
      this.shopButtonElement.addEventListener('click', () => {
        this.shopUI.open();
      });
    }
  }

  private setupEventListeners(): void {
    // Keyboard controls
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Touch controls
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Mouse controls for touch buttons
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const homeBtn = document.getElementById('homeBtn');
    
    if (leftBtn) {
      leftBtn.addEventListener('click', () => this.handleMove('left'));
    }
    if (rightBtn) {
      rightBtn.addEventListener('click', () => this.handleMove('right'));
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (this.gameState === 'playing') {
          this.pauseGame();
        } else if (this.gameState === 'paused') {
          this.resumeGame();
        }
      });
    }
    if (homeBtn) {
      homeBtn.addEventListener('click', () => this.goToMainMenu());
    }
    
    // Menu buttons
    this.setupMenuButtons();
    
    // Pause and navigation buttons
     this.setupNavigationButtons();
      
     // Audio controls
     this.setupAudioControls();
      
     // Settings menu
     this.setupSettingsMenu();
   }

  private setupNavigationButtons(): void {
    // Game over navigation buttons
    const homeBtnGameOver = document.getElementById('homeBtnGameOver');
    const restartBtnPause = document.getElementById('restartBtnPause');
    const homeBtnPause = document.getElementById('homeBtnPause');
    const settingsBtnPause = document.getElementById('settingsBtnPause');
    const resumeBtn = document.getElementById('resumeBtn');
    const closeTutorialBtn = document.getElementById('closeTutorialBtn');
    
    if (homeBtnGameOver) {
      homeBtnGameOver.addEventListener('click', () => {
        this.audioManager.playSound('menu');
        this.goToMainMenu();
      });
    }
    
    if (restartBtnPause) {
      restartBtnPause.addEventListener('click', () => {
        this.audioManager.playSound('menu');
        this.startGame();
      });
    }
    
    if (homeBtnPause) {
      homeBtnPause.addEventListener('click', () => {
        this.audioManager.playSound('menu');
        this.goToMainMenu();
      });
    }
    
    if (settingsBtnPause) {
      settingsBtnPause.addEventListener('click', () => {
        this.audioManager.playSound('menu');
        this.showSettings();
      });
    }
    
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        this.audioManager.playSound('menu');
        this.resumeGame();
      });
    }
    
    if (closeTutorialBtn) {
      closeTutorialBtn.addEventListener('click', () => {
        this.audioManager.playSound('menu');
        this.hideTutorial();
      });
    }
  }

  private setupMenuButtons(): void {
    // Play button
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.audioManager.playSound('menu');
        this.startGame();
      });
    }
    
    // Restart button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.audioManager.playSound('menu');
        this.startGame();
      });
    }
    
    // Skin selection
    const skinButtons = document.querySelectorAll('[data-skin]');
    skinButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const skin = (e.target as HTMLElement).dataset.skin as CubeSkin;
        this.audioManager.playSound('menu');
        this.selectSkin(skin);
      });
    });
    
    // Difficulty selection
    const difficultyButtons = document.querySelectorAll('[data-difficulty]');
    difficultyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const difficulty = (e.target as HTMLElement).dataset.difficulty as Difficulty;
        this.audioManager.playSound('menu');
        this.selectDifficulty(difficulty);
      });
    });
  }

   private setupAudioControls(): void {
     const musicToggle = document.getElementById('musicToggle');
     const sfxToggle = document.getElementById('sfxToggle');
     
     if (musicToggle) {
       musicToggle.addEventListener('click', () => {
         this.musicEnabled = !this.musicEnabled;
         this.audioManager.toggleMusic(this.musicEnabled);
         musicToggle.textContent = `Music: ${this.musicEnabled ? 'ON' : 'OFF'}`;
       });
     }
     
     if (sfxToggle) {
       sfxToggle.addEventListener('click', () => {
         this.sfxEnabled = !this.sfxEnabled;
         this.audioManager.toggleSfx(this.sfxEnabled);
         sfxToggle.textContent = `SFX: ${this.sfxEnabled ? 'ON' : 'OFF'}`;
       });
     }
   }
   
   private setupSettingsMenu(): void {
     // Get settings elements
     const musicVolumeSlider = document.getElementById('musicVolume') as HTMLInputElement;
     const sfxVolumeSlider = document.getElementById('sfxVolume') as HTMLInputElement;
     const musicVolumeValue = document.getElementById('musicVolumeValue');
     const sfxVolumeValue = document.getElementById('sfxVolumeValue');
     const musicToggle = document.getElementById('musicToggle') as HTMLInputElement;
     const sfxToggle = document.getElementById('sfxToggle') as HTMLInputElement;
     const difficultySelect = document.getElementById('difficulty') as HTMLSelectElement;
     const skinSelect = document.getElementById('skin') as HTMLSelectElement;
     const saveSettingsBtn = document.getElementById('saveSettingsBtn');
     const closeSettingsBtn = document.getElementById('closeSettingsBtn');
     const leaderboardBtn = document.getElementById('leaderboardBtn');
     
     // Initialize values from current settings
     if (musicVolumeSlider) musicVolumeSlider.value = this.musicVolume.toString();
     if (sfxVolumeSlider) sfxVolumeSlider.value = this.sfxVolume.toString();
     if (musicVolumeValue) musicVolumeValue.textContent = `${Math.round(this.musicVolume * 100)}%`;
     if (sfxVolumeValue) sfxVolumeValue.textContent = `${Math.round(this.sfxVolume * 100)}%`;
     if (musicToggle) musicToggle.checked = this.musicEnabled;
     if (sfxToggle) sfxToggle.checked = this.sfxEnabled;
     if (difficultySelect) difficultySelect.value = this.difficulty;
     if (skinSelect) skinSelect.value = this.selectedSkin;
     
     // Add event listeners
     if (musicVolumeSlider) {
       musicVolumeSlider.addEventListener('input', () => {
         const volume = parseFloat(musicVolumeSlider.value);
         this.musicVolume = volume;
         this.audioManager.setMusicVolume(volume);
         if (musicVolumeValue) musicVolumeValue.textContent = `${Math.round(volume * 100)}%`;
       });
     }
     
      if (sfxVolumeSlider) {
        sfxVolumeSlider.addEventListener('input', () => {
          const volume = parseFloat(sfxVolumeSlider.value);
          this.sfxVolume = volume;
          this.audioManager.setSFXVolume(volume);
         if (sfxVolumeValue) sfxVolumeValue.textContent = `${Math.round(volume * 100)}%`;
       });
     }
     
     if (musicToggle) {
       musicToggle.addEventListener('change', () => {
         this.musicEnabled = musicToggle.checked;
         this.audioManager.toggleMusic(musicToggle.checked);
       });
     }
     
     if (sfxToggle) {
       sfxToggle.addEventListener('change', () => {
         this.sfxEnabled = sfxToggle.checked;
         this.audioManager.toggleSfx(sfxToggle.checked);
       });
     }
     
     if (difficultySelect) {
       difficultySelect.addEventListener('change', () => {
         this.difficulty = difficultySelect.value as Difficulty;
         if (this.obstacleManager) {
           this.obstacleManager.setDifficulty(this.difficulty);
         }
       });
     }
     
      if (skinSelect) {
        skinSelect.addEventListener('change', () => {
          this.selectedSkin = skinSelect.value as CubeSkin;
          if (this.player) {
            this.player.changeSkin(this.selectedSkin);
          }
        });
      }
     
     if (saveSettingsBtn) {
       saveSettingsBtn.addEventListener('click', () => {
         this.saveSettings();
         this.audioManager.playSound('menu');
         this.hideSettings();
       });
     }
     
     if (closeSettingsBtn) {
       closeSettingsBtn.addEventListener('click', () => {
         this.audioManager.playSound('menu');
         this.hideSettings();
       });
     }
     
      if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
          this.audioManager.playSound('menu');
          this.toggleLeaderboard();
        });
      }

      this.setupFeedbackModal();
      this.setupGitHubLinks();
    }

    private setupFeedbackModal(): void {
      const feedbackBtn = document.getElementById('feedbackBtn');
      const feedbackModal = document.getElementById('feedbackModal');
      const closeFeedbackBtn = document.getElementById('closeFeedbackBtn');
      const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
      const openGithubBtn = document.getElementById('openGithubBtn');
      const feedbackMessage = document.getElementById('feedbackMessage') as HTMLTextAreaElement;
      const feedbackCharCount = document.getElementById('feedbackCharCount');
      const feedbackTypeBtns = document.querySelectorAll('.feedback-type-btn');

      let selectedFeedbackType = 'suggestion';

      feedbackTypeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          feedbackTypeBtns.forEach(b => b.classList.remove('selected'));
          (e.target as HTMLElement).classList.add('selected');
          selectedFeedbackType = (e.target as HTMLElement).dataset.type || 'suggestion';
        });
      });

      if (feedbackMessage && feedbackCharCount) {
        feedbackMessage.addEventListener('input', () => {
          feedbackCharCount.textContent = feedbackMessage.value.length.toString();
        });
      }

      if (feedbackBtn && feedbackModal) {
        feedbackBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.audioManager.playSound('menu');
          this.hideAllMenus();
          feedbackModal.style.display = 'block';
          this.gameState = 'settings';
        });
      }

      if (closeFeedbackBtn && feedbackModal) {
        closeFeedbackBtn.addEventListener('click', () => {
          this.audioManager.playSound('menu');
          feedbackModal.style.display = 'none';
          this.showMenu();
        });
      }

      if (submitFeedbackBtn) {
        submitFeedbackBtn.addEventListener('click', () => {
          this.submitFeedback(selectedFeedbackType);
        });
      }

      if (openGithubBtn) {
        openGithubBtn.addEventListener('click', () => {
          this.openGitHubIssues(selectedFeedbackType);
        });
      }
    }

    private submitFeedback(type: string): void {
      const feedbackMessage = document.getElementById('feedbackMessage') as HTMLTextAreaElement;
      const feedbackEmail = document.getElementById('feedbackEmail') as HTMLInputElement;
      const includeGameState = (document.getElementById('includeGameState') as HTMLInputElement).checked;

      if (!feedbackMessage || !feedbackMessage.value.trim()) {
        this.showToast('Please enter your feedback', 'info');
        return;
      }

      const feedbackTypeLabels: Record<string, string> = {
        'suggestion': '💡 Suggestion',
        'bug': '🐛 Bug Report',
        'idea': '🎨 New Feature Request',
        'other': '💬 Other'
      };

      let gameStateInfo = '';
      if (includeGameState) {
        gameStateInfo = `
---
### Game State Info:
- **Current Score**: ${this.score}
- **High Score**: ${this.highScore}
- **Coins**: ${getCoinBalance()}
- **Difficulty**: ${this.difficulty}
- **Skin**: ${this.selectedSkin}
- **Game State**: ${this.gameState}
- **User Agent**: ${navigator.userAgent}
`;
      }

      const emailInfo = feedbackEmail.value.trim() ? `\n- **Contact Email**: ${feedbackEmail.value.trim()}` : '';

      const formattedMessage = `### ${feedbackTypeLabels[type] || 'Feedback'}

${feedbackMessage.value.trim()}

${gameStateInfo}
- **Feedback Type**: ${feedbackTypeLabels[type] || type}${emailInfo}
- **Submitted via**: In-Game Feedback Form
`;

      navigator.clipboard.writeText(formattedMessage).then(() => {
        this.showToast('Feedback copied to clipboard! Paste it in GitHub Issues or Discussions', 'success');
        this.trackFeedbackSubmission();
        
        const feedbackModal = document.getElementById('feedbackModal');
        if (feedbackModal) {
          feedbackModal.style.display = 'none';
        }
        
        if (feedbackMessage) feedbackMessage.value = '';
        if (feedbackEmail) feedbackEmail.value = '';
        
        this.showMenu();
      }).catch(() => {
        this.showToast('Failed to copy to clipboard', 'info');
      });
    }

    private openGitHubIssues(type: string): void {
      const feedbackMessage = document.getElementById('feedbackMessage') as HTMLTextAreaElement;
      
      let issueTitle = '';
      let issueBody = '';
      
      switch(type) {
        case 'bug':
          issueTitle = '[Bug] ';
          issueBody = '**Bug Description:**\n\n**Steps to Reproduce:**\n1. \n2. \n3. \n\n**Expected Behavior:**\n\n**Actual Behavior:**\n';
          break;
        case 'idea':
          issueTitle = '[Feature Request] ';
          issueBody = '**Feature Description:**\n\n**Why this would be useful:**\n\n**Proposed Solution:**\n';
          break;
        default:
          issueTitle = '[Suggestion] ';
          issueBody = '**Suggestion:**\n\n**Reason:**\n';
      }

      if (feedbackMessage && feedbackMessage.value.trim()) {
        issueBody += `\n\n---\n${feedbackMessage.value.trim()}`;
      }

      const url = `https://github.com/onnlight/A13.2/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}`;
      window.open(url, '_blank');
      
      this.trackFeedbackSubmission();
      
      const feedbackModal = document.getElementById('feedbackModal');
      if (feedbackModal) {
        feedbackModal.style.display = 'none';
      }
      this.showMenu();
    }

    private trackFeedbackSubmission(): void {
      const count = parseInt(localStorage.getItem('feedbackCount') || '0');
      localStorage.setItem('feedbackCount', (count + 1).toString());
    }

    private setupGitHubLinks(): void {
      const githubIssuesBtn = document.getElementById('githubIssuesBtn');
      
      if (githubIssuesBtn) {
        githubIssuesBtn.addEventListener('click', () => {
          this.audioManager.playSound('menu');
          window.open('https://github.com/onnlight/A13.2/issues', '_blank');
        });
      }
    }

    private showToast(message: string, type: 'success' | 'info' = 'success'): void {
      const existingToast = document.querySelector('.toast');
      if (existingToast) {
        existingToast.remove();
      }

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    private showFeedback(): void {
      const feedbackModal = document.getElementById('feedbackModal');
      if (feedbackModal) {
        this.hideAllMenus();
        feedbackModal.style.display = 'block';
        this.gameState = 'settings';
      }
    }

    private handleKeyDown(e: KeyboardEvent): void {
    // Handle global shortcuts first
    if (e.key === 'Escape' || e.key === 'ESC') {
      if (this.gameState === 'playing') {
        this.pauseGame();
      } else if (this.gameState === 'paused') {
        this.resumeGame();
      }
      return;
    }
    
    if (e.key === 'p' || e.key === 'P') {
      if (this.gameState === 'playing') {
        this.pauseGame();
      } else if (this.gameState === 'paused') {
        this.resumeGame();
      } else {
        // Debug key for power-up status
        this.player.debugPowerUpStatus();
      }
      return;
    }
    
    if (e.key === 'h' || e.key === 'H') {
      this.goToMainMenu();
      return;
    }
    
    if (e.key === 'r' || e.key === 'R') {
      if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'gameover') {
        this.startGame();
      }
      return;
    }
    
    if (e.key === 't' || e.key === 'T') {
      this.showTutorial();
      return;
    }
    
    if (e.key === 's' || e.key === 'S') {
      this.showSettings();
      return;
    }
    
    if (e.key === 'f' || e.key === 'F') {
      this.showFeedback();
      return;
    }
    
    if (this.gameState !== 'playing') return;
    
    this.keys.add(e.key.toLowerCase());
    
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.handleMove('left');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.handleMove('right');
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.key.toLowerCase());
  }

  private handleTouchStart(e: TouchEvent): void {
    if (this.gameState !== 'playing') return;
    
    e.preventDefault();
    this.touchStartX = e.touches[0].clientX;
  }

  private handleTouchMove(e: TouchEvent): void {
    if (this.gameState !== 'playing' || this.touchStartX === null) return;
    
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - this.touchStartX;
    
    if (Math.abs(diff) > this.touchThreshold) {
      if (diff > 0) {
        this.handleMove('right');
      } else {
        this.handleMove('left');
      }
      this.touchStartX = currentX;
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    this.touchStartX = null;
  }

  private handleMove(direction: 'left' | 'right'): void {
    if (this.gameState !== 'playing') return;
    
    if (direction === 'left') {
      this.player.moveLeft();
    } else {
      this.player.moveRight();
    }
    
    // Play movement sound
    this.audioManager.playSound('jump');
    
    // Add visual feedback
    this.addMoveFeedback(direction);
  }

  private addMoveFeedback(direction: 'left' | 'right'): void {
    // Create a brief visual effect for movement feedback
    const originalScale = this.player.mesh.scale.x;
    const targetScale = direction === 'left' ? 0.8 : 1.2;
    
    // Quick scale animation
    let scaleTime = 0;
    const animateScale = () => {
      scaleTime += 0.1;
      if (scaleTime < 1) {
        this.player.mesh.scale.x = THREE.MathUtils.lerp(targetScale, originalScale, scaleTime);
        requestAnimationFrame(animateScale);
      } else {
        this.player.mesh.scale.x = originalScale;
      }
    };
    animateScale();
  }

  private selectSkin(skin: CubeSkin): void {
    this.selectedSkin = skin;
    this.player.changeSkin(skin);
    
    // Update UI
    const skinButtons = document.querySelectorAll('[data-skin]');
    skinButtons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.getAttribute('data-skin') === skin) {
        btn.classList.add('selected');
      }
    });
    
    this.saveSettings();
  }

  private selectDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.obstacleManager.setDifficulty(difficulty);
    
    // Update base speed based on difficulty
    switch (difficulty) {
      case 'easy':
        this.baseSpeed = 0.2;
        break;
      case 'medium':
        this.baseSpeed = 0.3;
        break;
      case 'hard':
        this.baseSpeed = 0.4;
        break;
    }
    
    // Update UI
    const difficultyButtons = document.querySelectorAll('[data-difficulty]');
    difficultyButtons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.getAttribute('data-difficulty') === difficulty) {
        btn.classList.add('selected');
      }
    });
    
    this.saveSettings();
  }

  private startGame(): void {
    // Reset pause state
    this.isPaused = false;
    this.totalPausedTime = 0;
    this.pauseStartTime = 0;
    
     // Reset game state
    this.gameState = 'playing';
    this.previousGameState = 'playing';
    this.score = 0;
    this.gameSpeed = this.baseSpeed;
    this.gameTime = 0;
    this.scoreTimer = 0;
    
    // Reset game statistics
    this.gameStartTime = Date.now();
    this.obstaclesDodged = 0;
    this.powerUpsCollected = 0;
    this.coinsCollected = 0;
    
    // Reset player
    this.player.reset();
    this.player.changeSkin(this.selectedSkin);
    
    // Reset obstacles
    this.obstacleManager.reset();
    this.obstacleManager.setDifficulty(this.difficulty);
    this.obstacleManager.setMagnetActive(false);
    
    // Hide all menus
    this.hideAllMenus();
    
    // Reset UI
    this.updateScore();
    this.updateCoinBalanceDisplay();
    this.hidePowerUpIndicator();
    
    // Resume audio context and start background music
    this.audioManager.resumeAudioContext();
    this.audioManager.playBackgroundMusic();
    
    // Clear saved game state
    this.savedGameState = undefined;
    localStorage.removeItem('savedGameState');
    
    // Start game loop
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop(): void {
    if (this.gameState !== 'playing') return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Update game time (excluding pause time)
    if (!this.isPaused) {
      this.gameTime += deltaTime;
    }
    
    // Update game speed (gradually increase)
    this.gameSpeed = this.baseSpeed + (this.gameTime / 10000) * 0.1;
    
    // Track game statistics
    if (!this.isPaused && this.gameState === 'playing') {
      // Count obstacles dodged (based on obstacles passed)
      const obstaclesPassed = this.obstacleManager.getObstaclesPassed();
      if (obstaclesPassed > this.obstaclesDodged) {
        this.obstaclesDodged = obstaclesPassed;
      }
      
      // Count power-ups collected
      const powerUpsCollected = this.obstacleManager.getPowerUpsCollected();
      if (powerUpsCollected > this.powerUpsCollected) {
        this.powerUpsCollected = powerUpsCollected;
      }
    }
    
    // Update player
    this.player.update(deltaTime);
    
    // Update obstacles (pass player position for magnet effect)
    this.obstacleManager.update(deltaTime, this.gameSpeed, this.player.position);
    
    // Check collisions
    const collisions = this.obstacleManager.checkCollisions(this.player.boundingBox);
    
    if (collisions.obstacleCollision && !this.player.isInvincible()) {
      console.log('Collision detected! Player is not invincible.');
      // Play collision sound
      this.audioManager.playSound('collision');
      this.gameOver();
      return;
    } else if (collisions.obstacleCollision && this.player.isInvincible()) {
      console.log('Collision detected but player is invincible - continuing game');
    }
    
    // Handle power-up collection
    if (collisions.powerUpCollected) {
      // Play collection sound
      this.audioManager.playSound('collect');
      this.handlePowerUpCollection(collisions.powerUpCollected);
    }
    
    // Handle coin collection
    if (collisions.coinsCollected > 0) {
      // Play coin sound
      this.audioManager.playSound('coin');
      this.handleCoinCollection(collisions.coinsCollected);
    }
    
    // Update score
    this.scoreTimer += deltaTime;
    if (this.scoreTimer > 100) { // Update score every 100ms
      this.updateScore();
      this.scoreTimer = 0;
    }
    
    // Apply slow motion effect if active
    const slowMotionFactor = this.player.getSlowMotionFactor();
    const adjustedGameSpeed = this.gameSpeed * slowMotionFactor;
    
    // Update scene
    this.scene.updateRoad(adjustedGameSpeed);
    this.scene.updateCameraToPlayer(this.player.position);
    
    // Change theme based on score
    const themeIndex = Math.floor(this.score / 1000) % 4;
    this.scene.changeTheme(themeIndex);
    
    // Update power-up indicator
    this.updatePowerUpIndicator();
    
    // Render
    this.scene.render();
    
    // Continue game loop
    requestAnimationFrame(() => this.gameLoop());
  }

  private handlePowerUpCollection(powerUpType: 'speed' | 'shield' | 'multiplier' | 'magnet' | 'slowmotion'): void {
    console.log(`Power-up collected: ${powerUpType}`);
    
    this.player.addPowerUp(powerUpType as PowerUpType);
    this.showPowerUpIndicator(powerUpType);
    
    // Special handling for magnet power-up
    if (powerUpType === 'magnet') {
      this.obstacleManager.setMagnetActive(true);
    }
    
    // Play power-up sound effect
    this.audioManager.playSound('powerup');
  }

  private handleCoinCollection(amount: number): void {
    console.log(`Coins collected: ${amount}`);
    
    // Add coins to storage
    addCoins(amount);
    
    // Update local counter
    this.coinsCollected += amount;
    
    // Update UI
    this.updateCoinBalanceDisplay();
    
    // Update shop UI if open
    if (this.shopUI.isOpened()) {
      this.shopUI.addCoins(amount);
    }
  }

  private updateCoinBalanceDisplay(): void {
    if (this.coinBalanceElement) {
      this.coinBalanceElement.textContent = getCoinBalance().toString();
    }
  }

  private showPowerUpIndicator(type: string): void {
    this.powerUpIndicatorElement.style.display = 'block';
    this.powerUpIndicatorElement.textContent = `${type.toUpperCase()} ACTIVE!`;
    
    const duration = this.getPowerUpDuration(type as PowerUpType);
    setTimeout(() => {
      this.hidePowerUpIndicator();
    }, duration);
  }

  private getPowerUpDuration(type: PowerUpType): number {
    const durations: Record<PowerUpType, number> = {
      'speed': 3000,
      'shield': 5000,
      'multiplier': 10000,
      'magnet': 8000,
      'slowmotion': 6000
    };
    return durations[type] || 5000;
  }

  private hidePowerUpIndicator(): void {
    this.powerUpIndicatorElement.style.display = 'none';
  }

  private updatePowerUpIndicator(): void {
    const activePowerUps = [];
    
    if (this.player.hasActivePowerUp('speed')) {
      const remaining = Math.ceil(this.player.getRemainingPowerUpTime('speed') / 1000);
      activePowerUps.push(`SPEED ${remaining}s`);
    }
    
    if (this.player.hasActivePowerUp('shield')) {
      const remaining = Math.ceil(this.player.getRemainingPowerUpTime('shield') / 1000);
      activePowerUps.push(`SHIELD ${remaining}s`);
    }
    
    if (this.player.hasActivePowerUp('multiplier')) {
      const remaining = Math.ceil(this.player.getRemainingPowerUpTime('multiplier') / 1000);
      activePowerUps.push(`MULTIPLIER ${remaining}s`);
    }
    
    if (this.player.hasActivePowerUp('magnet')) {
      const remaining = Math.ceil(this.player.getRemainingPowerUpTime('magnet') / 1000);
      activePowerUps.push(`MAGNET ${remaining}s`);
    }
    
    if (this.player.hasActivePowerUp('slowmotion')) {
      const remaining = Math.ceil(this.player.getRemainingPowerUpTime('slowmotion') / 1000);
      activePowerUps.push(`SLOW-MO ${remaining}s`);
    }
    
    if (activePowerUps.length > 0) {
      this.powerUpIndicatorElement.style.display = 'block';
      this.powerUpIndicatorElement.textContent = activePowerUps.join(' | ');
    } else {
      this.hidePowerUpIndicator();
    }
  }

  private updateScore(): void {
    const multiplier = this.player.getScoreMultiplier();
    const points = Math.floor(this.gameSpeed * 10 * multiplier);
    this.score += points;
    this.scoreElement.textContent = this.score.toString();
  }

  private gameOver(): void {
    this.gameState = 'gameover';
    
    // Stop background music
    this.audioManager.stopBackgroundMusic();
    
    // Clear saved game state
    this.savedGameState = undefined;
    localStorage.removeItem('savedGameState');
    
    // Update high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    
    // Show game over menu
    this.finalScoreElement.textContent = this.score.toString();
    this.highScoreElement.textContent = this.highScore.toString();
    this.hideAllMenus();
    this.gameOverMenuElement.style.display = 'block';
    
    // Save score to leaderboard
    this.saveToLeaderboard();
    
    // Refresh shop UI to show updated coin balance
    this.shopUI.refreshData();
    
    // Play game over sound
    this.audioManager.playSound('gameover');
  }

  public showMenu(): void {
    this.gameState = 'menu';
    this.hideAllMenus();
    this.mainMenuElement.style.display = 'block';
    
    // Start background music for menu
    this.audioManager.playBackgroundMusic();
    
    // Show leaderboard if available
    this.updateLeaderboard();
  }

  private pauseGame(): void {
    if (this.gameState !== 'playing') return;
    
    this.previousGameState = 'playing';
    this.gameState = 'paused';
    this.isPaused = true;
    this.pauseStartTime = Date.now();
    
    // Save current game state
    this.saveGameState();
    
    // Mute sounds during pause
    this.audioManager.setSFXEnabled(false);
    
    // Show pause menu
    this.hideAllMenus();
    this.pauseMenuElement.style.display = 'block';
    
    // Play pause sound
    this.audioManager.playSound('menu');
    
    console.log('Game paused');
  }

  private resumeGame(): void {
    if (this.gameState !== 'paused') return;
    
    // Calculate total pause time
    if (this.pauseStartTime > 0) {
      this.totalPausedTime += Date.now() - this.pauseStartTime;
      this.pauseStartTime = 0;
    }
    
    this.gameState = this.previousGameState || 'playing';
    this.isPaused = false;
    
    // Restore SFX settings
    this.audioManager.setSFXEnabled(this.sfxEnabled);
    
    // Hide pause menu
    this.pauseMenuElement.style.display = 'none';
    
    // Play resume sound
    this.audioManager.playSound('menu');
    
    // Resume game loop
    if (this.gameState === 'playing') {
      this.lastTime = performance.now();
      this.gameLoop();
    }
    
    console.log('Game resumed');
  }

  private goToMainMenu(): void {
    // Stop background music
    this.audioManager.stopBackgroundMusic();
    
    // Clear saved game state
    this.savedGameState = undefined;
    localStorage.removeItem('savedGameState');
    
    // Show main menu
    this.showMenu();
  }

  private showTutorial(): void {
    this.gameState = 'tutorial';
    this.hideAllMenus();
    this.tutorialOverlayElement.style.display = 'block';
    
    console.log('Tutorial shown');
  }

  private hideTutorial(): void {
    this.tutorialOverlayElement.style.display = 'none';
    
    // Return to previous state
    if (this.previousGameState === 'playing') {
      this.gameState = 'playing';
      this.lastTime = performance.now();
      this.gameLoop();
    } else {
      this.showMenu();
    }
  }

  private showSettings(): void {
    this.gameState = 'settings';
    this.hideAllMenus();
    this.settingsMenuElement.style.display = 'block';
    
    // Populate settings
    this.populateSettingsMenu();
    
     console.log('Settings shown');
   }
   
   private hideSettings(): void {
     this.settingsMenuElement.style.display = 'none';
     this.gameState = this.previousGameState;
     console.log('Settings hidden');
   }
   
   private toggleLeaderboard(): void {
     const leaderboardElement = document.getElementById('leaderboard');
     if (leaderboardElement) {
       if (leaderboardElement.style.display === 'none') {
         leaderboardElement.style.display = 'block';
         this.updateLeaderboardDisplay();
       } else {
         leaderboardElement.style.display = 'none';
       }
     }
   }
   
   private updateLeaderboardDisplay(): void {
     const leaderboard = loadLeaderboard();
     const leaderboardList = document.getElementById('leaderboardList');
     
     if (!leaderboardList) return;
     
     // Clear existing entries
     leaderboardList.innerHTML = '';
     
     // Add new entries
     leaderboard.entries.forEach((entry, index) => {
       const entryElement = document.createElement('div');
       entryElement.className = 'leaderboard-entry';
       
       const date = new Date(entry.date);
       const dateString = date.toLocaleDateString();
       const timeString = date.toLocaleTimeString();
       
       entryElement.innerHTML = `
         <span>${index + 1}. ${entry.score} pts</span>
         <span>${entry.difficulty} - ${entry.skin}</span>
         <span>${dateString} ${timeString}</span>
       `;
       
       leaderboardList.appendChild(entryElement);
     });
   }
  
    private hideAllMenus(): void {
     this.mainMenuElement.style.display = 'none';
     this.gameOverMenuElement.style.display = 'none';
     this.pauseMenuElement.style.display = 'none';
     this.settingsMenuElement.style.display = 'none';
     this.tutorialOverlayElement.style.display = 'none';
     this.leaderboardElement.style.display = 'none';
     
     const feedbackModal = document.getElementById('feedbackModal');
     if (feedbackModal) {
       feedbackModal.style.display = 'none';
     }
   }

  private updateLeaderboard(): void {
    const scores = this.getLeaderboard();
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboardList && scores.length > 0) {
      leaderboardList.innerHTML = scores.slice(0, 5).map((entry, index) => `
        <div class="leaderboard-entry">
          <span>${index + 1}. Score: ${entry.score}</span>
          <span>${new Date(entry.date).toLocaleDateString()}</span>
        </div>
      `).join('');
      this.leaderboardElement.style.display = 'block';
    }
  }

  private loadEssentialSounds(): void {
    // Load commonly used sounds
    const essentialSounds = ['jump', 'collect', 'powerup', 'collision', 'gameover', 'background'];
    
    essentialSounds.forEach(soundName => {
      this.audioManager.loadSound(soundName);
    });
  }

  private loadSettings(): void {
    const settings = loadStorageSettings();
    
    this.musicEnabled = settings.musicEnabled;
    this.sfxEnabled = settings.sfxEnabled;
    this.musicVolume = settings.musicVolume;
    this.sfxVolume = settings.sfxVolume;
    this.selectedSkin = settings.skin;
    this.difficulty = settings.difficulty;
    
    // Update UI
    this.selectSkin(this.selectedSkin);
    this.selectDifficulty(this.difficulty);
    
    // Apply audio settings to audio manager
    this.audioManager.setMusicEnabled(this.musicEnabled);
    this.audioManager.setSFXEnabled(this.sfxEnabled);
    this.audioManager.setMusicVolume(this.musicVolume);
    this.audioManager.setSFXVolume(this.sfxVolume);
    
    const musicToggle = document.getElementById('musicToggle');
    const sfxToggle = document.getElementById('sfxToggle');
    
    if (musicToggle) {
      musicToggle.textContent = `Music: ${this.musicEnabled ? 'ON' : 'OFF'}`;
      musicToggle.classList.toggle('muted', !this.musicEnabled);
    }
    
    if (sfxToggle) {
      sfxToggle.textContent = `SFX: ${this.sfxEnabled ? 'ON' : 'OFF'}`;
      sfxToggle.classList.toggle('muted', !this.sfxEnabled);
    }
  }

  private saveSettings(): void {
    const settings: GameSettings = {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      difficulty: this.difficulty,
      skin: this.selectedSkin,
      version: '1.1'
    };
    saveStorageSettings(settings);
  }

  private loadHighScore(): number {
    const highScore = localStorage.getItem('highScore');
    return highScore ? parseInt(highScore) : 0;
  }

  private saveHighScore(): void {
    localStorage.setItem('highScore', this.highScore.toString());
  }

  public changeSkin(skin: CubeSkin): void {
    this.selectedSkin = skin;
    if (this.player) {
      this.player.changeSkin(skin);
    }
    this.saveSettings();
  }

  private saveToLeaderboard(): void {
    // Calculate game statistics
    const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    
    const entry: Omit<LeaderboardEntry, 'date'> = {
      score: this.score,
      difficulty: this.difficulty,
      skin: this.selectedSkin,
      playTime: playTime,
      obstaclesDodged: this.obstaclesDodged,
      powerUpsCollected: this.powerUpsCollected
    };
    
    addToLeaderboard(entry);
    this.updateLeaderboardDisplay();
  }

  private saveGameState(): void {
    this.savedGameState = {
      score: this.score,
      gameTime: this.gameTime,
      gameSpeed: this.gameSpeed,
      playerPosition: {
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z
      },
      powerUps: (this.player as any).powerUps.map((p: any) => ({
        type: p.type,
        startTime: p.startTime,
        duration: p.duration,
        value: p.value
      }))
    };
    
    localStorage.setItem('savedGameState', JSON.stringify(this.savedGameState));
    console.log('Game state saved');
  }

  public loadGameState(): boolean {
    const saved = localStorage.getItem('savedGameState');
    if (!saved) return false;
    
    try {
      this.savedGameState = JSON.parse(saved);
      return true;
    } catch (error) {
      console.error('Failed to load saved game state:', error);
      return false;
    }
  }

  public restoreGameState(): void {
    if (!this.savedGameState) return;
    
    // Restore game values
    this.score = this.savedGameState.score;
    this.gameTime = this.savedGameState.gameTime;
    this.gameSpeed = this.savedGameState.gameSpeed;
    
    // Restore player position and state
    this.player.position.x = this.savedGameState.playerPosition.x;
    this.player.position.y = this.savedGameState.playerPosition.y;
    this.player.position.z = this.savedGameState.playerPosition.z;
    
    // Restore power-ups
    (this.player as any).powerUps = this.savedGameState.powerUps.map((p: any) => ({
      type: p.type,
      startTime: p.startTime,
      duration: p.duration,
      value: p.value
    }));
    
    // Update UI
    this.updateScore();
    this.updatePowerUpIndicator();
    
    console.log('Game state restored');
  }

  private populateSettingsMenu(): void {
    if (!this.settingsMenuElement) return;
    
    // Create settings menu content
    this.settingsMenuElement.innerHTML = `
      <div class="menu-content">
        <h2>Settings</h2>
        
        <div class="setting-group">
          <label>Music Volume</label>
          <input type="range" id="musicVolume" min="0" max="100" value="${this.musicVolume * 100}">
          <span id="musicVolumeValue">${Math.round(this.musicVolume * 100)}%</span>
        </div>
        
        <div class="setting-group">
          <label>SFX Volume</label>
          <input type="range" id="sfxVolume" min="0" max="100" value="${this.sfxVolume * 100}">
          <span id="sfxVolumeValue">${Math.round(this.sfxVolume * 100)}%</span>
        </div>
        
        <div class="setting-group">
          <label>
            <input type="checkbox" id="musicEnabled" ${this.musicEnabled ? 'checked' : ''}>
            Enable Music
          </label>
        </div>
        
        <div class="setting-group">
          <label>
            <input type="checkbox" id="sfxEnabled" ${this.sfxEnabled ? 'checked' : ''}>
            Enable SFX
          </label>
        </div>
        
        <div class="setting-buttons">
          <button class="option-btn" onclick="game.applySettings()">Apply</button>
          <button class="option-btn" onclick="game.resetSettings()">Reset to Default</button>
          <button class="option-btn" onclick="game.hideSettings()">Close</button>
        </div>
      </div>
    `;
    
    // Make game instance available globally for button callbacks
    (window as any).game = this;
  }

  public applySettings(): void {
    const musicVolumeSlider = document.getElementById('musicVolume') as HTMLInputElement;
    const sfxVolumeSlider = document.getElementById('sfxVolume') as HTMLInputElement;
    const musicCheckbox = document.getElementById('musicEnabled') as HTMLInputElement;
    const sfxCheckbox = document.getElementById('sfxEnabled') as HTMLInputElement;
    
    if (musicVolumeSlider) {
      this.musicVolume = parseInt(musicVolumeSlider.value) / 100;
      this.audioManager.setMusicVolume(this.musicVolume);
    }
    
    if (sfxVolumeSlider) {
      this.sfxVolume = parseInt(sfxVolumeSlider.value) / 100;
      this.audioManager.setSFXVolume(this.sfxVolume);
    }
    
    if (musicCheckbox) {
      this.musicEnabled = musicCheckbox.checked;
      this.audioManager.setMusicEnabled(this.musicEnabled);
    }
    
    if (sfxCheckbox) {
      this.sfxEnabled = sfxCheckbox.checked;
      this.audioManager.setSFXEnabled(this.sfxEnabled);
    }
    
    this.saveSettings();
    this.updateAudioControlsUI();
    this.audioManager.playSound('menu');
    
    console.log('Settings applied');
  }

  public resetSettings(): void {
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    
    this.audioManager.setMusicVolume(this.musicVolume);
    this.audioManager.setSFXVolume(this.sfxVolume);
    this.audioManager.setMusicEnabled(this.musicEnabled);
    this.audioManager.setSFXEnabled(this.sfxEnabled);
    
    this.saveSettings();
    this.updateAudioControlsUI();
    this.populateSettingsMenu();
    this.audioManager.playSound('menu');
    
    console.log('Settings reset to default');
  }

  private updateAudioControlsUI(): void {
    const musicToggle = document.getElementById('musicToggle');
    const sfxToggle = document.getElementById('sfxToggle');
    
    if (musicToggle) {
      musicToggle.textContent = `Music: ${this.musicEnabled ? 'ON' : 'OFF'}`;
      musicToggle.classList.toggle('muted', !this.musicEnabled);
    }
    
    if (sfxToggle) {
      sfxToggle.textContent = `SFX: ${this.sfxEnabled ? 'ON' : 'OFF'}`;
      sfxToggle.classList.toggle('muted', !this.sfxEnabled);
    }
  }

  private getLeaderboard(): Array<{score: number, date: number, difficulty: string}> {
    const leaderboard = localStorage.getItem('leaderboard');
    return leaderboard ? JSON.parse(leaderboard) : [];
  }

  public dispose(): void {
    this.audioManager.dispose();
    this.player.dispose();
    this.obstacleManager.dispose();
    this.scene.dispose();
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  
  try {
    if (game.loadGameState()) {
      console.log('Saved game state found');
      game.restoreGameState();
    }
    game.showMenu();
  } catch (error) {
    console.error('Error loading saved game state:', error);
    game.showMenu();
  }
});