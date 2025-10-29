import Phaser from "phaser";
import * as utils from "./utils";
import { PumpkinBoy } from "./PumpkinBoy";
import { ShadowMonster } from "./ShadowMonster";
import { LevelManager } from "./LevelManager";
import { gameConfig, monsterConfig } from "./gameConfig.json";

export class HalloweenLabyrinthLevel2 extends Phaser.Scene {
  // Scene properties
  gameCompleted: boolean = false;
  mapWidth: number = 0;
  mapHeight: number = 0;
  
  // Game objects
  player!: PumpkinBoy;
  enemies!: Phaser.GameObjects.Group;
  enemyMeleeTriggers!: Phaser.GameObjects.Group;
  tokens!: Phaser.GameObjects.Group;
  
  // Input controls
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey!: Phaser.Input.Keyboard.Key;
  
  // Map objects
  map!: Phaser.Tilemaps.Tilemap;
  groundTileset!: Phaser.Tilemaps.Tileset;
  wallsTileset!: Phaser.Tilemaps.Tileset;
  groundLayer!: Phaser.Tilemaps.TilemapLayer;
  wallsLayer!: Phaser.Tilemaps.TilemapLayer;

  // Background music
  backgroundMusic!: Phaser.Sound.BaseSound;

  // Sortable objects for depth
  sortableObjects: any[] = [];

  constructor() {
    super({
      key: "HalloweenLabyrinthLevel2",
    });
  }

  create(): void {
    // Initialize gameCompleted flag
    this.gameCompleted = false;

    // Set map size based on tilemap
    this.setupMapSize();

    // Create background
    this.createBackground();

    // Create map
    this.createTileMap();

    // First create game object groups
    this.enemies = this.add.group();
    this.enemyMeleeTriggers = this.add.group();
    this.tokens = this.add.group();

    // Create player
    this.createPlayer();

    // Create enemies
    this.createEnemies();

    // Create tokens
    this.createTokens();

    // Set camera
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setLerp(0.1, 0.1);

    // Set world boundaries - no collisions needed for top-down
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight, false, false, false, false);

    // Create input controls
    this.setupInputs();

    // Setup collisions
    this.setupCollisions();

    // Show UI
    this.scene.launch("UIScene", { gameSceneKey: this.scene.key });

