import Phaser from "phaser";
import * as utils from "./utils";
import { playerConfig } from "./gameConfig.json";
import { PumpkinBoyFSM } from "./PumpkinBoyFSM";

type Direction = "left" | "right" | "up" | "down";

// Pumpkin Boy player class - inherits from Phaser physics sprite
export class PumpkinBoy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  // State machine
  fsm: PumpkinBoyFSM;

  // Character attributes
  facingDirection: Direction;
  walkSpeed: number;

  // State flags
  isDead: boolean;
  isAttacking: boolean;
  isHurting: boolean;
  isInvulnerable: boolean;
  hurtingDuration: number;
  invulnerableTime: number;
  hurtingTimer?: Phaser.Time.TimerEvent;

  // Attack target tracking system
  currentMeleeTargets: Set<any>;

  // Health system
  maxHealth: number;
  health: number;

  // Attack trigger
  meleeTrigger: Phaser.GameObjects.Zone;

  // Sound effects
  attackSound?: Phaser.Sound.BaseSound;
  hurtSound?: Phaser.Sound.BaseSound;

  // Key references
  spaceKey?: Phaser.Input.Keyboard.Key;

  // Game progress
  tokensCollected: number;
  tokensToCollect: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "pumpkin_boy_idle_front_frame1");

    // Add to scene and physics system
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Initialize character attributes
    this.facingDirection = "down";
    this.walkSpeed = playerConfig.walkSpeed.value;

    // Initialize state flags
    this.isDead = false;
    this.isAttacking = false;
    this.isHurting = false;
    this.isInvulnerable = false;
    this.hurtingDuration = playerConfig.hurtingDuration.value;
    this.invulnerableTime = playerConfig.invulnerableTime.value;

    // Initialize attack system
    this.currentMeleeTargets = new Set();

    // Initialize health system
    this.maxHealth = playerConfig.maxHealth.value;
    this.health = this.maxHealth;

    // Initialize game progress
    this.tokensCollected = 0;
    this.tokensToCollect = 8; // Default value, will be updated by level

    // Use utility function to initialize sprite's size, scale, etc.
    const standardHeight = 128; // Standard character height
    utils.initScale(this, { x: 0.5, y: 1.0 }, undefined, standardHeight, 0.7, 0.7);

    // Create attack trigger
    this.meleeTrigger = utils.createTrigger(this.scene, this, 0, 0, 100, 80);

    // Initialize sound effects
    this.initializeSounds();

    // Initialize state machine
    this.fsm = new PumpkinBoyFSM(scene, this);
  }

  // Play animation and reset origin and offset
  playAnimation(animKey: string) {
    this.play(animKey, true);
    utils.resetOriginAndOffset(this, this.facingDirection);
  }

  // Main update method - called every frame
  update(
    time: number,
    delta: number,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    spaceKey: Phaser.Input.Keyboard.Key
  ) {
    // Save key references
    this.spaceKey = spaceKey;

    // Safety check
    if (!this.body || !this.active) {
      return;
    }

    // Update attack trigger position
    utils.updateMeleeTrigger(this, this.meleeTrigger, this.facingDirection, 100, 80); // attackRange: 100, attackWidth: 80

    // Use state machine update
    this.fsm.update(time, delta);
  }

  // Damage method
  takeDamage(damage: number) {
    if (this.isInvulnerable || this.isDead) return;

    this.health -= damage;
    this.isHurting = true;
    this.isInvulnerable = true;

    // Play hurt sound
    this.hurtSound?.play();

    // Switch to hurt state
    this.fsm.goto("hurting");

    // Start blinking effect during invulnerable time
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      repeat: 10,
      yoyo: true,
      onComplete: () => {
        this.alpha = 1;
        this.isInvulnerable = false;
      }
    });
  }

  // Get health percentage
  getHealthPercentage(): number {
    return (this.health / this.maxHealth) * 100;
  }

  // Collect token method
  collectToken() {
    this.tokensCollected++;
  }

  // Initialize sound effects
  initializeSounds() {
    this.attackSound = this.scene.sound.add("candy_stick_attack", {
      volume: 0.3,
    });
    this.hurtSound = this.scene.sound.add("player_hurt", {
      volume: 0.3,
    });
  }
}