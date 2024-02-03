/*




mouseMoveMethod(callback function)

keyDownMethod(calback fucntion)

getElementAt(x,y)



*/

export let Randomizer = {
	nextInt(low, high) {
		// Ensure the low is less than high and both are integers
		if (typeof low !== 'number' || typeof high !== 'number' || low >= high) {
			throw new Error("Invalid arguments: 'low' should be less than 'high' and both should be numbers.");
		}
		// The Math.random() function returns a floating-point,
		// pseudo-random number in the range 0 to less than 1,
		// so we adjust it to our desired range and round it.
		return Math.floor(Math.random() * (high - low + 1) + low);
	},
	nextBoolean() {
		return Math.random() >= 0.5; // Math.random() returns a number between 0 (inclusive) and 1 (exclusive)
	},
};

export function readLine(promptMessage) {
	let userInput;
	while (true) {
		userInput = prompt(promptMessage);
		if (typeof userInput === 'string' && userInput) {
			// Check if the input is a string and not empty
			break;
		}
		alert('Please enter a valid string.');
	}
	return userInput;
}

export function readInt(message) {
	let input = prompt(message);
	let number = parseInt(input);

	// Check if the parsed input is an integer and not NaN (Not-a-Number)
	if (Number.isInteger(number)) {
		return number;
	} else {
		alert('Please enter a valid integer.');
		return readInt(message); // Recursive call if input is not a valid integer
	}
}

export function setTimer(callbackFunction, delay) {
	return setInterval(callbackFunction, delay);
}

export function stopTimer(timerId) {
	clearInterval(timerId);
}

////////////////////////////////????************* Canvas stuff*******************???????????*?/////////////////////
//use in main file and objet files
const canvasTest = document.querySelector('canvas');
const cTest = canvasTest.getContext('2d');

//use in main file an object files
// canvasTest.width = 1024;
// canvasTest.height = 576;

//use in main file and object files
export function getWidth() {
	return canvasTest.width;
}

//use in main file and object files
export function getHeight() {
	return canvasTest.height;
}

//use in canvas.js file
export function add(object) {
	object.add();
}

//use in object file
////////////////////////////////Rectangle class
export class Rectangle {
	constructor(width, height, color = 'Black') {
		this.ctx = cTest;
		this.width = width;
		this.height = height;
		this.color = color;
		this.position = {
			x: canvasTest.width / 2,
			y: canvasTest.height / 2,
		};
		this.debug = false; // Debug mode is initially off
	}

	setColor(color) {
		this.color = color;
	}

	setPosition(x, y) {
		this.position.x = x;
		this.position.y = y;
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
	}

	add() {
		this.ctx.fillStyle = this.color; // Use the current color
		this.ctx.fillRect(this.position.x, this.position.y, this.width, this.height); // Set the border of the rectangle

		// Check if debug mode is enabled
		if (this.debug) {
			// Draw red outline
			this.ctx.beginPath();
			this.ctx.strokeStyle = 'red';
			this.ctx.lineWidth = 2;
			this.ctx.rect(this.position.x, this.position.y, this.width, this.height);
			this.ctx.stroke();
			this.ctx.closePath();

			// Draw a small red circle at the anchor point (top-left corner)
			this.ctx.beginPath();
			this.ctx.fillStyle = 'red';
			this.ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, true); // A small circle radius of 5
			this.ctx.fill();
			this.ctx.closePath();
		}
	}

	// Method to enable debug mode
	setDebug(mode) {
		this.debug = mode;
	}
}

// Usage
//use in main file
// let rect = new Rectangle(100, 200);
// rect.setPosition(getWidth() / 2, getHeight() / 8);
// rect.setColor('blue');
// rect.setSize(25, 50);
// add(rect);

///////////////////////////

///////////////////////////

///////////////////////////Circle class
export class Circle {
	constructor(radius) {
		this.ctx = cTest;
		this.radius = radius;
		this.color = 'black';
		this.position = {
			x: canvasTest.width / 2,
			y: canvasTest.height / 2,
		};
		this.debug = false;
	}

	setColor(newColor) {
		this.color = newColor;
	}

	setPosition(x, y) {
		this.position.x = x;
		this.position.y = y;
	}

	setSize(radius) {
		this.radius = radius;
	}

	add() {
		this.ctx.beginPath();
		this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
		this.ctx.fillStyle = this.color; // Use the current color
		this.ctx.fill();
		this.ctx.closePath();

		// Check if debug mode is enabled
		if (this.debug) {
			this.ctx.beginPath();
			this.ctx.strokeStyle = 'red'; // Set the outline color to red
			this.ctx.lineWidth = 2; // Set the outline thickness
			this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
			this.ctx.stroke(); // Draw the outline
			this.ctx.closePath();

			// Draw a red dot at the center
			this.ctx.beginPath();
			this.ctx.fillStyle = 'red'; // Set the dot color to red
			this.ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2, true); // Small circle for the dot
			this.ctx.fill();
			this.ctx.closePath();
		}
	}
	// Method to enable debug mode
	setDebug(mode) {
		this.debug = mode;
	}
}
////////////////////////////////????************* Canvas stuff*******************???????????*?/////////////////////
