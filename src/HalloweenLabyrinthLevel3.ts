import Phaser from "phaser";
import * as utils from "./utils";
import { PumpkinBoy } from "./PumpkinBoy";
import { ShadowMonster } from "./ShadowMonster";
import { LevelManager } from "./LevelManager";
import { gameConfig, monsterConfig } from "./gameConfig.json";

export class HalloweenLabyrinthLevel3 extends Phaser.Scene {
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
      key: "HalloweenLabyrinthLevel3",
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

  // Set map size method - Level 3 is the largest: 30x22 tiles
  setupMapSize(): void {
    this.mapWidth = 30 * 64;
    this.mapHeight = 22 * 64;
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
    this.map = this.make.tilemap({ key: "halloween_labyrinth_level3" });
    
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
    // Place player at the entrance (bottom-left corner)
    this.player = new PumpkinBoy(this, 2 * 64, this.mapHeight - 2 * 64);
  }

  // Create enemies - maximum enemies in Level 3
  createEnemies(): void {
    const enemyCount = 10; // Maximum enemies
    
    // Spawn enemies throughout the spiral maze
    const spawnPositions = [
      { x: 5 * 64, y: 5 * 64 },   // Outer ring
      { x: 12 * 64, y: 4 * 64 },  // Top outer
      { x: 22 * 64, y: 6 * 64 },  // Right outer
      { x: 25 * 64, y: 14 * 64 }, // Bottom outer right
      { x: 8 * 64, y: 17 * 64 },  // Bottom outer left
      { x: 8 * 64, y: 8 * 64 },   // Middle ring left
      { x: 18 * 64, y: 8 * 64 },  // Middle ring right
      { x: 21 * 64, y: 12 * 64 }, // Middle ring bottom
      { x: 12 * 64, y: 14 * 64 }, // Middle ring center
      { x: 15 * 64, y: 11 * 64 }  // Inner area
    ];

    for (let i = 0; i < Math.min(enemyCount, spawnPositions.length); i++) {
      const pos = spawnPositions[i];
      const enemy = new ShadowMonster(this, pos.x, pos.y, this.player);
      this.enemies.add(enemy);
    }
  }

  // Create tokens to collect - maximum tokens in Level 3
  createTokens(): void {
    const tokenCount = 16; // Maximum tokens
    
    // Token spawn positions throughout the spiral maze
    const tokenPositions = [
      // Outer ring tokens
      { x: 2 * 64, y: 2 * 64 },   // Top left corner
      { x: 8 * 64, y: 2 * 64 },   // Top outer left
      { x: 15 * 64, y: 2 * 64 },  // Top center
      { x: 22 * 64, y: 2 * 64 },  // Top outer right
      { x: 28 * 64, y: 5 * 64 },  // Right outer top
      { x: 28 * 64, y: 12 * 64 }, // Right outer middle
      { x: 28 * 64, y: 19 * 64 }, // Right outer bottom
      { x: 20 * 64, y: 20 * 64 }, // Bottom right
      { x: 12 * 64, y: 20 * 64 }, // Bottom center
      { x: 5 * 64, y: 20 * 64 },  // Bottom left
      { x: 2 * 64, y: 15 * 64 },  // Left middle
      { x: 2 * 64, y: 8 * 64 },   // Left upper
      // Middle ring tokens
      { x: 10 * 64, y: 9 * 64 },  // Middle ring entry
      { x: 19 * 64, y: 9 * 64 },  // Middle ring right
      { x: 15 * 64, y: 14 * 64 }, // Middle ring bottom
      // Center token (hardest to reach)
      { x: 15 * 64, y: 11 * 64 }  // Center of spiral
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
      console.log("Level 3 completed! Game Complete!");
      
      // Stop background music
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
      }

      // Level 3 is the final level
      this.scene.launch("GameCompleteUIScene", { 
        currentLevelKey: this.scene.key
      });
    }
  }
}