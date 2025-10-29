import Phaser from 'phaser';
import * as utils from '../utils';
import { LevelManager } from '../LevelManager.js';

export class VictoryUIScene extends Phaser.Scene {
  private currentLevelKey: string | null;
  private uiContainer: Phaser.GameObjects.DOMElement | null;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: "VictoryUIScene",
    });
    this.currentLevelKey = null;
    this.uiContainer = null;
  }

  init(data: { currentLevelKey?: string }) {
    // Receive data from level scene
    this.currentLevelKey = data.currentLevelKey || null;
  }

  create(): void {
    // Create DOM UI
    this.createDOMUI();
    // Setup input controls
    this.setupInputs();
  }

  createDOMUI(): void {
    const uiHTML = `
      <div id="victory-container" class="fixed top-0 left-0 w-full h-full pointer-events-none z-[1000] font-retro flex flex-col justify-center items-center bg-black bg-opacity-70">
        <!-- Main Content Container -->
        <div class="flex flex-col items-center justify-center gap-16 p-8 text-center pointer-events-auto">
          
          <!-- Victory Title -->
          <div id="victory-title" class="text-yellow-400 font-bold pointer-events-none" style="
            font-size: clamp(42px, 5rem, 64px);
            text-shadow: 3px 3px 0px #000000;
            animation: victoryPulse 1s ease-in-out infinite alternate;
          ">LEVEL COMPLETE!</div>

          <!-- Subtitle -->
          <div id="subtitle" class="text-white font-bold pointer-events-none" style="
            font-size: clamp(24px, 3rem, 36px);
            text-shadow: 2px 2px 0px #000000;
            line-height: 1.4;
          ">All enemies defeated!</div>

          <!-- Press Enter Text -->
          <div id="press-enter-text" class="text-green-400 font-bold pointer-events-none animate-pulse" style="
            font-size: clamp(24px, 3rem, 36px);
            text-shadow: 3px 3px 0px #000000;
            animation: blink 0.8s ease-in-out infinite alternate;
          ">PRESS ENTER FOR NEXT LEVEL</div>

        </div>

        <!-- Custom Animations -->
        <style>
          @keyframes victoryPulse {
            from { 
              transform: scale(1);
              filter: brightness(1);
            }
            to { 
              transform: scale(1.1);
              filter: brightness(1.2);
            }
          }
          
          @keyframes blink {
            from { opacity: 0.3; }
            to { opacity: 1; }
          }
        </style>
      </div>
    `;

    // Add DOM element to scene
    this.uiContainer = utils.initUIDom(this, uiHTML);
  }

  setupInputs(): void {
    // Clear previous event listeners
    this.input.off('pointerdown');
    
    // Create keyboard input
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Listen for mouse click events
    this.input.on('pointerdown', () => this.goToNextLevel());

    // Listen for key events
    this.enterKey.on('down', () => this.goToNextLevel());
    this.spaceKey.on('down', () => this.goToNextLevel());
  }

  goToNextLevel(): void {
    console.log(`Going to next level from: ${this.currentLevelKey}`);

    // Use LevelManager to get next level info
    const nextLevelKey = LevelManager.getNextLevelScene(this.currentLevelKey!);
    if (!nextLevelKey) {
      console.error(`No next level found for: ${this.currentLevelKey}`);
      return;
    }

    console.log(`Next level: ${nextLevelKey}`);

    // Get current level scene to stop background music
    const currentScene = this.scene.get(this.currentLevelKey!) as any;

    // Stop current level's background music
    if (currentScene.backgroundMusic) {
      currentScene.backgroundMusic.stop();
    }

    // Clear event listeners
    this.input.off('pointerdown');
    if (this.enterKey) {
      this.enterKey.off('down');
    }
    if (this.spaceKey) {
      this.spaceKey.off('down');
    }

    // Stop all game-related scenes
    this.scene.stop("UIScene");
    this.scene.stop(this.currentLevelKey!);
    
    // Start next level
    this.scene.start(nextLevelKey);
  }

  update(): void {
    // Victory UI scene doesn't need special update logic
  }
}
