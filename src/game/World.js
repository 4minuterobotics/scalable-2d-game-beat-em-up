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
		this.debugDraw = false;
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
		if (this.debugDraw) this._drawDebugOverlay(ctx);
		if (this.playerHealthBar) this.playerHealthBar.draw(ctx);
	}

	_drawDebugOverlay(ctx) {
		const all = [];
		if (this.player) all.push({ char: this.player, role: 'player' });
		for (const e of this.enemies) all.push({ char: e, role: 'enemy' });

		ctx.save();
		ctx.font = '10px monospace';
		ctx.textBaseline = 'top';

		for (const { char, role } of all) {
			const sx = char.x - this.camera.x;

			// Full draw box — cyan
			ctx.strokeStyle = 'rgba(77, 210, 255, 0.85)';
			ctx.lineWidth = 1.5;
			ctx.strokeRect(sx + 0.5, char.y + 0.5, char.width - 1, char.height - 1);

			// centerX — magenta vertical line (AI distance reference)
			const cx = char.centerX - this.camera.x;
			ctx.strokeStyle = 'rgba(255, 77, 210, 0.9)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(cx, char.y);
			ctx.lineTo(cx, char.y + char.height);
			ctx.stroke();

			// feetY — yellow horizontal line (ground plane)
			ctx.strokeStyle = 'rgba(255, 220, 77, 0.9)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(sx, char.feetY);
			ctx.lineTo(sx + char.width, char.feetY);
			ctx.stroke();

			// Attack reach — red dashed (if mid-attack with a width/height)
			const anim = char.config.animations?.[char.currentActionName];
			const atk = anim?.attack;
			if (char.isActing && atk?.width) {
				const dir = char.direction === 'right' ? 1 : -1;
				const rx = cx + (dir === 1 ? 0 : -atk.width);
				const ry = char.feetY - (atk.height ?? 40) / 2 - 20;
				ctx.strokeStyle = 'rgba(255, 90, 90, 0.9)';
				ctx.lineWidth = 1.5;
				ctx.setLineDash([4, 3]);
				ctx.strokeRect(rx, ry, atk.width, atk.height ?? 40);
				ctx.setLineDash([]);
			}

			// Label
			ctx.fillStyle = role === 'player' ? 'rgba(77, 255, 77, 0.95)' : 'rgba(255, 210, 77, 0.95)';
			const label = `${role}  w${char.width}×h${char.height}  off${char.spriteCenterOffset ?? 0}`;
			ctx.fillText(label, sx + 2, char.y + 2);
		}

		// Projectile bounding boxes — orange
		for (const p of this.projectiles) {
			const psx = p.x - this.camera.x;
			ctx.strokeStyle = 'rgba(255, 150, 77, 0.85)';
			ctx.lineWidth = 1;
			ctx.strokeRect(psx + 0.5, p.y + 0.5, p.width - 1, p.height - 1);
		}

		// Movement bounds (topY / bottomY feet plane) — dim white lines across the viewport
		if (this.bounds) {
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
			ctx.setLineDash([6, 6]);
			ctx.beginPath();
			ctx.moveTo(0, this.bounds.topY);
			ctx.lineTo(this.viewportWidth, this.bounds.topY);
			ctx.moveTo(0, this.bounds.bottomY);
			ctx.lineTo(this.viewportWidth, this.bounds.bottomY);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		// Legend (top-left of viewport)
		const lx = 10;
		let ly = 40;
		const legend = [
			['cyan', 'draw box (width × height)'],
			['magenta', 'centerX (AI distance + camera anchor)'],
			['yellow', 'feetY (ground plane / Y distance)'],
			['red dashed', 'attack hitbox (during isActing)'],
			['orange', 'projectile'],
			['white dashed', 'movement bounds'],
		];
		ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
		ctx.fillRect(lx - 4, ly - 4, 280, legend.length * 13 + 8);
		ctx.fillStyle = 'white';
		ctx.font = '10px monospace';
		for (const [color, label] of legend) {
			ctx.fillStyle = 'white';
			ctx.fillText(`${color.padEnd(14)}${label}`, lx, ly);
			ly += 13;
		}

		ctx.restore();
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
