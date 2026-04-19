export default class AIController {
	constructor(character, world, aiConfig = {}) {
		this.character = character;
		this.world = world;
		this.config = aiConfig;
		this.activated = false;
		this._speechCooldown = 0;
		this._wasMoving = false;
		const jitterX = aiConfig.stopJitter?.x ?? 0;
		const jitterY = aiConfig.stopJitter?.y ?? 0;
		this._stopJitterX = Math.random() * jitterX;
		this._stopJitterY = Math.random() * jitterY;
	}

	update() {
		const c = this.character;
		if (!c.alive) {
			c.intent.moveX = 0;
			c.intent.moveY = 0;
			return;
		}
		if (c.isActing) return;

		const target = this.world.player;
		if (!target || !target.alive) {
			c.intent.moveX = 0;
			c.intent.moveY = 0;
			return;
		}

		const dx = target.centerX - c.centerX;
		const dy = target.feetY - c.feetY;
		const detectRange = this.config.detectRange ?? 500;

		if (!this.activated && Math.abs(dx) < detectRange) this.activated = true;
		if (!this.activated) {
			c.intent.moveX = 0;
			c.intent.moveY = 0;
			return;
		}

		const stopX = (this.config.stop?.x ?? 100) + this._stopJitterX;
		const stopY = (this.config.stop?.y ?? 0) + this._stopJitterY;

		let ix = 0;
		let iy = 0;
		if (Math.abs(dx) > stopX) ix = Math.sign(dx);
		if (Math.abs(dy) > stopY) iy = Math.sign(dy);

		c.intent.moveX = ix;
		c.intent.moveY = iy;

		const nowMoving = ix !== 0 || iy !== 0;
		if (this._wasMoving && !nowMoving) this._speakLine();
		this._wasMoving = nowMoving;

		this._maybeSpeak();
	}

	_maybeSpeak() {
		if (this._speechCooldown > 0) {
			this._speechCooldown--;
			return;
		}
		const chance = this.config.speechChance ?? 0;
		if (chance === 0 || Math.random() >= chance) return;
		this._speakLine();
	}

	_speakLine() {
		const lines = this.config.speechLines ?? [];
		if (lines.length === 0) return;
		const line = lines[Math.floor(Math.random() * lines.length)];
		const sound = this.character.config.sounds?.[line];
		if (sound) sound.play();
		this._speechCooldown = 120;
	}
}
