export default class Joystick {
	constructor({ canvas, x, y, innerRadius, outerRadius, input }) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.input = input;
		this.X = x;
		this.Y = y;
		this.x = x;
		this.y = y;
		this.innerRadius = innerRadius;
		this.outerRadius = outerRadius;
		this.dx = 0;
		this.dy = 0;
		this._attach();
	}

	_attach() {
		const handleMove = (e) => {
			this.x = e.changedTouches[0].clientX;
			this.y = e.changedTouches[0].clientY;
			const ax = this.x - this.X;
			const ay = this.y - this.Y;
			const mag = Math.sqrt(ax * ax + ay * ay) || 1;
			this.dx = ax / mag;
			this.dy = ay / mag;
			if (mag > this.outerRadius) {
				this.x = this.X + this.dx * this.outerRadius;
				this.y = this.Y + this.dy * this.outerRadius;
			}
			this.input.setAxes(Math.round(this.dx), Math.round(this.dy));
		};
		this.canvas.addEventListener('touchstart', handleMove, { passive: true });
		this.canvas.addEventListener('touchmove', handleMove, { passive: true });
		this.canvas.addEventListener('touchend', () => {
			this.x = this.X;
			this.y = this.Y;
			this.dx = 0;
			this.dy = 0;
			this.input.setAxes(0, 0);
		});
	}

	draw() {
		const c = this.ctx;
		c.save();
		c.beginPath();
		c.arc(this.x, this.y, this.innerRadius, 0, Math.PI * 2);
		c.fillStyle = 'red';
		c.fill();
		c.restore();

		c.save();
		c.beginPath();
		c.arc(this.X, this.Y, this.outerRadius, 0, Math.PI * 2);
		c.lineWidth = 3;
		c.stroke();
		c.restore();
	}
}
