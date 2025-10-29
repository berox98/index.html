import Phaser from "phaser";
import FSM from "phaser3-rex-plugins/plugins/fsm.js";
import type { ShadowMonster } from "./ShadowMonster";

// Custom FSM class for managing shadow monster states
export class ShadowMonsterFSM extends FSM {
  scene: Phaser.Scene;
  monster: ShadowMonster;

  constructor(scene: Phaser.Scene, monster: ShadowMonster) {
    super({
      // IMPORTANT: Do NOT use `start: "state_name"` here
      // Reason: Using `start` config will set the initial state but will NOT trigger the enter_state() function
      // Instead, we call this.goto("state_name") after initialization to properly trigger enter_state()
      extend: {
        eventEmitter: new Phaser.Events.EventEmitter(),
      },
    });
    this.scene = scene;
    this.monster = monster;
    
    // Use goto to trigger enter_state function and properly initialize the monster state
    this.goto("idle");
  }

  // Idle state
  enter_idle() {
    this.monster.setVelocity(0, 0);
    
    // Play appropriate idle animation based on facing direction
    switch (this.monster.facingDirection) {
      case "up":
        this.monster.playAnimation("shadow_monster_idle_back_anim");
        break;
      case "down":
        this.monster.playAnimation("shadow_monster_idle_front_anim");
        break;
      case "left":
        this.monster.playAnimation("shadow_monster_idle_side_R_anim");
        this.monster.setFlipX(true);
        break;
      case "right":
        this.monster.playAnimation("shadow_monster_idle_side_R_anim");
        this.monster.setFlipX(false);
        break;
    }
  }

  update_idle(time: number, delta: number) {
    if (this.monster.isDead) return;

    // Check if player is nearby and start patrolling
    const distanceToPlayer = this.monster.getDistanceToPlayer();
    
    if (distanceToPlayer < 200) { // Detection range
      this.goto("patrolling");
    }
  }

  // Patrolling state - move towards player
  enter_patrolling() {
    // Play appropriate move animation based on facing direction
    switch (this.monster.facingDirection) {
      case "up":
        this.monster.playAnimation("shadow_monster_move_back_anim");
        break;
      case "down":
        this.monster.playAnimation("shadow_monster_move_front_anim");
        break;
      case "left":
        this.monster.playAnimation("shadow_monster_move_side_R_anim");
        this.monster.setFlipX(true);
        break;
      case "right":
        this.monster.playAnimation("shadow_monster_move_side_R_anim");
        this.monster.setFlipX(false);
        break;
    }
  }

  update_patrolling(time: number, delta: number) {
    if (this.monster.isDead) return;

    const currentTime = this.scene.time.now;
    
    // Check if can attack player
    if (this.monster.canAttackPlayer(currentTime)) {
      this.goto("attacking");
      return;
    }

    // Move towards player
    this.monster.moveTowardsPlayer();

    // Update animation if direction changed
    const currentDirection = this.monster.facingDirection;
    let shouldUpdateAnim = false;

    // Check if facing direction animation needs update
    const currentAnim = this.monster.anims.currentAnim?.key;
    switch (currentDirection) {
      case "up":
        if (currentAnim !== "shadow_monster_move_back_anim") shouldUpdateAnim = true;
        break;
      case "down":
        if (currentAnim !== "shadow_monster_move_front_anim") shouldUpdateAnim = true;
        break;
      case "left":
        if (currentAnim !== "shadow_monster_move_side_R_anim") shouldUpdateAnim = true;
        break;
      case "right":
        if (currentAnim !== "shadow_monster_move_side_R_anim") shouldUpdateAnim = true;
        break;
    }

    if (shouldUpdateAnim) {
      switch (currentDirection) {
        case "up":
          this.monster.playAnimation("shadow_monster_move_back_anim");
          this.monster.setFlipX(false);
          break;
        case "down":
          this.monster.playAnimation("shadow_monster_move_front_anim");
          this.monster.setFlipX(false);
          break;
        case "left":
          this.monster.playAnimation("shadow_monster_move_side_R_anim");
          this.monster.setFlipX(true);
          break;
        case "right":
          this.monster.playAnimation("shadow_monster_move_side_R_anim");
          this.monster.setFlipX(false);
          break;
      }
    }

    // Check if player is too far away, return to idle
    const distanceToPlayer = this.monster.getDistanceToPlayer();
    if (distanceToPlayer > 300) { // Lost player
      this.goto("idle");
    }
  }

  // Attack state
  enter_attacking() {
    this.monster.isAttacking = true;
    this.monster.setVelocity(0, 0);
    this.monster.currentMeleeTargets.clear();
    this.monster.lastAttackTime = this.scene.time.now;

    // Play appropriate attack animation based on facing direction
    // Using move animations as attack animations for shadow monster
    switch (this.monster.facingDirection) {
      case "up":
        this.monster.playAnimation("shadow_monster_move_back_anim");
        break;
      case "down":
        this.monster.playAnimation("shadow_monster_move_front_anim");
        break;
      case "left":
        this.monster.playAnimation("shadow_monster_move_side_R_anim");
        this.monster.setFlipX(true);
        break;
      case "right":
        this.monster.playAnimation("shadow_monster_move_side_R_anim");
        this.monster.setFlipX(false);
        break;
    }

    // Return to patrolling after attack duration
    this.scene.time.delayedCall(400, () => {
      this.monster.isAttacking = false;
      this.monster.currentMeleeTargets.clear();
      this.goto("patrolling");
    });
  }

  update_attacking(time: number, delta: number) {
    if (this.monster.isDead) return;

    // Keep still during attack
    this.monster.setVelocity(0, 0);
  }

  // Hurt state
  enter_hurting() {
    this.monster.setVelocity(0, 0);
    
    // Play appropriate idle animation during hurt
    switch (this.monster.facingDirection) {
      case "up":
        this.monster.playAnimation("shadow_monster_idle_back_anim");
        break;
      case "down":
        this.monster.playAnimation("shadow_monster_idle_front_anim");
        break;
      case "left":
        this.monster.playAnimation("shadow_monster_idle_side_R_anim");
        this.monster.setFlipX(true);
        break;
      case "right":
        this.monster.playAnimation("shadow_monster_idle_side_R_anim");
        this.monster.setFlipX(false);
        break;
    }

    // Start blinking effect
    this.scene.tweens.add({
      targets: this.monster,
      alpha: 0.5,
      duration: 100,
      repeat: 3,
      yoyo: true,
      onComplete: () => {
        this.monster.alpha = 1;
        this.monster.isHurting = false;
        this.goto("patrolling");
      }
    });
  }

  // Death state
  enter_dying() {
    this.monster.setVelocity(0, 0);
    this.monster.playAnimation("shadow_monster_die_anim");

    // Fade out and destroy after death animation
    this.scene.tweens.add({
      targets: this.monster,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.monster.destroy();
      }
    });
  }
}