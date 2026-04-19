export default class Camera {
	constructor({ viewportWidth, viewportHeight, worldMin = 0, worldMax = Infinity }) {
		this.viewportWidth = viewportWidth;
		this.viewportHeight = viewportHeight;
		this.x = 0;
		this.worldMin = worldMin;
		this.worldMax = worldMax;
		this.bandLeft = 0.35;
		this.bandRight = 0.55;
	}

	follow(target) {
		const bl = this.viewportWidth * this.bandLeft;
		const br = this.viewportWidth * this.bandRight;
		const anchor = target.x + target.width / 2;
		const screenX = anchor - this.x;
		if (screenX > br) this.x += screenX - br;
		if (screenX < bl) this.x -= bl - screenX;
		if (this.x < this.worldMin) this.x = this.worldMin;
		const maxScroll = this.worldMax - this.viewportWidth;
		if (this.worldMax !== Infinity && this.x > maxScroll) this.x = maxScroll;
	}

	toScreen(worldX, parallax = 1) {
		return worldX - this.x * parallax;
	}
}
