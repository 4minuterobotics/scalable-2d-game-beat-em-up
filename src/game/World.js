import Camera from '../engine/Camera.js';
import { findHits } from './CollisionSystem.js';
import HealthBar from './HealthBar.js';
import Projectile from './Projectile.js';

export default class World {
	constructor({ viewportWidth, viewportHeight, stageLength, bgLayers, fgLayers, bounds }) {
		this.viewportWidth = viewportWidth;
		this.viewportHeight = viewportHeight;
		this.stageLength = stageLength;
		this.bgLayers = bgLayers;
		this.fgLayers = fgLayers;
		this.bounds = bounds;
		this.camera = new Camera({ viewportWidth, viewportHeight, worldMin: 0, worldMax: stageLength });

		this.player = null;
		this.playerController = null;
		this.enemies = [];
		this.enemyControllers = [];
		this.playerHealthBar = null;
		this.projectiles = [];

		this.onStageComplete = null;
		this.onPlayerDead = null;
	}

	setPlayer(character, controller) {
		this.player = character;
		this.playerController = controller;
		this.playerHealthBar = new HealthBar({ target: character });
		character.onAttackHit = (name, attack) => this._handlePlayerAttack(name, attack);
		character.onProjectileSpawn = (name, data) => this._spawnProjectile(character, data);
	}

	addEnemy(character, controller) {
		this.enemies.push(character);
		this.enemyControllers.push(controller);
		character.onProjectileSpawn = (name, data) => this._spawnProjectile(character, data);
	}

	_spawnProjectile(owner, { anim }) {
		if (!anim?.projectile) return;
		const p = anim.projectile;
		const explosion = anim.explosion ?? null;
		const image = anim.image ?? null;
		if (!image) return;
		const sheet = anim.sheet ?? {};
		const frameW = p.frameWidth ?? sheet.frameWidth ?? 64;
		const frameH = p.frameHeight ?? sheet.frameHeight ?? 64;
		// spawn roughly at the character's hand — center height, leading edge.
		const drawW = p.drawWidth ?? frameW;
		const drawH = p.drawHeight ?? frameH;
		const offsetX = p.spawnOffsetX ?? 0;
		const offsetY = p.spawnOffsetY ?? -drawH / 2;
		const anchorX = owner.x + owner.width / 2;
		const anchorY = owner.y + owner.height / 2;
		const dir = owner.direction ?? 'right';
		const x = dir === 'right' ? anchorX + offsetX : anchorX - offsetX - drawW;
		const y = anchorY + offsetY;
		this.projectiles.push(
			new Projectile({
				owner,
				image,
				projectileData: { ...p, sheet },
				explosionData: explosion ? { ...explosion, sheet } : null,
				x,
				y,
				direction: dir,
				speed: p.speed ?? 12,
				damage: p.damage ?? anim.attack?.damage ?? 1,
				lifetime: p.lifetime ?? 180,
				width: drawW,
				height: drawH,
			})
		);
	}

	_handlePlayerAttack(name, attack) {
		const hits = findHits(this.player, attack, this.enemies);
		if (hits.length === 0) return;
		if (attack.sounds?.hit) this.player.config.sounds?.[attack.sounds.hit]?.play();
		this.player.showHitSprite(true);
		for (const enemy of hits) enemy.takeDamage(attack.damage ?? 1);
	}

	update() {
		if (this.playerController) this.playerController.update();
		for (const ctrl of this.enemyControllers) ctrl.update();

		if (this.player) this.player.update(this);
		for (const enemy of this.enemies) enemy.update(this);

		for (const p of this.projectiles) p.update(this);
		for (let i = this.projectiles.length - 1; i >= 0; i--) {
			if (!this.projectiles[i].alive) this.projectiles.splice(i, 1);
		}

		for (let i = this.enemies.length - 1; i >= 0; i--) {
			if (!this.enemies[i].alive) {
				this.enemies.splice(i, 1);
				this.enemyControllers.splice(i, 1);
			}
		}

		if (this.player) this.camera.follow(this.player);

		if (this.player && !this.player.alive && this.onPlayerDead) {
			this.onPlayerDead();
			return;
		}

		if (this.player && this.stageLength && this.camera.x + this.viewportWidth >= this.stageLength && this.enemies.length === 0 && this.onStageComplete) {
			this.onStageComplete();
		}
	}

	draw(ctx) {
		for (const layer of this.bgLayers) layer.draw(ctx, this.camera);
		this._drawGameplay(ctx);
		for (const layer of this.fgLayers) layer.draw(ctx, this.camera);
		if (this.playerHealthBar) this.playerHealthBar.draw(ctx);
	}

	_drawGameplay(ctx) {
		const items = [];
		if (this.player) items.push(this.player);
		for (const e of this.enemies) items.push(e);
		for (const p of this.projectiles) items.push(p);
		items.sort((a, b) => a.feetY - b.feetY);
		for (const it of items) it.draw(ctx, this.camera);
	}
}
