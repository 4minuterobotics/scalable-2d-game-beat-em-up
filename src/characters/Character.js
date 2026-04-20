import Animator from '../engine/Animator.js';

export default class Character {
	constructor(config, x, y) {
		this.config = config;
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.width = config.draw.width;
		this.height = config.draw.height;
		this.speed = config.speed;
		this.maxHealth = config.health;
		this.health = config.health;
		this.direction = config.startDirection ?? 'right';
		this.spriteCenterOffset = config.spriteCenterOffset ?? 0;
		this.alive = true;
		this.parallax = 1;

		this.intent = { moveX: 0, moveY: 0, action: null, sprint: false, heldAction: null };
		this.isActing = false;
		this.currentActionName = null;

		this.onAttackHit = null;
		this.onProjectileSpawn = null;

		this.animator = new Animator(config);
		this.animator.onEvent = (ev, data) => this._onAnimEvent(ev, data);
		this.animator.play(config.startAnimation ?? 'idle');
	}

	get centerX() {
		const sign = this.config.mirrorCenterOffsetOnFlip && this.direction === 'left' ? -1 : 1;
		return this.x + this.width / 2 + this.spriteCenterOffset * sign;
	}

	get feetY() {
		return this.y + this.height;
	}

	update(world) {
		// Release a hold-to-repeat action when its input is no longer held.
		if (this.isActing) {
			const currAnim = this.config.animations?.[this.currentActionName];
			if (currAnim?.holdToRepeat && this.intent.heldAction !== this.currentActionName) {
				this._endAction();
			}
		}

		if (this.isActing) {
			this.vx = 0;
			this.vy = 0;
		} else {
			let ix = this.intent.moveX;
			let iy = this.intent.moveY;
			const diag = ix !== 0 && iy !== 0 ? 0.5 : 1;
			const walkSlot = this.config.walkAnimation ?? 'run';
			const hasRunSlot = this.config.runAnimation && this.config.animations?.[this.config.runAnimation];
			const runSlot = hasRunSlot ? this.config.runAnimation : walkSlot;
			const wantsRun = !!this.intent.sprint && hasRunSlot;
			const speedMul = wantsRun ? (this.config.sprintSpeedMultiplier ?? 1.5) : 1;
			this.vx = ix * this.speed * diag * speedMul;
			this.vy = iy * this.speed * diag * speedMul;
			if (ix > 0) this.direction = 'right';
			else if (ix < 0) this.direction = 'left';

			const moving = ix !== 0 || iy !== 0;
			const idleSlot = this.config.idleAnimation ?? 'idle';
			const desired = moving ? (wantsRun ? runSlot : walkSlot) : idleSlot;
			if (this.animator.current !== desired && this.config.animations[desired]) {
				this.animator.play(desired);
			}

			if (this.intent.action) {
				this._startAction(this.intent.action);
				this.intent.action = null;
			}
		}

		this.animator.update();
		this.x += this.vx;
		this.y += this.vy;

		if (world.bounds) {
			if (this.feetY < world.bounds.topY) this.y = world.bounds.topY - this.height;
			if (this.feetY > world.bounds.bottomY) this.y = world.bounds.bottomY - this.height;
		}
	}

	_startAction(actionName) {
		const anim = this.config.animations[actionName];
		if (!anim) return;
		this.isActing = true;
		this.currentActionName = actionName;
		this.vx = 0;
		this.vy = 0;
		this.animator.play(actionName, { reset: true });
		if (anim.attack?.sounds?.start && this.config.sounds?.[anim.attack.sounds.start]) {
			this.config.sounds[anim.attack.sounds.start].play();
		}
		if (anim.attack?.sounds?.startVoice && this.config.sounds?.[anim.attack.sounds.startVoice]) {
			this.config.sounds[anim.attack.sounds.startVoice].play();
		}
	}

	_onAnimEvent(ev, data) {
		if (ev === 'footstep' && this.config.sounds?.step) {
			this.config.sounds.step.play();
		}
		if (ev === 'attackHit' && this.onAttackHit) {
			this.onAttackHit(this.currentActionName, data);
		}
		if (ev === 'projectileSpawn' && this.onProjectileSpawn) {
			this.onProjectileSpawn(this.currentActionName ?? this.animator.current, data);
		}
		if (ev === 'end' && this.isActing) {
			this._endAction();
		}
	}

	showHitSprite(on) {
		this.animator.useHitSprite = on;
	}

	_endAction() {
		const finished = this.currentActionName;
		this.isActing = false;
		this.currentActionName = null;
		this.animator.useHitSprite = false;
		const next = this.config.animations[finished]?.next ?? 'idle';
		if (this.config.animations[next]) this.animator.play(next);
	}

	takeDamage(amount) {
		if (!this.alive) return;
		this.health -= amount;
		if (this.config.sounds?.hurt) this.config.sounds.hurt.play();
		if (this.health <= 0) {
			this.alive = false;
			if (this.config.sounds?.death) this.config.sounds.death.play();
			return;
		}
		this._playHurtAnimation();
	}

	_playHurtAnimation() {
		if (this.isActing) return;
		const animations = this.config.animations ?? {};
		const slot = this.config.hurtAnimation ?? (animations.takeDamage ? 'takeDamage' : null);
		if (!slot || !animations[slot]) return;
		this.isActing = true;
		this.currentActionName = slot;
		this.vx = 0;
		this.vy = 0;
		this.animator.play(slot, { reset: true });
	}

	draw(ctx, camera) {
		const info = this.animator.getDrawInfo(this.direction);
		if (!info || !info.image) return;
		const sx = this.x - camera.x * this.parallax;
		if (info.flip) {
			ctx.save();
			ctx.translate(sx + this.width, this.y);
			ctx.scale(-1, 1);
			ctx.drawImage(info.image, info.sx, info.sy, info.sw, info.sh, 0, 0, this.width, this.height);
			const overlay = this.animator.getHitOverlayInfo(this.direction);
			if (overlay) {
				ctx.drawImage(overlay.image, overlay.sx, overlay.sy, overlay.sw, overlay.sh, 0, 0, this.width, this.height);
			}
			ctx.restore();
		} else {
			ctx.drawImage(info.image, info.sx, info.sy, info.sw, info.sh, sx, this.y, this.width, this.height);
			const overlay = this.animator.getHitOverlayInfo(this.direction);
			if (overlay) {
				ctx.drawImage(overlay.image, overlay.sx, overlay.sy, overlay.sw, overlay.sh, sx, this.y, this.width, this.height);
			}
		}
	}
}
