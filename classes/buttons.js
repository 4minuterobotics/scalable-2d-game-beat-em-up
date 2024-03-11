import cross from '../img/buttons/cross.png';
import triangle from '../img/buttons/triangle.png';
import circle from '../img/buttons/circle.png';
import square from '../img/buttons/square.png';
import crossPressed from '../img/buttons/crossPressed.png';
import trianglePressed from '../img/buttons/trianglePressed.png';
import circlePressed from '../img/buttons/circlePressed.png';
import squarePressed from '../img/buttons/squarePressed.png';
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
class Buttons {
	constructor(width, height, sqrX, sqrY, triX, triY, circX, circY, crossX, crossY) {
		this.width = width;
		this.height = height;

		this.square = {
			xPos: sqrX,
			yPos: sqrY,
			pressed: false,
			img: createImage(square),
		};
		this.triangle = {
			xPos: triX,
			yPos: triY,
			pressed: false,
			img: createImage(triangle),
		};
		this.circle = {
			xPos: circX,
			yPos: circY,
			pressed: false,
			img: createImage(circle),
		};
		this.cross = {
			xPos: crossX,
			yPos: crossY,
			pressed: false,
			img: createImage(cross),
		};
	}

	updateButton(button, state) {
		switch (button) {
			case 'square':
				this.square.pressed = state;
				if (this.square.pressed) {
					this.square.img = createImage(squarePressed);
				} else {
					this.square.img = createImage(square);
				}
				break;
			case 'triangle':
				this.triangle.pressed = state;
				if (this.triangle.pressed) {
					this.triangle.img = createImage(trianglePressed);
				} else {
					this.triangle.img = createImage(triangle);
				}
				break;
			case 'circle':
				this.circle.pressed = state;
				if (this.circle.pressed) {
					this.circle.img = createImage(circlePressed);
				} else {
					this.circle.img = createImage(circle);
				}
				break;
			case 'cross':
				this.cross.pressed = state;
				if (this.cross.pressed) {
					this.cross.img = createImage(crossPressed);
				} else {
					this.cross.img = createImage(cross);
				}
				break;
		}

		this.draw();
	}

	draw() {
		c.drawImage(this.square.img, this.square.xPos, this.square.yPos, this.width, this.height); //this takes an image, x-value, and y-value
		c.drawImage(this.triangle.img, this.triangle.xPos, this.triangle.yPos, this.width, this.height); //this takes an image, x-value, and y-value
		c.drawImage(this.circle.img, this.circle.xPos, this.circle.yPos, this.width, this.height); //this takes an image, x-value, and y-value
		c.drawImage(this.cross.img, this.cross.xPos, this.cross.yPos, this.width, this.height); //this takes an image, x-value, and y-value
	}
}

//this function creates and returns the image objects
function createImage(imageSrc) {
	let image = new Image();
	image.src = imageSrc;
	return image;
}
export default Buttons;
