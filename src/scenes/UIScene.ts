import Phaser from "phaser";
import * as utils from "../utils";

export default class UIScene extends Phaser.Scene {
  private currentGameSceneKey: string | null;
  private uiContainer: Phaser.GameObjects.DOMElement | null;
  private guideTimer: Phaser.Time.TimerEvent | null;

  constructor() {
    super({
      key: "UIScene",
    });
    this.currentGameSceneKey = null;
    this.uiContainer = null;
    this.guideTimer = null;
  }
  
  init(data: { gameSceneKey?: string }) {
    // Receive current game scene key
    this.currentGameSceneKey = data.gameSceneKey || null;
  }

  create(): void {
    this.createDOMUI();
    this.setupGuideTimer();
  }

  createDOMUI(): void {
    const uiHTML = `
      <div id="halloween-ui-container" class="fixed top-0 left-0 w-full h-full pointer-events-none z-[1000] font-retro text-orange-400" style="image-rendering: pixelated;">
        
        <!-- Top UI Panel -->
        <div class="flex justify-between items-start p-6 w-full">
          
          <!-- Health Bar -->
          <div class="game-pixel-container-slot-gray-800 p-2 w-64">
            <div class="text-orange-300 text-sm mb-1 text-center font-bold">HEALTH</div>
            <div class="relative">
              <div id="health-fill" class="game-pixel-container-progress-fill-red-500 h-6 transition-all duration-300" style="width: 100%;"></div>
              <div id="health-text" class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">100/100</div>
            </div>
          </div>

          <!-- Token Counter -->
          <div class="game-pixel-container-[#8B4513] p-3 flex items-center space-x-3">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGRjk1MDAiIHN0cm9rZT0iI0Y5NzMxNiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xMiA2IDIgNi02IDItNi02IDYtMiAyLTZ6IiBmaWxsPSIjRkY3MTAwIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOEI0NTEzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QPC90ZXh0Pgo8L3N2Zz4K" alt="Token" class="w-6 h-6" />
            <div>
              <div class="text-orange-300 text-xs">TOKENS</div>
              <div id="token-count" class="text-white font-bold text-lg">0/8</div>
            </div>
          </div>

        </div>

        <!-- Instructions -->
        <div id="instructions-guide" class="absolute bottom-6 left-6 game-pixel-container-[#2D1810] p-3 max-w-md">
          <div class="text-orange-300 text-sm leading-relaxed">
            <div class="font-bold text-orange-400 mb-2">🎃 PUMP.KIN MAZE</div>
            <div>🏃 <strong>Arrow Keys:</strong> Move</div>
            <div>⚔️ <strong>Space:</strong> Attack with candy stick</div>
            <div>🪙 Collect all pump.fun tokens to escape!</div>
            <div>👻 Defeat shadow monsters blocking your way!</div>
          </div>
        </div>

      </div>
    `;

    // Add DOM element to the scene
    this.uiContainer = utils.initUIDom(this, uiHTML);
  }

  setupGuideTimer(): void {
    // Hide instructions after 5 seconds
    this.guideTimer = this.time.delayedCall(5000, () => {
      const instructionsGuide = document.getElementById("instructions-guide");
      if (instructionsGuide) {
        instructionsGuide.style.opacity = "0";
        instructionsGuide.style.transition = "opacity 0.5s ease-out";
        
        // Completely hide after fade animation
        this.time.delayedCall(500, () => {
          if (instructionsGuide) {
            instructionsGuide.style.display = "none";
          }
        });
      }
    });
  }

  update(): void {
    if (!this.currentGameSceneKey) return;

    // Get reference to the game scene
    const gameScene = this.scene.get(this.currentGameSceneKey) as any;
    if (!gameScene || !gameScene.player) return;

    const player = gameScene.player;

    // Update health bar
    const healthPercentage = player.getHealthPercentage();
    const healthFill = document.getElementById("health-fill");
    const healthText = document.getElementById("health-text");
    
    if (healthFill && healthText) {
      healthFill.style.width = `${healthPercentage}%`;
      healthText.textContent = `${player.health}/${player.maxHealth}`;
    }

    // Update token counter
    const tokenCount = document.getElementById("token-count");
    if (tokenCount) {
      const tokensCollected = player.tokensCollected || 0;
      const tokensTotal = player.tokensToCollect || 8; // Dynamic based on level
      tokenCount.textContent = `${tokensCollected}/${tokensTotal}`;
    }
  }
}