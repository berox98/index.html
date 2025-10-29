import Phaser from "phaser";
import FSM from "phaser3-rex-plugins/plugins/fsm.js";
import type { PumpkinBoy } from "./PumpkinBoy";

// Custom FSM class for managing player states
export class PumpkinBoyFSM extends FSM {
  scene: Phaser.Scene;
  player: PumpkinBoy;

  constructor(scene: Phaser.Scene, player: PumpkinBoy) {
    super({
      // IMPORTANT: Do NOT use `start: "state_name"` here
      // Reason: Using `start` config will set the initial state but will NOT trigger the enter_state() function
      // Instead, we call this.goto("state_name") after initialization to properly trigger enter_state()
      extend: {
        eventEmitter: new Phaser.Events.EventEmitter(),
      },
    });
    this.scene = scene;
    this.player = player;
    
    // Use goto to trigger enter_state function and properly initialize the player state
    this.goto("idle");
  }

  // Common death check method
  checkDeath() {
    if (this.player.health <= 0 && !this.player.isDead) {
      this.player.health = 0;
      this.player.isDead = true;
      this.goto("dying");
      return true;
    }
    
    return false;
  }

  // Idle state
  enter_idle() {
    this.player.setVelocity(0, 0);
    
    // Play appropriate idle animation based on facing direction
    switch (this.player.facingDirection) {
      case "up":
        this.player.playAnimation("pumpkin_boy_idle_back_anim");
        break;
      case "down":
        this.player.playAnimation("pumpkin_boy_idle_front_anim");
        break;
      case "left":
        this.player.playAnimation("pumpkin_boy_idle_side_R_anim");
        this.player.setFlipX(true);
        break;
      case "right":
        this.player.playAnimation("pumpkin_boy_idle_side_R_anim");
        this.player.setFlipX(false);
        break;
    }
  }

  update_idle(time: number, delta: number) {
    if (this.checkDeath()) return;

    const cursors = this.scene.input.keyboard?.createCursorKeys();
    if (!cursors) return;
    
    // Movement input detection
    if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
      this.goto("moving");
    } 
    // Space key attack input detection
    else if (
      this.player.spaceKey &&
      Phaser.Input.Keyboard.JustDown(this.player.spaceKey)
    ) {
      this.goto("attacking");
    }
  }

  // Moving state
  enter_moving() {
    // Play appropriate walk animation based on facing direction
    switch (this.player.facingDirection) {
      case "up":
        this.player.playAnimation("pumpkin_boy_walk_back_anim");
        break;
      case "down":
        this.player.playAnimation("pumpkin_boy_walk_front_anim");
        break;
      case "left":
        this.player.playAnimation("pumpkin_boy_walk_side_R_anim");
        this.player.setFlipX(true);
        break;
      case "right":
        this.player.playAnimation("pumpkin_boy_walk_side_R_anim");
        this.player.setFlipX(false);
        break;
    }
  }

  update_moving(time: number, delta: number) {
    if (this.checkDeath()) return;

    const cursors = this.scene.input.keyboard?.createCursorKeys();
    if (!cursors) return;
    
    let isMoving = false;
    
    // Handle movement input
    if (cursors.left.isDown) {
      this.player.setVelocityX(-this.player.walkSpeed);
      this.player.setVelocityY(0);
      if (this.player.facingDirection !== "left") {
        this.player.facingDirection = "left";
        this.player.playAnimation("pumpkin_boy_walk_side_R_anim");
        this.player.setFlipX(true);
      }
      isMoving = true;
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(this.player.walkSpeed);
      this.player.setVelocityY(0);
      if (this.player.facingDirection !== "right") {
        this.player.facingDirection = "right";
        this.player.playAnimation("pumpkin_boy_walk_side_R_anim");
        this.player.setFlipX(false);
      }
      isMoving = true;
    } else if (cursors.up.isDown) {
      this.player.setVelocityX(0);
      this.player.setVelocityY(-this.player.walkSpeed);
      if (this.player.facingDirection !== "up") {
        this.player.facingDirection = "up";
        this.player.playAnimation("pumpkin_boy_walk_back_anim");
        this.player.setFlipX(false);
      }
      isMoving = true;
    } else if (cursors.down.isDown) {
      this.player.setVelocityX(0);
      this.player.setVelocityY(this.player.walkSpeed);
      if (this.player.facingDirection !== "down") {
        this.player.facingDirection = "down";
        this.player.playAnimation("pumpkin_boy_walk_front_anim");
        this.player.setFlipX(false);
      }
      isMoving = true;
    }

    if (!isMoving) {
      this.goto("idle");
    }

    // Attack input detection
    if (
      this.player.spaceKey &&
      Phaser.Input.Keyboard.JustDown(this.player.spaceKey)
    ) {
      this.goto("attacking");
    }
  }

  // Attack state
  enter_attacking() {
    this.player.isAttacking = true;
    this.player.setVelocity(0, 0);
    this.player.currentMeleeTargets.clear();
    this.player.attackSound?.play();

    // Play appropriate attack animation based on facing direction
    switch (this.player.facingDirection) {
      case "up":
        this.player.playAnimation("pumpkin_boy_attack_back_anim");
        break;
      case "down":
        this.player.playAnimation("pumpkin_boy_attack_front_anim");
        break;
      case "left":
        this.player.playAnimation("pumpkin_boy_attack_side_R_anim");
        this.player.setFlipX(true);
        break;
      case "right":
        this.player.playAnimation("pumpkin_boy_attack_side_R_anim");
        this.player.setFlipX(false);
        break;
    }

    // State transition after attack animation completes
    const animKey = this.player.anims.currentAnim?.key;
    if (animKey) {
      this.player.once(`animationcomplete-${animKey}`, () => {
        this.player.isAttacking = false;
        this.player.currentMeleeTargets.clear();
        
        // Check if still moving
        const cursors = this.scene.input.keyboard?.createCursorKeys();
        if (cursors && (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)) {
          this.goto("moving");
        } else {
          this.goto("idle");
        }
      });
    }
  }

  update_attacking(time: number, delta: number) {
    if (this.checkDeath()) return;

    // Keep still during attack
    this.player.setVelocity(0, 0);
  }

  // Hurt state
  enter_hurting() {
    this.player.setVelocity(0, 0);

    // Clear any existing hurt timer
    if (this.player.hurtingTimer) {
      this.player.hurtingTimer.destroy();
      this.player.hurtingTimer = undefined;
    }

    // Set hurt timer
    this.player.hurtingTimer = this.scene.time.delayedCall(this.player.hurtingDuration, () => {
      this.player.isHurting = false;
      this.player.hurtingTimer = undefined;
      
      // Check movement state
      const cursors = this.scene.input.keyboard?.createCursorKeys();
      if (cursors && (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown)) {
        this.goto("moving");
      } else {
        this.goto("idle");
      }
    });
  }

  // Death state
  enter_dying() {
    // Clear hurt timer if exists
    if (this.player.hurtingTimer) {
      this.player.hurtingTimer.destroy();
      this.player.hurtingTimer = undefined;
    }
    
    this.player.setVelocity(0, 0);
    
    // Play death animation (using side view for death)
    this.player.playAnimation("pumpkin_boy_idle_side_R_anim");
    this.player.setFlipX(false);

    // Launch game over UI after a short delay
    this.scene.time.delayedCall(1000, () => {
      this.scene.scene.launch("GameOverUIScene", {
        currentLevelKey: this.scene.scene.key,
      });
    });
  }
}