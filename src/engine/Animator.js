export default class Animator {
	constructor(config) {
		this.config = config;
		this.current = null;
		this.frame = 0;
		this.spriteIndex = 0;
		this.useHitSprite = false;
		this.onEvent = null;
		this._firedEvents = new Set();
	}

	play(name, { reset = true } = {}) {
		if (this.current === name && !reset) return;
		this.current = name;
		this.frame = 0;
		this.spriteIndex = 0;
		this.useHitSprite = false;
		this._firedEvents.clear();
	}

	update() {
		const anim = this.config.animations[this.current];
		if (!anim) return;
		this.frame++;
		if (this.frame % anim.rate !== 0) return;

		if (anim.footsteps && anim.footsteps.includes(this.spriteIndex)) {
			const key = `foot-${this.spriteIndex}`;
			if (!this._firedEvents.has(key)) {
				this._fire('footstep');
				this._firedEvents.add(key);
			}
		}
		if (anim.attack && anim.attack.hitFrame === this.spriteIndex && !this._firedEvents.has('attackHit')) {
			this._fire('attackHit', anim.attack);
			this._firedEvents.add('attackHit');
		}

		this.spriteIndex++;
		if (this.spriteIndex >= anim.frames) {
			if (anim.loop) {
				this.spriteIndex = 0;
				this._firedEvents.clear();
			} else {
				this.spriteIndex = anim.frames - 1;
				if (!this._firedEvents.has('end')) {
					this._fire('end');
					this._firedEvents.add('end');
				}
			}
		}
	}

	_fire(name, data) {
		if (this.onEvent) this.onEvent(name, data);
	}

	getDrawInfo(direction) {
		const anim = this.config.animations[this.current];
		if (!anim) return null;

		// Per-animation sheet (editor format): anim.sheet + row + startColumn
		if (anim.sheet && anim.row != null) {
			const sheet = anim.sheet;
			const image = direction === 'left' ? anim.mirroredImage ?? anim.image ?? sheet.image : anim.image ?? sheet.image;
			if (!image) return null;
			// Prefer an explicit per-animation frame size, then the character-level default, then the sheet-inferred cell size.
			// Cell size (sheet.frameWidth) is a last-resort fallback because sheets often include transparent padding around the real art.
			const sw = anim.frameWidth ?? this.config.frameWidth ?? sheet.frameWidth;
			const sh = anim.frameHeight ?? this.config.frameHeight ?? sheet.frameHeight;
			// Stride per cell on the sheet (used to position the column) — use the inferred cell size so row/column math matches the grid.
			const cellW = sheet.frameWidth ?? sw;
			const cellH = sheet.frameHeight ?? sh;
			const offsetX = anim.frameOffsetX ?? this.config.frameOffsetX ?? 0;
			const startCol = anim.startColumn ?? 0;
			const sx = (startCol + this.spriteIndex) * cellW + offsetX;
			const sy = anim.row * cellH;
			return { image, sx, sy, sw, sh };
		}

		const sw = anim.frameWidth ?? this.config.frameWidth;
		const sh = anim.frameHeight ?? this.config.frameHeight;
		const offsetX = anim.frameOffsetX ?? this.config.frameOffsetX ?? 0;

		// Legacy strip image (venom-style): image/mirroredImage are one-row strips
		if (anim.image || anim.mirroredImage) {
			const image = direction === 'left' ? anim.mirroredImage ?? anim.image : anim.image;
			if (!image) return null;
			const sx = this.spriteIndex * sw + offsetX;
			return { image, sx, sy: 0, sw, sh };
		}

		// Legacy character-level sheet with per-anim row
		if (anim.row != null && this.config.sheet) {
			const sheet = this.config.sheet;
			const image = direction === 'left' ? sheet.mirroredImage : sheet.image;
			if (!image) return null;
			let sx;
			if (direction === 'left') {
				sx = sheet.pixelWidth - (this.spriteIndex + 1) * sw - offsetX;
			} else {
				sx = this.spriteIndex * sw + offsetX;
			}
			return { image, sx, sy: anim.row * sh, sw, sh };
		}
		return null;
	}

	getHitOverlayInfo(direction) {
		if (!this.useHitSprite) return null;
		const anim = this.config.animations[this.current];
		const hs = anim?.attack?.hitSprite;
		if (!hs) return null;
		const image = direction === 'left' ? hs.mirroredImage ?? hs.image : hs.image;
		if (!image) return null;
		const sw = anim.frameWidth ?? this.config.frameWidth;
		const sh = anim.frameHeight ?? this.config.frameHeight;
		const offsetX = anim.frameOffsetX ?? this.config.frameOffsetX ?? 0;
		const sx = this.spriteIndex * sw + offsetX;
		return { image, sx, sy: 0, sw, sh };
	}
}
