export default class HealthBar {
	constructor({ target, x = 20, y = 20, width = 220, height = 18, color = '#4dff4d', bg = '#1a1f1b' }) {
		this.target = target;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.bg = bg;
	}

	draw(ctx) {
		const pct = Math.max(0, this.target.health) / this.target.maxHealth;
		ctx.fillStyle = this.bg;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width * pct, this.height);
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 2;
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}
}
