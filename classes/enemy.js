// import spriteWalkLeft from '../img/character-sprites/neil/walk-left-sprite.png';
import spriteWalkLeft from '../img/character-sprites/neil/walk-left-sprite.png';
import spriteWalkRight from '../img/character-sprites/neil/walk-right-sprite.png';
import spriteIdleLeft from '../img/character-sprites/neil/idle-left-sprite.png';
import spriteIdleRight from '../img/character-sprites/neil/idle-right-sprite.png';

import wassupMp3File from '../sounds/neil-wassup.mp3';
import wheresYourIdMp3File from '../sounds/neil-wheres-your-id.mp3';

// import * as utils from '../utils/index.js';

import { Howl, Howler } from 'howler'; // for audio

// //these variables store the image objects
// let playerStandLeftImage = createImage(spriteIdleLeft);
// let playerStandRightImage = createImage(spriteIdleRight);
// let playerRunLeftImage = createImage(spriteRunLeft);
// let playerRunRightImage = createImage(spriteRunRight);

//this variable should hold the value of the width of each individually cropped sprite image
const INDIVIDUAL_SPRITE_WIDTH = 200;

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const gravity = 1;

/*****Enemy class ******/
class Enemy {
	constructor() {
		//the enemy properties
		this.position = {
			x: 300,
			y: canvas.height - 200,
		};
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.spriteOffset = 35;
		this.speed = 5;
		this.width = INDIVIDUAL_SPRITE_WIDTH;
		this.height = 200;
		this.debug = true;
		this.startAnimation = false;
		this.doingSomething = false;
		this.frames = 0;
		this.spriteCounter = 0;
		this.refreshRate = 8; // the lower the faster
		this.sprites = {
			run: {
				right: createImage(spriteWalkRight),
				left: createImage(spriteWalkLeft),
				cropWidth: INDIVIDUAL_SPRITE_WIDTH,
				width: INDIVIDUAL_SPRITE_WIDTH,
				images: 4,
			},
			stand: {
				right: createImage(spriteIdleRight),
				left: createImage(spriteIdleLeft),
				cropWidth: INDIVIDUAL_SPRITE_WIDTH,
				width: INDIVIDUAL_SPRITE_WIDTH,
				images: 1,
			},
		};
		this.currentSprite = this.sprites.stand.right;
		this.currentCropWidth = INDIVIDUAL_SPRITE_WIDTH;
		this.lastDirection = 'left';
		this.directionState = {
			right: false,
			left: false,
			up: false,
			down: false,
			upRight: false,
			downRight: false,
			upLeft: false,
			downLeft: false,
			stop: true,
		};
		this.lastDirectionState = {
			right: false,
			left: false,
			up: false,
			down: false,
			upRight: false,
			downRight: false,
			upLeft: false,
			downLeft: false,
			stop: true,
		};
		this.action = {
			punch: false,
			bite: false,
			swipe: false,
		};
		this.sound = {
			wassup: createSound(wassupMp3File),
			wheresYourId: createSound(wheresYourIdMp3File),
		};
		this.step = {
			one: false,
			two: false,
		};
	}
	//the player methods
	draw() {
		/*Starter Rectangle
		c.fillStyle = 'red';
		c.fillRect(this.position.x, this.position.y, this.width, this.height);
        */

		/* Sprite sheet prameters
		//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        */
		c.drawImage(
			this.currentSprite, // sprite image
			this.currentCropWidth * this.spriteCounter + 20, //sub rectangele x-position  (starts at 0 and increaes by the width of each animation)
			0, // sub rectangle y-position
			this.currentCropWidth, // sub rectangle width (width of 1 animation)
			200, // sub rectangle height
			this.position.x, // canvas x-position
			this.position.y, // canvas y-position
			this.width, // width on canvas
			this.height // height on canvas
		);

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

	increment_frames_and_sprite_counter() {
		this.frames++; // incremementing this number by 1 will create a multiplier for the x position of the sprite sheet for animation
		if (this.frames % this.refreshRate == 0) {
			this.spriteCounter++;
		}
	}

	reset_frames_and_sprite_counter() {
		this.frames = 0;
		this.spriteCounter = 0;
	}

	change_current_sprite_image(img) {
		this.currentSprite = img;
	}

	play_first_footStep() {
		this.step.one = true;
		this.sound.woodStep.play();
	}

	play_second_footStep() {
		this.step.two = true;
		this.sound.woodStep.play();
	}

	reset_footsteps() {
		this.step.one = false;
		this.step.two = false;
	}

	set_sprite_to_idle() {
		if (this.lastDirection == 'left') {
			this.currentSprite = this.sprites.stand.left;
			this.currentCropWidth = this.sprites.stand.cropWidth;
			this.width = this.sprites.stand.width;
		} else if (this.lastDirection == 'right') {
			this.currentSprite = this.sprites.stand.right;
			this.currentCropWidth = this.sprites.stand.cropWidth;
			this.width = this.sprites.stand.width;
		}
	}

	//movement state updates
	set_movement_state_to_right() {
		//right
		this.directionState.right = true;
		this.directionState.left = false;
		this.directionState.up = false;
		this.directionState.down = false;
		this.directionState.upRight = false;
		this.directionState.downRight = false;
		this.directionState.upLeft = false;
		this.directionState.downLeft = false;
		this.directionState.stop = false;
		// console.log('right pressed');
	}

	set_movement_state_to_left() {
		//left
		this.directionState.right = false;
		this.directionState.left = true;
		this.directionState.up = false;
		this.directionState.down = false;
		this.directionState.upRight = false;
		this.directionState.downRight = false;
		this.directionState.upLeft = false;
		this.directionState.downLeft = false;
		this.directionState.stop = false;
		// console.log('left pressed');
	}

	set_movement_state_to_up() {
		//up
		this.directionState.right = false;
		this.directionState.left = false;
		this.directionState.up = true;
		this.directionState.down = false;
		this.directionState.upRight = false;
		this.directionState.downRight = false;
		this.directionState.upLeft = false;
		this.directionState.downLeft = false;
		this.directionState.stop = false;
		// console.log('up pressed');
	}

	set_movement_state_to_down() {
		//down
		this.directionState.right = false;
		this.directionState.left = false;
		this.directionState.up = false;
		this.directionState.down = true;
		this.directionState.upRight = false;
		this.directionState.downRight = false;
		this.directionState.upLeft = false;
		this.directionState.downLeft = false;
		this.directionState.stop = false;
		// console.log('down pressed');
	}

	set_movement_state_to_up_right() {
		// up right
		this.directionState.right = false;
		this.directionState.left = false;
		this.directionState.up = false;
		this.directionState.down = false;
		this.directionState.upRight = true;
		this.directionState.downRight = false;
		this.directionState.upLeft = false;
		this.directionState.downLeft = false;
		this.directionState.stop = false;
		// console.log('up right pressed');
	}

	set_movement_state_to_down_right() {
		// down right
		this.directionState.right = false;
		this.directionState.left = false;
		this.directionState.up = false;
		this.directionState.down = false;
		this.directionState.upRight = false;
		this.directionState.downRight = true;
		this.directionState.upLeft = false;
		this.directionState.downLeft = false;
		this.directionState.stop = false;
		// console.log('down right pressed');
	}

	set_movement_state_to_up_left() {
		//up left
		this.directionState.right = false;
		this.directionState.left = false;
		this.directionState.up = false;
		this.directionState.down = false;
		this.directionState.upRight = false;
		this.directionState.downRight = false;
		this.directionState.upLeft = true;
		this.directionState.downLeft = false;
		this.directionState.stop = false;
		// console.log('up left pressed');
	}

	set_movement_state_to_down_left() {
		//down left
		this.directionState.right = false;
		this.directionState.left = false;
		this.directionState.up = false;
		this.directionState.down = false;
		this.directionState.upRight = false;
		this.directionState.downRight = false;
		this.directionState.upLeft = false;
		this.directionState.downLeft = true;
		this.directionState.stop = false;
		// console.log('down left pressed');
	}

	set_movement_state_to_stop() {
		// stop
		this.directionState.right = false;
		this.directionState.left = false;
		this.directionState.up = false;
		this.directionState.down = false;
		this.directionState.upRight = false;
		this.directionState.downRight = false;
		this.directionState.upLeft = false;
		this.directionState.downLeft = false;
		this.directionState.stop = true;
		// console.log('Nothing pressed');
	}

	//horizontal x-direction movement functions
	move_right_full_speed() {
		this.velocity.x = this.speed;
	}
	move_left_full_speed() {
		this.velocity.x = -this.speed;
	}
	move_right_half_speed() {
		this.velocity.x = this.speed / 2;
	}
	move_left_half_speed() {
		this.velocity.x = -this.speed / 2;
	}
	stop_horizontal_movement() {
		this.velocity.x = 0;
	}

	//vertical y-direction movement functions
	move_up_full_speed() {
		this.velocity.y = -this.speed;
	}
	move_down_full_speed() {
		this.velocity.y = this.speed;
	}
	move_up_half_speed() {
		this.velocity.y = -this.speed / 2;
	}
	move_down_half_speed() {
		this.velocity.y = this.speed / 2;
	}
	stop_vertical_movement() {
		this.velocity.y = 0;
	}

	change_sprite_based_on_direction_input(sprite, lastDir, cropWidth, width) {
		this.currentSprite = sprite;
		this.lastDirection = lastDir;
		this.currentCropWidth = cropWidth;
		this.width = width;
	}

	update_player_action_sprite_based_on_action_state(sprite, lastDir, cropWidth, width) {
		this.doingSomething = true;
		this.reset_frames_and_sprite_counter();
		this.currentSprite = sprite;
		this.lastDirection = lastDir;
		this.currentCropWidth = cropWidth;
		this.width = width;
		this.velocity.y = 0;
		this.velocity.x = 0;
	}

	update() {
		this.increment_frames_and_sprite_counter();

		//stop the starting animation after 20 frames and reset the frames
		// if (this.spriteCounter == this.sprites.start.images && this.startAnimation == true) {
		// 	this.startAnimation = false;
		// 	this.reset_frames_and_sprite_counter();
		// 	this.change_current_sprite_image(this.sprites.stand.right);
		// }

		//cycled through standing images
		if (this.spriteCounter == this.sprites.stand.images && (this.currentSprite == this.sprites.stand.right || this.currentSprite == this.sprites.stand.left)) {
			this.reset_frames_and_sprite_counter();
		}

		//player halfway through running images
		// else if (
		// 	this.spriteCounter == this.sprites.run.images / 2 &&
		// 	this.step.two == false &&
		// 	(this.currentSprite == this.sprites.run.right || this.currentSprite == this.sprites.run.left)
		// ) {
		// 	this.play_second_footStep();
		// }

		//player cycled through running images
		else if (this.spriteCounter == this.sprites.run.images && (this.currentSprite == this.sprites.run.right || this.currentSprite == this.sprites.run.left)) {
			this.reset_frames_and_sprite_counter();
			this.reset_footsteps();
		}

		/*
		//player cycled through punch images
		else if (this.spriteCounter == this.sprites.punch.images && (this.currentSprite == this.sprites.punch.right || this.currentSprite == this.sprites.punch.left)) {
			this.reset_frames_and_sprite_counter();
			this.doingSomething = false;
			this.action.punch = false;
			this.set_sprite_to_idle();
		}

		//player cycled through bite images
		else if (this.spriteCounter == this.sprites.bite.images && (this.currentSprite == this.sprites.bite.right || this.currentSprite == this.sprites.bite.left)) {
			this.reset_frames_and_sprite_counter();
			this.doingSomething = false;
			this.action.bite = false;
			this.set_sprite_to_idle();
		}

		//player cycled through swipe images
		else if (this.spriteCounter == this.sprites.swipe.images && (this.currentSprite == this.sprites.swipe.right || this.currentSprite == this.sprites.swipe.left)) {
			this.reset_frames_and_sprite_counter();
			this.doingSomething = false;
			this.action.swipe = false;
			this.set_sprite_to_idle();
		}
        */

		//"2"
		this.draw();

		/**position update***/
		//update the x and y-position for the next frame to be itself plus the evergrowing value of the velocity due to gravity.
		this.position.y += this.velocity.y;
		this.position.x += this.velocity.x;

		/*Falling: if the object still has canvas room to fall, increase the value of the changing y-direction (increase the velocity).
		if (this.position.y + this.height + this.velocity.y <= canvas.height) {
			this.velocity.y += gravity; //"10"
		} else {
		// 	otherwise, set the change in y position to zero, and set the position to be the height of the canvas minus the height of the object.
		 	this.velocity.y = 0;
		 	this.position.y = canvas.height - this.height;
		 }
        */
	}
}

//this function creates and returns the image objects
function createImage(imageSrc) {
	let image = new Image();
	image.src = imageSrc;
	return image;
}

function createSound(audioSrc) {
	let audio = new Howl({ src: [audioSrc] });
	audio.src = audioSrc;
	return audio;
}

export default Enemy;
