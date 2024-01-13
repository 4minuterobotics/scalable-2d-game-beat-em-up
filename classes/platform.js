const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

/******Platform class ********/
class Platform {
	constructor(x, y, image) {
		this.image = image;
		this.width = image.width;
		this.height = image.height;

		this.position = {
			x: x,
			y: y,
		};
	}

	draw() {
		// c.fillStyle = 'blue';
		// c.fillRect(this.position.x, this.position.y, this.width, this.height);
		c.drawImage(this.image, this.position.x, this.position.y); //this takes an image, x-value, and y-value
	}
}

export default Platform;
