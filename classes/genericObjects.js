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
	}

	draw() {
		// c.fillStyle = 'blue';
		// c.fillRect(this.position.x, this.position.y, this.width, this.height);

		//drawImage(image, dx, dy, dWidth, dHeight)
		c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height); //this takes an image, x-value, and y-value
	}
}

export default GenericObject;
