export default class Layer {
	constructor({ id, parallax = 1, items = [] }) {
		this.id = id;
		this.parallax = parallax;
		this.items = items;
	}

	draw(ctx, camera) {
		for (const item of this.items) {
			const sx = camera.toScreen(item.x, this.parallax);
			if (sx + item.width < 0 || sx > camera.viewportWidth) continue;
			ctx.drawImage(item.image, sx, item.y, item.width, item.height);
		}
	}
}