    // Play background music
    this.backgroundMusic = this.sound.add("spooky_halloween_theme", {
      volume: 0.6,
      loop: true
    });
    this.backgroundMusic.play();
  }

  update(time: number, delta: number): void {
    // Update player
    this.player.update(time, delta, this.cursors, this.spaceKey);

    // Update enemies
    this.enemies.children.entries.forEach((enemy: any) => {
      if (enemy.update) {
        enemy.update(time, delta);
      }
    });

    // Depth sorting for top-down view
    this.sortableObjects = [
      this.player,
      ...this.tokens.children.entries,
      ...this.enemies.children.entries
    ];
    
    this.sortableObjects.sort((a, b) => a.y - b.y);
    this.sortableObjects.forEach((obj, index) => {
      obj.setDepth(index);
    });

    // Check win condition
    this.checkWinCondition();
  }

  // Set map size method - Level 2 is larger: 28x20 tiles
  setupMapSize(): void {
    this.mapWidth = 28 * 64;
    this.mapHeight = 20 * 64;
  }

  // Create background
  createBackground(): void {
    const background = this.add.image(0, 0, "halloween_labyrinth_background");
    background.setOrigin(0, 0);
    
    // Scale background to fit map size
    const scaleX = this.mapWidth / background.width;
    const scaleY = this.mapHeight / background.height;
    const scale = Math.max(scaleX, scaleY);
    
    background.setScale(scale);
    background.setDepth(-2);
  }

  // Create tile map
  createTileMap(): void {
    // Create map
    this.map = this.make.tilemap({ key: "halloween_labyrinth_level2" });
    
    // Add tilesets
    this.groundTileset = this.map.addTilesetImage("halloween_ground_floor");
    this.wallsTileset = this.map.addTilesetImage("halloween_stone_walls");
    
    // Create layers
    this.groundLayer = this.map.createLayer("ground_layer", this.groundTileset, 0, 0)!;
    this.wallsLayer = this.map.createLayer("walls_layer", this.wallsTileset, 0, 0)!;
    
    // Set collision for walls
    this.wallsLayer.setCollisionByExclusion([-1]);
    
    // Set depth
    this.groundLayer.setDepth(-1);
    this.wallsLayer.setDepth(100); // Walls should be above everything
  }

  // Create player
  createPlayer(): void {
    // Place player at the entrance (bottom-left safe area)
    this.player = new PumpkinBoy(this, 2 * 64, this.mapHeight - 2 * 64);
  }

  // Create enemies - more enemies in Level 2
  createEnemies(): void {
    const enemyCount = 7; // More enemies than Level 1
    
    // Spawn enemies in different areas of the labyrinth
    const spawnPositions = [
      { x: 6 * 64, y: 4 * 64 },   // Upper left
      { x: 16 * 64, y: 3 * 64 },  // Upper right
      { x: 9 * 64, y: 10 * 64 },  // Center left
      { x: 19 * 64, y: 11 * 64 }, // Center right
      { x: 4 * 64, y: 15 * 64 },  // Lower left
      { x: 24 * 64, y: 16 * 64 }, // Lower right
      { x: 12 * 64, y: 7 * 64 }   // Center
    ];

    for (let i = 0; i < Math.min(enemyCount, spawnPositions.length); i++) {
      const pos = spawnPositions[i];
      const enemy = new ShadowMonster(this, pos.x, pos.y, this.player);
      this.enemies.add(enemy);
    }
  }

  // Create tokens to collect - more tokens in Level 2
  createTokens(): void {
    const tokenCount = 12; // More tokens than Level 1
    
    // Token spawn positions spread throughout the larger labyrinth
    const tokenPositions = [
      { x: 3 * 64, y: 2 * 64 },   // Top left
      { x: 9 * 64, y: 2 * 64 },   // Top center-left
      { x: 17 * 64, y: 2 * 64 },  // Top center-right
      { x: 25 * 64, y: 3 * 64 },  // Top right
      { x: 2 * 64, y: 7 * 64 },   // Middle left
      { x: 11 * 64, y: 6 * 64 },  // Middle center-left
      { x: 21 * 64, y: 6 * 64 },  // Middle center-right
      { x: 26 * 64, y: 8 * 64 },  // Middle right
      { x: 4 * 64, y: 12 * 64 },  // Lower-middle left
      { x: 18 * 64, y: 13 * 64 }, // Lower-middle right
      { x: 10 * 64, y: 18 * 64 }, // Bottom center-left
      { x: 23 * 64, y: 17 * 64 }  // Bottom right
    ];

    for (let i = 0; i < Math.min(tokenCount, tokenPositions.length); i++) {
      const pos = tokenPositions[i];
      const token = this.add.image(pos.x, pos.y, "pump_fun_token");
      
      // Initialize token scale and properties
      utils.initScale(token, { x: 0.5, y: 0.5 }, undefined, 48, 1, 1);
      
      // Add physics for collision detection
      this.physics.add.existing(token);
      
      // Add to tokens group
      this.tokens.add(token);
      
      // Add floating animation
      this.tweens.add({
        targets: token,
        y: token.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Add rotation animation
      this.tweens.add({
        targets: token,
        rotation: Math.PI * 2,
        duration: 2000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // Update player's total tokens to collect
    this.player.tokensToCollect = tokenCount;
  }

  // Setup input controls
  setupInputs(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  // Setup all collisions
  setupCollisions(): void {
    // Player and walls collision
    utils.addCollider(this, this.player, this.wallsLayer);
    
    // Enemies and walls collision
    utils.addCollider(this, this.enemies, this.wallsLayer);

    // Player and enemies contact damage
    utils.addOverlap(this, this.player, this.enemies, (player: any, enemy: any) => {
      // Only take damage if player is not invulnerable, not hurting, and not dead
      if (!player.isInvulnerable && !player.isHurting && !player.isDead) {
        // Calculate knockback direction
        const knockbackDirection = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y).normalize();
        
        // Apply knockback force
        const knockbackForce = 200;
        player.body.setVelocity(
          knockbackDirection.x * knockbackForce,
          knockbackDirection.y * knockbackForce
        );

        // Apply damage
        player.takeDamage(monsterConfig.contactDamage.value);
      }
    });

    // Player melee attack collision with enemies
    utils.addOverlap(this, this.player.meleeTrigger, this.enemies, (trigger: any, enemy: any) => {
      if (this.player.isAttacking && !this.player.currentMeleeTargets.has(enemy)) {
        // No response in death or hurt state
        if (enemy.isHurting || enemy.isDead) return;
        
        // Add enemy to attacked list
        this.player.currentMeleeTargets.add(enemy);
        
        // Calculate knockback direction (from player to enemy)
        const knockbackDirection = new Phaser.Math.Vector2(enemy.x - this.player.x, enemy.y - this.player.y).normalize();
        
        // Apply knockback to enemy
        const knockbackForce = 300;
        enemy.body.setVelocity(
          knockbackDirection.x * knockbackForce,
          knockbackDirection.y * knockbackForce
        );

        // Apply damage
        enemy.takeDamage(40);
      }
    });

    // Enemy melee attack collision with player
    utils.addOverlap(this, this.enemyMeleeTriggers, this.player, (trigger: any, player: any) => {
      const enemy = trigger.owner;
      if (enemy && enemy.isAttacking && !enemy.currentMeleeTargets.has(player)) {
        // Only take damage if player is not invulnerable, not hurting, and not dead
        if (!player.isInvulnerable && !player.isHurting && !player.isDead) {
          enemy.currentMeleeTargets.add(player);
          
          // Calculate knockback direction (from enemy to player)
          const knockbackDirection = new Phaser.Math.Vector2(player.x - enemy.x, player.y - enemy.y).normalize();
          
          // Apply stronger knockback
          const knockbackForce = 300;
          player.body.setVelocity(
            knockbackDirection.x * knockbackForce,
            knockbackDirection.y * knockbackForce
          );

          // Apply damage
          player.takeDamage(30);
        }
      }
    });

    // Player and tokens collision
    utils.addOverlap(this, this.player, this.tokens, (player: any, token: any) => {
      // Collect the token
      this.collectToken(token);
    });
  }

  // Collect token method
  collectToken(token: any): void {
    // Play collection sound
    this.sound.play("token_collect", { volume: 0.3 });

    // Remove token from scene
    token.destroy();

    // Update player's collected tokens count
    this.player.tokensCollected++;

    console.log(`Tokens collected: ${this.player.tokensCollected}/${this.player.tokensToCollect}`);
  }

  // Check win condition
  checkWinCondition(): void {
    // Win condition: collect all tokens and defeat all enemies
    const tokensRemaining = this.tokens.children.entries.filter(token => token.active).length;
    const enemiesRemaining = this.enemies.children.entries.filter(enemy => enemy.active).length;
    
    if (tokensRemaining === 0 && enemiesRemaining === 0 && !this.gameCompleted) {
      this.gameCompleted = true;
      console.log("Level 2 completed!");
      
      // Stop background music
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
      }

      if (LevelManager.isLastLevel(this.scene.key)) {
        this.scene.launch("GameCompleteUIScene", { 
          currentLevelKey: this.scene.key
        });
      } else {
        this.scene.launch("VictoryUIScene", { 
          currentLevelKey: this.scene.key
        });
      }
    }
  }
}