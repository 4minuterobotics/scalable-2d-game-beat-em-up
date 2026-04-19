export default class Game {
	constructor({ canvas, scene }) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.scene = scene;
		this.running = false;
		this.paused = false;
	}

	setScene(scene) {
		this.scene = scene;
	}

	start() {
		if (this.running) return;
		this.running = true;
		requestAnimationFrame(this._tick);
	}

	pause() {
		this.paused = true;
	}

	resume() {
		this.paused = false;
	}

	_tick = () => {
		if (!this.running) return;
		if (!this.paused && this.scene) {
			this.ctx.fillStyle = 'white';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.scene.update();
			this.scene.draw(this.ctx);
		}
		requestAnimationFrame(this._tick);
	};
}
