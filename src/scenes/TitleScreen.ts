import Phaser from 'phaser';
import { LevelManager } from '../LevelManager.js';
import * as utils from '../utils';

export class TitleScreen extends Phaser.Scene {
  // UI elements
  uiContainer!: Phaser.GameObjects.DOMElement;
  
  // Input controls - HTML event handlers
  keydownHandler?: (event: KeyboardEvent) => void;
  clickHandler?: (event: Event) => void;
  
  // Audio
  backgroundMusic!: Phaser.Sound.BaseSound;
  
  // State flags
  isStarting: boolean = false;

  constructor() {
    super({
      key: "TitleScreen",
    });
    this.isStarting = false;
  }

  init(): void {
    // Reset start flag
    this.isStarting = false;
  }

  create(): void {
    // Initialize sounds first
    this.initializeSounds();
    
    // Create DOM UI (includes background)
    this.createDOMUI();

    // Set up input controls
    this.setupInputs();

    // Play background music
    this.playBackgroundMusic();
    
    // Listen for scene shutdown to cleanup event listeners
    this.events.once('shutdown', () => {
      this.cleanupEventListeners();
    });
  }

  createDOMUI(): void {
    
    let uiHTML = `
      <div id="title-screen-container" class="fixed top-0 left-0 w-full h-full pointer-events-none z-[1000] font-retro flex flex-col justify-between items-center" style="image-rendering: pixelated; background-image: url('https://cdn-game-mcp.gambo.ai/7b6a4c8a-7770-4727-876c-335b12437334/images/halloween_labyrinth_background.png'); background-size: cover; background-position: center; background-repeat: no-repeat;">
        <!-- Main Content Container -->
        <div class="flex flex-col items-center space-y-10 justify-between pt-8 pb-16 w-full text-center pointer-events-auto h-full">
          
          <!-- Game Title Image Container -->
          <div id="game-title-container" class="flex-shrink-0 flex items-center justify-center">
            <img id="game-title-image" 
                 src="https://cdn-game-mcp.gambo.ai/c369ab4c-b44f-48aa-b712-a266807d6438/images/pumpkin_maze_game_title.png" 
                 alt="PUMP.KIN MAZE" 
                 class="max-h-[380px] mx-16 object-contain pointer-events-none"
                 style="filter: drop-shadow(6px 6px 12px rgba(0,0,0,0.9));" />
          </div>

          <!-- Game Description -->
          <div class="game-pixel-container-[#2D1810] p-4 max-w-2xl mx-4">
            <div class="text-orange-300 text-lg leading-relaxed">
              <div class="text-orange-400 font-bold mb-3 text-xl">🎃 Escape the Halloween Labyrinth! 🎃</div>
              <div class="text-sm">
                Help the pumpkin-masked boy navigate through a spooky maze!<br/>
                🪙 Collect all <strong class="text-orange-400">pump.fun tokens</strong> to win<br/>
                ⚔️ Battle <strong class="text-purple-400">shadow monsters</strong> with your candy stick<br/>
                👻 Don't let them catch you in the dark corners!
              </div>
            </div>
          </div>

          <!-- Press Enter Text -->
          <div id="press-enter-text" class="text-orange-300 font-bold pointer-events-none flex-shrink-0" style="
            font-size: 36px;
            text-shadow: 3px 3px 0px #8B4513, 5px 5px 10px rgba(0,0,0,0.8);
            animation: titleBlink 1.5s ease-in-out infinite alternate;
          ">🎮 PRESS ENTER TO START 🎮</div>

        </div>

        <!-- Custom Animations and Styles -->
        <style>
          @keyframes titleBlink {
            from { opacity: 0.4; }
            to { opacity: 1; }
          }
        </style>
      </div>
    `;

    // Add DOM element to the scene
    this.uiContainer = utils.initUIDom(this, uiHTML);
  }

  setupInputs(): void {
    // Add HTML event listeners for keyboard and mouse events
    const handleStart = (event: Event) => {
      event.preventDefault();
      this.startGame();
    };

    // Listen for Enter and Space key events on the document
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        this.startGame();
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    
    // Add click event to the UI container
    if (this.uiContainer && this.uiContainer.node) {
      this.uiContainer.node.addEventListener('click', handleStart);
    }

    // Store event listeners for cleanup
    this.keydownHandler = handleKeyDown;
    this.clickHandler = handleStart;
  }

  initializeSounds(): void {
    // Initialize background music
    this.backgroundMusic = this.sound.add("spooky_halloween_theme", {
      volume: 0.4,
      loop: true
    });
  }

  playBackgroundMusic(): void {
    // Play the initialized background music
    if (this.backgroundMusic) {
      this.backgroundMusic.play();
    }
  }

  startGame(): void {
    // Prevent multiple triggers
    if (this.isStarting) return;
    this.isStarting = true;

    // Clean up event listeners
    this.cleanupEventListeners();

    // Stop background music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    // Add transition effect
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    // Start first level after delay
    this.time.delayedCall(500, () => {
      const firstLevelScene = LevelManager.getFirstLevelScene();
      if (firstLevelScene) {
        this.scene.start(firstLevelScene);
      } else {
        console.error("No first level scene found in LEVEL_ORDER");
      }
    });
  }

  cleanupEventListeners(): void {
    // Remove HTML event listeners
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
    
    if (this.clickHandler && this.uiContainer && this.uiContainer.node) {
      this.uiContainer.node.removeEventListener('click', this.clickHandler);
    }
  }

  update(): void {
    // Title screen doesn't need special update logic
  }
}
