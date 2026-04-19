import Camera from '../engine/Camera.js';
import { findHits } from './CollisionSystem.js';
import HealthBar from './HealthBar.js';

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

		this.onStageComplete = null;
		this.onPlayerDead = null;
	}

	setPlayer(character, controller) {
		this.player = character;
		this.playerController = controller;
		this.playerHealthBar = new HealthBar({ target: character });
		character.onAttackHit = (name, attack) => this._handlePlayerAttack(name, attack);
	}

	addEnemy(character, controller) {
		this.enemies.push(character);
		this.enemyControllers.push(controller);
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
		items.sort((a, b) => a.feetY - b.feetY);
		for (const it of items) it.draw(ctx, this.camera);
	}
}
