import Phaser from "phaser";
import * as utils from "./utils";
import { monsterConfig } from "./gameConfig.json";
import { ShadowMonsterFSM } from "./ShadowMonsterFSM";

type Direction = "left" | "right" | "up" | "down";

// Shadow Monster enemy class - inherits from Phaser physics sprite
export class ShadowMonster extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  // State machine
  fsm: ShadowMonsterFSM;

  // Character attributes
  facingDirection: Direction;
  moveSpeed: number;

  // State flags
  isDead: boolean;
  isHurting: boolean;
  isAttacking: boolean;

  // Health system
  maxHealth: number;
  health: number;

  // Attack system
  attackCooldown: number;
  lastAttackTime: number;
  meleeTrigger: Phaser.GameObjects.Zone;
  currentMeleeTargets: Set<any>;

  // AI system
  player: any; // Reference to player
  attackRange: number;
  lastDirectionChangeTime: number;
  directionChangeDelay: number;

  // Sound effects
  hurtSound?: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene, x: number, y: number, player: any) {
    super(scene, x, y, "shadow_monster_idle_front_frame1");

    // Add to scene and physics system
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Initialize character attributes
    this.facingDirection = "down";
    this.moveSpeed = monsterConfig.moveSpeed.value;

    // Initialize state flags
    this.isDead = false;
    this.isHurting = false;
    this.isAttacking = false;

    // Initialize health system
    this.maxHealth = monsterConfig.health.value;
    this.health = this.maxHealth;

    // Initialize attack system
    this.attackCooldown = monsterConfig.attackCooldown.value;
    this.lastAttackTime = 0;
    this.currentMeleeTargets = new Set();

    // Initialize AI system
    this.player = player;
    this.attackRange = 80;
    this.lastDirectionChangeTime = 0;
    this.directionChangeDelay = 1000; // 1 second direction change debounce

    // Use utility function to initialize sprite's size, scale, etc.
    const standardHeight = 100; // Slightly smaller than player
    utils.initScale(this, { x: 0.5, y: 1.0 }, undefined, standardHeight, 0.6, 0.6);

    // Create attack trigger
    this.meleeTrigger = utils.createTrigger(this.scene, this, 0, 0, 80, 60);
    
    // Add trigger to the enemy melee triggers group
    (scene as any).enemyMeleeTriggers?.add(this.meleeTrigger);

    // Initialize sound effects
    this.initializeSounds();

    // Initialize state machine
    this.fsm = new ShadowMonsterFSM(scene, this);
  }

  // Play animation and reset origin and offset
  playAnimation(animKey: string) {
    this.play(animKey, true);
    utils.resetOriginAndOffset(this, this.facingDirection);
  }

  // Main update method - called every frame
  update(time: number, delta: number) {
    // Safety check
    if (!this.body || !this.active || this.isDead) {
      return;
    }

    // Update attack trigger position
    utils.updateMeleeTrigger(this, this.meleeTrigger, this.facingDirection, 80, 60);

    // Use state machine update
    this.fsm.update(time, delta);
  }

  // Damage method
  takeDamage(damage: number) {
    if (this.isDead || this.isHurting) return;

    this.health -= damage;
    this.hurtSound?.play();

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.fsm.goto("dying");
    } else {
      this.isHurting = true;
      this.fsm.goto("hurting");
    }
  }

  // Get distance to player
  getDistanceToPlayer(): number {
    if (!this.player || !this.player.body) return Infinity;
    return Phaser.Math.Distance.Between(
      this.x, this.y,
      this.player.x, this.player.y
    );
  }

  // Check if player is in attack range
  canAttackPlayer(currentTime: number): boolean {
    const distanceToPlayer = this.getDistanceToPlayer();
    const timeSinceLastAttack = currentTime - this.lastAttackTime;
    
    return distanceToPlayer <= this.attackRange && 
           timeSinceLastAttack >= this.attackCooldown;
  }

  // Get direction to player
  getDirectionToPlayer(): Direction {
    if (!this.player || !this.player.body) return this.facingDirection;
    
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    
    // Determine primary direction based on larger distance component
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? "right" : "left";
    } else {
      return dy > 0 ? "down" : "up";
    }
  }

  // Move towards player
  moveTowardsPlayer() {
    if (!this.player || !this.player.body) return;
    
    const direction = this.getDirectionToPlayer();
    
    // Apply direction change debounce
    const currentTime = this.scene.time.now;
    if (direction !== this.facingDirection && 
        currentTime - this.lastDirectionChangeTime < this.directionChangeDelay) {
      return; // Don't change direction too frequently
    }
    
    if (direction !== this.facingDirection) {
      this.facingDirection = direction;
      this.lastDirectionChangeTime = currentTime;
    }
    
    // Set velocity based on direction
    switch (direction) {
      case "left":
        this.setVelocity(-this.moveSpeed, 0);
        break;
      case "right":
        this.setVelocity(this.moveSpeed, 0);
        break;
      case "up":
        this.setVelocity(0, -this.moveSpeed);
        break;
      case "down":
        this.setVelocity(0, this.moveSpeed);
        break;
    }
  }

  // Initialize sound effects
  initializeSounds() {
    this.hurtSound = this.scene.sound.add("monster_hurt", {
      volume: 0.3,
    });
  }

  // Cleanup method
  destroy(fromScene?: boolean) {
    // Clean up melee trigger
    if (this.meleeTrigger) {
      this.meleeTrigger.destroy();
    }
    
    super.destroy(fromScene);
  }
}