const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

/******Generic Object class ********/
class GenericObject {
	constructor(x, y, dWidth, dHeight, image, interactive) {
		this.image = image;
		this.width = dWidth;
		this.height = dHeight;
		this.position = {
			x: x,
			y: y,
		};
		this.interactive = interactive;
		this.debug = false; // Debug mode is off by default

		// this.image.onload = () => {
		// 	this.loaded = true;
		// };
	}

	draw() {
		// c.fillStyle = 'blue';
		// c.fillRect(this.position.x, this.position.y, this.width, this.height);

		//drawImage(image, dx, dy, dWidth, dHeight)
		c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height); //this takes an image, x-value, and y-value

		if (this.debug) {
			// Draw red outline
			c.strokeStyle = 'red';
			c.lineWidth = 2;
			c.strokeRect(this.position.x, this.position.y, this.width, this.height);

			// Draw a small red circle at the anchor point (top-left corner)
			c.beginPath();
			c.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, true); // Small circle with radius 5
			c.fillStyle = 'red';
			c.fill();
		}
	}
	setDebug(mode) {
		this.debug = mode;
	}
}

export default GenericObject;
