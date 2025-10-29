import Phaser from "phaser";
import * as utils from "./utils";
import { PumpkinBoy } from "./PumpkinBoy";
import { ShadowMonster } from "./ShadowMonster";
import { LevelManager } from "./LevelManager";
import { gameConfig, monsterConfig } from "./gameConfig.json";

export class HalloweenLabyrinthScene extends Phaser.Scene {
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
      key: "HalloweenLabyrinthScene",
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

  // Set map size method
  setupMapSize(): void {
    // Based on the created tilemap: 24x18 tiles, each tile is 64x64
    this.mapWidth = 24 * 64;
    this.mapHeight = 18 * 64;
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
    this.map = this.make.tilemap({ key: "halloween_labyrinth" });
    
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
    // Place player in a safe starting position (near bottom-left)
    this.player = new PumpkinBoy(this, 128, this.mapHeight - 128);
  }

  // Create enemies
  createEnemies(): void {
    const enemyCount = gameConfig.monsterSpawnCount.value;
    
    // Spawn enemies in different areas of the labyrinth
    const spawnPositions = [
      { x: 5 * 64, y: 5 * 64 },
      { x: 15 * 64, y: 4 * 64 },
      { x: 8 * 64, y: 9 * 64 },
      { x: 18 * 64, y: 11 * 64 },
      { x: 10 * 64, y: 14 * 64 }
    ];

    for (let i = 0; i < Math.min(enemyCount, spawnPositions.length); i++) {
      const pos = spawnPositions[i];
      const enemy = new ShadowMonster(this, pos.x, pos.y, this.player);
      this.enemies.add(enemy);
    }
  }

  // Create tokens to collect
  createTokens(): void {
    const tokenCount = gameConfig.tokensToCollect.value;
    
    // Token spawn positions spread throughout the labyrinth
    const tokenPositions = [
      { x: 4 * 64, y: 2 * 64 },
      { x: 11 * 64, y: 2 * 64 },
      { x: 20 * 64, y: 4 * 64 },
      { x: 2 * 64, y: 8 * 64 },
      { x: 16 * 64, y: 9 * 64 },
      { x: 7 * 64, y: 12 * 64 },
      { x: 19 * 64, y: 16 * 64 },
      { x: 13 * 64, y: 16 * 64 }
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

    // Player and enemy contact damage
    utils.addOverlap(this, this.player, this.enemies, (player: any, enemy: any) => {
      if (!player.isInvulnerable && !player.isDead && !enemy.isDead) {
        // Knockback effect
        const knockbackForce = 200;
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        const knockbackX = Math.cos(angle) * knockbackForce;
        const knockbackY = Math.sin(angle) * knockbackForce;
        
        player.setVelocity(knockbackX, knockbackY);
        
        // Damage player
        player.takeDamage(monsterConfig.contactDamage.value);
      }
    });

    // Player melee attack vs enemies
    utils.addOverlap(this, this.player.meleeTrigger, this.enemies, (trigger: any, enemy: any) => {
      if (this.player.isAttacking && !this.player.currentMeleeTargets.has(enemy)) {
        if (enemy.isHurting || enemy.isDead) return;
        
        this.player.currentMeleeTargets.add(enemy);
        
        // Knockback effect
        const knockbackForce = 150;
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        const knockbackX = Math.cos(angle) * knockbackForce;
        const knockbackY = Math.sin(angle) * knockbackForce;
        
        enemy.setVelocity(knockbackX, knockbackY);
        
        // Damage enemy
        enemy.takeDamage(40);
      }
    });

    // Player token collection
    utils.addOverlap(this, this.player, this.tokens, (player: any, token: any) => {
      // Play collection sound
      this.sound.play("token_collect", { volume: 0.3 });
      
      // Collect token
      player.collectToken();
      
      // Remove token
      token.destroy();
    });
  }

  // Check win condition
  checkWinCondition(): void {
    if (this.gameCompleted) return;

    const tokensCollected = this.player.tokensCollected;
    const tokensNeeded = gameConfig.tokensToCollect.value;

    if (tokensCollected >= tokensNeeded) {
      this.gameCompleted = true;
      
      // Stop background music
      this.backgroundMusic.stop();
      
      // Launch victory UI
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