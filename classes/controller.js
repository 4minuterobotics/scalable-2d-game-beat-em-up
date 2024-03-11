const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
class JoyStick {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;

		this.X = x;
		this.Y = y;
		this.R = r * 2.5;

		this.dx = 0;
		this.dy = 0;
	}

	draw() {
		//inner circle
		c.save();
		c.beginPath();
		c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
		c.fillStyle = 'red';
		c.fill();
		c.restore();

		//outer circle
		c.save();
		c.beginPath();
		c.arc(this.X, this.Y, this.R, 0, Math.PI * 2);
		c.lineWidth = 3;
		c.stroke();
		c.restore();
	}

	drawText() {
		c.font = '20px Arial';
		c.fillText('x: ' + Math.round(this.dx) + ' y: ' + Math.round(this.dy), 50, 50);
	}
}

export default JoyStick;
