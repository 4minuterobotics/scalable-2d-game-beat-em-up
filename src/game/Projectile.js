export default class Projectile {
	constructor({
		owner,
		image,
		projectileData,
		explosionData,
		x,
		y,
		direction,
		speed = 12,
		damage = 1,
		lifetime = 180,
		width,
		height,
	}) {
		this.owner = owner;
		this.image = image;
		this.projectileData = projectileData;
		this.explosionData = explosionData;
		this.x = x;
		this.y = y;
		this.direction = direction;
		this.vx = (direction === 'right' ? 1 : -1) * speed;
		this.vy = 0;
		this.damage = damage;
		this.lifetime = lifetime;
		this.age = 0;
		this.alive = true;
		this.state = 'flying';
		this.spriteIndex = 0;
		this.frameCounter = 0;
		this.width = width ?? projectileData?.frameWidth ?? projectileData?.sheet?.frameWidth ?? 64;
		this.height = height ?? projectileData?.frameHeight ?? projectileData?.sheet?.frameHeight ?? 64;
	}

	get feetY() {
		return this.y + this.height;
	}

	update(world) {
		this.age++;
		if (this.age > this.lifetime) {
			this.alive = false;
			return;
		}

		if (this.state === 'flying') {
			this.x += this.vx;
			this.y += this.vy;
			this._advanceFrame(this.projectileData, true);
			this._checkCollisions(world);
			// bail off stage
			if (world?.camera) {
				const leftEdge = world.camera.worldMin - 500;
				const rightEdge = (world.camera.worldMax ?? Infinity) + 500;
				if (this.x < leftEdge || this.x > rightEdge) this.alive = false;
			}
		} else if (this.state === 'exploding') {
			const done = this._advanceFrame(this.explosionData, false);
			if (done) this.alive = false;
		}
	}

	_advanceFrame(data, loop) {
		if (!data) return true;
		const rate = data.rate ?? 4;
		this.frameCounter++;
		if (this.frameCounter < rate) return false;
		this.frameCounter = 0;
		this.spriteIndex++;
		if (this.spriteIndex >= (data.frames ?? 1)) {
			if (loop) {
				this.spriteIndex = 0;
				return false;
			}
			return true;
		}
		return false;
	}

	_checkCollisions(world) {
		if (!world) return;
		const isPlayerShot = this.owner === world.player;
		const targets = isPlayerShot ? world.enemies : (world.player ? [world.player] : []);
		for (const t of targets) {
			if (!t?.alive) continue;
			if (this._overlaps(t)) {
				t.takeDamage(this.damage);
				this._explode();
				return;
			}
		}
	}

	_overlaps(char) {
		// shrink the projectile's box slightly for less-generous hits
		const pw = this.width * 0.5;
		const ph = this.height * 0.5;
		const px = this.x + (this.width - pw) / 2;
		const py = this.y + (this.height - ph) / 2;
		return (
			px < char.x + char.width &&
			px + pw > char.x &&
			py < char.y + char.height &&
			py + ph > char.y
		);
	}

	_explode() {
		if (!this.explosionData) {
			this.alive = false;
			return;
		}
		this.state = 'exploding';
		this.vx = 0;
		this.vy = 0;
		this.spriteIndex = 0;
		this.frameCounter = 0;
	}

	draw(ctx, camera) {
		if (!this.image) return;
		const data = this.state === 'exploding' ? this.explosionData : this.projectileData;
		if (!data) return;
		const sheet = data.sheet ?? {};
		const sw = data.frameWidth ?? sheet.frameWidth ?? this.width;
		const sh = data.frameHeight ?? sheet.frameHeight ?? this.height;
		const startCol = data.startColumn ?? 0;
		const sx = (startCol + this.spriteIndex) * sw;
		const sy = (data.row ?? 0) * sh;
		const screenX = this.x - camera.x;
		if (this.direction === 'left' && this.state === 'flying') {
			ctx.save();
			ctx.translate(screenX + this.width, this.y);
			ctx.scale(-1, 1);
			ctx.drawImage(this.image, sx, sy, sw, sh, 0, 0, this.width, this.height);
			ctx.restore();
		} else {
			ctx.drawImage(this.image, sx, sy, sw, sh, screenX, this.y, this.width, this.height);
		}
	}
}
