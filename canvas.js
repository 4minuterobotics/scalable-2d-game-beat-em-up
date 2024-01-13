import platform from './img/platform.png';
import tank1 from './img/tank-1.png';
import tank2 from './img/tank-2.png';
import tank3 from './img/tank-3.png';
import back from './img/back.png';
import support from './img/support.png';

import spriteRunLeft from './img/spriteRunLeft.png';
import spriteRunRight from './img/spriteRunRight.png';
import spriteStandLeft from './img/spriteStandLeft.png';
import spriteStandRight from './img/spriteStandRight.png';

import GenericObject from './classes/genericObjects';
import Player from './classes/player';
import Platform from './classes/platform';

import * as utils from './utils/index.js';
import * as imageStuff from './img/index.js';
const gravity = 1;

// utils.canvasStuff.create2dCanvasContext(canvas, 'canvas', c, '2d');
// utils.canvasStuff.set_canvas_size(1024, 576);
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

console.log(c);
console.log(canvas);

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

export { canvas, c };
//set the canvas to a set width and height

console.log(c);

//Image objects
let platformImage = createImage(platform);
let tank1Image = createImage(tank1);
let tank2Image = createImage(tank2);
let tank3Image = createImage(tank3);
let backImage = createImage(back);
let supportImage = createImage(support);

//background image values
let bgWidth = 800 * 1.5;
let bgHeight = 600 * 1.5;

//background tank values
let bgTankWidth = tank1Image.width * 3;
let bgTankHeight = tank1Image.height * 3;
let bgTank1Distance = 1000;
let bgTank2Distance = 800;
let bgTank3Distance = 1500;
let supportDistance = 1200;

//support beams values
let supportWidth = supportImage.width * 3;
let supportHeight = supportImage.height * 3;

//Creates and returns the image objects
function createImage(imageSrc) {
	let image = new Image();
	image.src = imageSrc;
	return image;
}

//Class objects
let player;
let platforms = []; // what player stands on
let stageBackgroundTiles = []; // parallex scrolled background and hills
let stageBackgroundItems = []; // tanks n stuff
let stageBackgroundItems2 = []; // more tanks
let stageBackgroundItems3 = []; // even more tanks
let stageForegroundItems = []; //  support beams

// button states
let lastKey = 'right';
let movementKeys = {
	right: {
		pressed: false,
	},
	left: {
		pressed: false,
	},
	up: {
		pressed: false,
	},
	down: {
		pressed: false,
	},
};
let actionKeys = {
	space: {
		pressed: false,
	},
	b: {
		pressed: false,
	},
	s: {
		pressed: false,
	},
};

//direction states
let direction = {
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
let lastDirection = {
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

//Tracks the players change in canvas x-position from its original position
let scrollOffset = 0;

function main() {
	init();
	animate();
}

main();

//this function will initialize the game objects
function init() {
	create_game_objects();
	//this variable will track the players change in canvas x-position from its original position
	scrollOffset = 0;
}

//this function loops every millisec
function animate() {
	window.requestAnimationFrame(animate); // this is a JavaScript function that caues code to repeat over n over

	c.fillStyle = 'white';
	c.fillRect(0, 0, canvas.width, canvas.height);

	//fill canvas with the color white
	// utils.canvasStuff.create_colored_canvas('white', 0, 0, utils.canvasStuff.canvas.width, utils.canvasStuff.canvas.height);

	//draw the bg and hills
	stageBackgroundTiles.forEach((background) => {
		background.draw();
	});

	//draw tank1 tanks
	stageBackgroundItems.forEach((item) => {
		item.draw();
	});
	//draw tank2 tanks
	stageBackgroundItems2.forEach((item) => {
		item.draw();
	});
	//draw tank3 tanks
	stageBackgroundItems3.forEach((item) => {
		item.draw();
	});

	//upadate the player spite frame number and crop position, then draws the sprite onto the screen, then updates its positon value
	player.update();

	//draw the support beams
	stageForegroundItems.forEach((beam) => {
		beam.draw();
	});

	/*************** action states ************/
	update_player_action_state_based_on_button_presses();

	/*************** things only allowed if the player isn't currently doing an action */
	if (player.doingSomething == false) {
		/************** direction states ************/
		update_player_direction_state_based_on_button_presses();

		/*************lateral movement and platform scrolling **************/

		adjust_player_x_velocity_and_background_and_foreground_based_on_player_x_position_and_direction_states();

		/***********Vertical movement **************/
		adjust_player_y_velocity_based_on_player_y_position_and_direction_states();

		/******* directional based sprite switching conditional. **********/
		if (JSON.stringify(direction) !== JSON.stringify(lastDirection)) {
			lastDirection = JSON.stringify(direction);
			update_player_directional_sprite_based_on_direction_state();
		}

		//player punching
		if (player.action.punch == true) {
			player.sound.punch.play();
			player.sound.myVoice.play();
			if (lastKey == 'right') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.punch.right, lastKey, player.sprites.punch.cropWidth, player.sprites.punch.width);
			} else if (lastKey == 'left') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.punch.left, lastKey, player.sprites.punch.cropWidth, player.sprites.punch.width);
			}
		} else if (player.action.bite == true) {
			player.sound.bite.play();
			player.sound.dragon.play();
			if (lastKey == 'right') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.bite.right, lastKey, player.sprites.bite.cropWidth, player.sprites.bite.width);
			} else if (lastKey == 'left') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.bite.left, lastKey, player.sprites.bite.cropWidth, player.sprites.bite.width);
			}
		} else if (player.action.swipe == true) {
			player.sound.swipe.play();
			player.sound.wetFart.play();
			if (lastKey == 'right') {
				player.reset_frames_and_sprite_counter();
				player.update_player_action_sprite_based_on_action_state(player.sprites.swipe.right, lastKey, player.sprites.swipe.cropWidth, player.sprites.swipe.width);
			} else if (lastKey == 'left') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.swipe.left, lastKey, player.sprites.swipe.cropWidth, player.sprites.swipe.width);
			}
		}
	}

	//win scenario
	if ((scrollOffset > platformImage.width * 5 + 400 - 2, 470)) {
		//console.log('you win');
	}

	//lose scenario
	if (player.position.y > canvas.height) {
		// console.log('you lose');
		init(); // reset player stats
	}

	/**********detect platform collision from top*********/
	//check to see if:
	//the player above the platform by seeing if the player y anchor value plus its height value is less than the platform anchor point value
	//the player's next change in position (velocity) is below the top of the platform by seeing if the player's y anchor value plus its height value plus its next change in position is greater than the anchor position of the platform
	//there is platform to the right of the player by seeing if the player's x anchor value plus its width value is greater than x anchor value of the platform
	//and there is platform to the left of the player by seeing if the player's x anchor value is less than the platforms x anchor value plus its width
	// platforms.forEach((platform) => {
	// 	if (
	// 		player.position.y + player.height <= platform.position.y &&
	// 		player.position.y + player.height + player.velocity.y >= platform.position.y &&
	// 		player.position.x + player.width >= platform.position.x &&
	// 		player.position.x <= platform.position.x + platform.width
	// 	) {
	// 		player.velocity.y = 0;
	// 		player.position.y = platform.position.y - player.height;
	// 	}

	/**********detect platform collision from bottom*********/
	/*	//check to see if:
		//the player below the platform by seeing if the player y anchor value is greater than the platform anchor point value plus its height
		//the player's next change in position (velocity) is above the bottom of the platform by seeing if the player's y anchor value plus its next change in position is less than the platform y-anchor position + its height
		//there is platform to the right of the player by seeing if the player's x anchor value plus its width value is greater than x anchor value of the platform
		//and there is platform to the left of the player by seeing if the player's x anchor value is less than the platforms x anchor value plus its width
		if (
			player.position.y >= platform.position.y + platform.height &&
			player.position.y + player.velocity.y <= platform.position.y + platform.height &&
			player.position.x + player.width >= platform.position.x &&
			player.position.x <= platform.position.x + platform.width
		) {
			player.velocity.y = 0;
			player.position.y = platform.position.y + platform.height;
		}*/

	// });
}

function create_game_objects() {
	player = new Player();

	platforms = [
		// accepts x,y,image
		new Platform(-1, 470, platformImage), // first standing platform
		new Platform(platformImage.width, 470, platformImage), // 2nd platform with x-positiion set 1 platform width away from the origin
		new Platform(platformImage.width * 2, 470, platformImage), // 3rd platform with x-position set 2 platform widths + 100 px away from the origin to create a death pit
		new Platform(platformImage.width * 3, 470, platformImage), // 4th platform with x-position set 3 platform widths + 300 px away from the origin
		new Platform(platformImage.width * 4, 470, platformImage), // 5th platform with x-position set 4 platform widths + 300 px away from the origin
		new Platform(platformImage.width * 5, 470, platformImage), // 6th platform with x-position set 4 platform widths + 300 px away from the origin
		new Platform(platformImage.width * 6, 470, platformImage), // 7th platform with x-position set 4 platform widths + 300 px away from the origin
		new Platform(platformImage.width * 7, 470, platformImage), // 8th platform with x-position set 4 platform widths + 300 px away from the origin
	];

	stageBackgroundTiles = utils.stageStuff.createStageBackgroundTiles(15, -320, bgWidth, bgHeight, backImage);
	stageForegroundItems = utils.stageStuff.createStageItems(10, 50, 0, supportDistance, supportWidth, supportHeight, supportImage);

	//tank 1
	stageBackgroundItems = utils.stageStuff.createStageItems(10, bgTank1Distance, canvas.height - 595, bgTank1Distance, bgTankWidth, bgTankHeight, tank1Image);

	//tank2
	stageBackgroundItems2 = utils.stageStuff.createStageItems(10, bgTank2Distance, canvas.height - 595, bgTank2Distance, bgTankWidth, bgTankHeight, tank2Image);

	//tank 3
	stageBackgroundItems3 = utils.stageStuff.createStageItems(10, bgTank3Distance, canvas.height - 595, bgTank3Distance, bgTankWidth, bgTankHeight, tank3Image);
	// stageBackgroundItems3 = utils.stageStuff.createStageItems(
	// 	10,
	// 	imageStuff.bgItems.darkBgItems.darkTank.x_gap,
	// 	imageStuff.bgItems.darkBgItems.darkTank.y,
	// 	imageStuff.bgItems.darkBgItems.darkTank.x_gap,
	// 	imageStuff.bgItems.darkBgItems.darkTank.width,
	// 	imageStuff.bgItems.darkBgItems.darkTank.height,
	// 	imageStuff.bgItems.darkBgItems.darkTank.image
	// );
}

function update_player_action_state_based_on_button_presses() {
	//punching
	if (actionKeys.space.pressed == true) {
		player.action.punch = true;
	}
	//biting
	else if (actionKeys.b.pressed == true) {
		player.action.bite = true;
	}
	//swiping
	else if (actionKeys.s.pressed == true) {
		player.action.swipe = true;
	}
}

function update_player_direction_state_based_on_button_presses() {
	//right
	if (movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == false) {
		direction.right = true;
		direction.left = false;
		direction.up = false;
		direction.down = false;
		direction.upRight = false;
		direction.downRight = false;
		direction.upLeft = false;
		direction.downLeft = false;
		direction.stop = false;
		// console.log('right pressed');

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//left
	else if (movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == false && movementKeys.down.pressed == false) {
		direction.right = false;
		direction.left = true;
		direction.up = false;
		direction.down = false;
		direction.upRight = false;
		direction.downRight = false;
		direction.upLeft = false;
		direction.downLeft = false;
		direction.stop = false;
		// console.log('left pressed');

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//up
	else if (movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == true && movementKeys.down.pressed == false) {
		direction.right = false;
		direction.left = false;
		direction.up = true;
		direction.down = false;
		direction.upRight = false;
		direction.downRight = false;
		direction.upLeft = false;
		direction.downLeft = false;
		direction.stop = false;
		// console.log('up pressed');

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//down
	else if (movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == true) {
		direction.right = false;
		direction.left = false;
		direction.up = false;
		direction.down = true;
		direction.upRight = false;
		direction.downRight = false;
		direction.upLeft = false;
		direction.downLeft = false;
		direction.stop = false;
		// console.log('down pressed');

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//up right
	else if (movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == true && movementKeys.down.pressed == false) {
		// console.log('up right pressed');
		direction.right = false;
		direction.left = false;
		direction.up = false;
		direction.down = false;
		direction.upRight = true;
		direction.downRight = false;
		direction.upLeft = false;
		direction.downLeft = false;
		direction.stop = false;

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//down right
	else if (movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == true) {
		// console.log('down right pressed');
		direction.right = false;
		direction.left = false;
		direction.up = false;
		direction.down = false;
		direction.upRight = false;
		direction.downRight = true;
		direction.upLeft = false;
		direction.downLeft = false;
		direction.stop = false;

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//up left
	else if (movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == true && movementKeys.down.pressed == false) {
		// console.log('up left pressed');
		direction.right = false;
		direction.left = false;
		direction.up = false;
		direction.down = false;
		direction.upRight = false;
		direction.downRight = false;
		direction.upLeft = true;
		direction.downLeft = false;
		direction.stop = false;

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//down left
	else if (movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == false && movementKeys.down.pressed == true) {
		// console.log('down left pressed');
		direction.right = false;
		direction.left = false;
		direction.up = false;
		direction.down = false;
		direction.upRight = false;
		direction.downRight = false;
		direction.upLeft = false;
		direction.downLeft = true;
		direction.stop = false;

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//nothing pressed
	else if (movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == false) {
		// console.log('Nothing pressed');
		direction.right = false;
		direction.left = false;
		direction.up = false;
		direction.down = false;
		direction.upRight = false;
		direction.downRight = false;
		direction.upLeft = false;
		direction.downLeft = false;
		direction.stop = true;

		player.step.one == false;
	}
}

function adjust_player_x_velocity_and_background_and_foreground_based_on_player_x_position_and_direction_states() {
	if (direction.right == true && player.position.x < 50) {
		player.velocity.x = player.speed;
	} else if ((direction.upRight == true || direction.downRight == true) && player.position.x < 50) {
		player.velocity.x = player.speed / 2;
	} else if ((direction.left == true && player.position.x > -100) || (direction.left == true && scrollOffset == 0 && player.position.x > -380)) {
		player.velocity.x = -player.speed;
	} else if (
		((direction.upLeft == true || direction.downLeft == true) && player.position.x > -100) ||
		((direction.upLeft == true || direction.downLeft == true) && scrollOffset == 0 && player.position.x > -380)
	) {
		player.velocity.x = -player.speed / 2;
	} else if (
		direction.right == false &&
		direction.upRight == false &&
		direction.downRight == false &&
		direction.left == false &&
		direction.upLeft == false &&
		direction.downLeft == false
	) {
		player.velocity.x = 0;
	} else {
		player.velocity.x = 0;
		if (direction.right == true) {
			//console.log('scroll offset', scrollOffset);
			scrollOffset += player.speed;
			platforms.forEach((platform) => {
				platform.position.x -= player.speed;
			});
			stageForegroundItems.forEach((beam) => {
				beam.position.x -= player.speed;
			});
			stageBackgroundItems.forEach((item) => {
				item.position.x -= player.speed * 0.66;
			});
			stageBackgroundItems2.forEach((item) => {
				item.position.x -= player.speed * 0.66;
			});
			stageBackgroundItems3.forEach((item) => {
				item.position.x -= player.speed * 0.66;
			});
			stageBackgroundTiles.forEach((background) => {
				background.position.x -= player.speed * 0.66; // move the background hills a little slower than everything else
			});
		} else if (direction.upRight == true || direction.downRight == true) {
			scrollOffset += player.speed / 2;
			stageBackgroundItems.forEach((item) => {
				item.position.x -= (player.speed * 0.66) / 2;
			});
			stageBackgroundItems2.forEach((item) => {
				item.position.x -= (player.speed * 0.66) / 2;
			});
			stageBackgroundItems3.forEach((item) => {
				item.position.x -= (player.speed * 0.66) / 2;
			});
			platforms.forEach((platform) => {
				platform.position.x -= player.speed / 2;
			});
			stageForegroundItems.forEach((beam) => {
				beam.position.x -= player.speed / 2;
			});
			stageBackgroundTiles.forEach((background) => {
				background.position.x -= (player.speed * 0.66) / 2; // move the background hills a little slower than everything else
			});
		} else if (direction.left == true && scrollOffset > 0) {
			//console.log('scroll offset', scrollOffset);
			scrollOffset -= player.speed;
			stageBackgroundItems.forEach((item) => {
				item.position.x += player.speed * 0.66;
			});
			stageBackgroundItems2.forEach((item) => {
				item.position.x += player.speed * 0.66;
			});
			stageBackgroundItems3.forEach((item) => {
				item.position.x += player.speed * 0.66;
			});
			platforms.forEach((platform) => {
				platform.position.x += player.speed;
			});
			stageForegroundItems.forEach((beam) => {
				beam.position.x += player.speed;
			});

			stageBackgroundTiles.forEach((background) => {
				background.position.x += player.speed * 0.66; // move the background hills a little slower than everything else
			});
		} else if ((direction.upLeft == true || direction.downLeft == true) && scrollOffset > 0) {
			scrollOffset -= player.speed / 2;
			stageBackgroundItems.forEach((item) => {
				item.position.x += (player.speed * 0.66) / 2;
			});
			stageBackgroundItems2.forEach((item) => {
				item.position.x += (player.speed * 0.66) / 2;
			});
			stageBackgroundItems3.forEach((item) => {
				item.position.x += (player.speed * 0.66) / 2;
			});
			platforms.forEach((platform) => {
				platform.position.x += player.speed / 2;
			});
			stageForegroundItems.forEach((beam) => {
				beam.position.x += player.speed / 2;
			});
			stageBackgroundTiles.forEach((background) => {
				background.position.x += (player.speed * 0.66) / 2; // move the background hills a little slower than everything else
			});
		}
	}
}

function adjust_player_y_velocity_based_on_player_y_position_and_direction_states() {
	if (direction.up == true && player.position.y >= canvas.height - 480) {
		player.velocity.y = -player.speed;

		// console.log('go up. Player position :', player.position);
	} else if ((direction.upRight == true || direction.upLeft == true) && player.position.y >= canvas.height - 480) {
		player.velocity.y = -player.speed / 2;

		// console.log('go angled up. Player position :', player.position);
	} else if (direction.down == true && player.position.y + player.height - 290 <= canvas.height) {
		player.velocity.y = player.speed;
		// console.log('go down. Player position :', player.position);
	} else if ((direction.downRight == true || direction.downLeft == true) && player.position.y + player.height - 290 <= canvas.height) {
		player.velocity.y = player.speed / 2;
		// console.log('go angled down. Player position :', player.position);
	} else if (
		direction.up == false &&
		direction.upRight == false &&
		direction.upLeft == false &&
		direction.down == false &&
		direction.downRight == false &&
		direction.downLeft == false
	) {
		player.velocity.y = 0;
	} else {
		player.velocity.y = 0;
	}
}

function update_player_directional_sprite_based_on_direction_state() {
	//change to run right sprite
	if (
		(direction.up == true || direction.down == true || direction.right == true || direction.upRight == true || direction.downRight == true) &&
		lastKey == 'right' &&
		player.currentSprite != player.sprites.run.right
	) {
		player.reset_frames_and_sprite_counter();
		player.change_sprite_based_on_direction_input(player.sprites.run.right, 'right', player.sprites.run.cropWidth, player.sprites.run.width);
	}

	//change to run left sprite
	else if (
		(direction.up == true || direction.down == true || direction.left == true || direction.upLeft == true || direction.downLeft == true) &&
		lastKey == 'left' &&
		player.currentSprite != player.sprites.run.left
	) {
		player.reset_frames_and_sprite_counter();
		player.change_sprite_based_on_direction_input(player.sprites.run.left, 'left', player.sprites.run.cropWidth, player.sprites.run.width);
	}

	//change to idle left sprite
	else if (direction.stop == true && lastKey == 'left' && player.currentSprite != player.sprites.stand.left) {
		player.reset_frames_and_sprite_counter();
		player.change_sprite_based_on_direction_input(player.sprites.stand.left, 'left', player.sprites.stand.cropWidth, player.sprites.stand.width);
	}

	//change to idle right sprite
	else if (direction.stop == true && lastKey == 'right' && player.currentSprite != player.sprites.stand.right) {
		player.reset_frames_and_sprite_counter();
		player.change_sprite_based_on_direction_input(player.sprites.stand.right, 'right', player.sprites.stand.cropWidth, player.sprites.stand.width);
	}
}

// add event listeners for the keys. specify as a string what event is getting called
window.addEventListener('keydown', (event) => {
	console.log(event);
	switch (event.key) {
		case 'ArrowUp':
			//console.log('up');
			if (player.startAnimation == false && player.doingSomething == false) {
				movementKeys.up.pressed = true;
			}
			break;

		case 'ArrowDown':
			// console.log('down');
			if (player.startAnimation == false && player.doingSomething == false) {
				movementKeys.down.pressed = true;
			}
			break;

		case 'ArrowLeft':
			// console.log('left');
			if (player.startAnimation == false && player.doingSomething == false) {
				movementKeys.left.pressed = true;
				lastKey = 'left';
			}
			break;

		case 'ArrowRight':
			// console.log('right');
			if (player.startAnimation == false && player.doingSomething == false) {
				movementKeys.right.pressed = true;
				lastKey = 'right';
			}
			break;

		case ' ':
			if (player.startAnimation == false && player.doingSomething == false) {
				actionKeys.space.pressed = true;
			}
			break;

		case 'b':
			// console.log('b');
			if (player.startAnimation == false && player.doingSomething == false) {
				actionKeys.b.pressed = true;
			}
			break;

		case 's':
			// console.log('s');
			if (player.startAnimation == false && player.doingSomething == false) {
				actionKeys.s.pressed = true;
			}
			break;
	}
	// console.log(movementKeys.right.pressed);
});

window.addEventListener('keyup', (event) => {
	switch (event.key) {
		case 'ArrowUp':
			// console.log('up');
			movementKeys.up.pressed = false;
			break;

		case 'ArrowDown':
			// console.log('duck');
			movementKeys.down.pressed = false;

			break;

		case 'ArrowLeft':
			// console.log('left');
			movementKeys.left.pressed = false;
			break;

		case 'ArrowRight':
			// console.log('right');
			movementKeys.right.pressed = false;
			break;

		case ' ':
			console.log('space');
			actionKeys.space.pressed = false;
			break;

		case 'b':
			console.log('space');
			actionKeys.b.pressed = false;
			break;

		case 's':
			console.log('space');
			actionKeys.s.pressed = false;
			break;
	}
	// console.log(movementKeys.right.pressed);
});

// function calcPics() {
// 	let start = {
// 		pics: 20,
// 		width: 900 * 20 + 900 / 2,
// 		name: 'start',
// 	};

// 	let idle = {
// 		pics: 13,
// 		width: 900 * 13 + 900 / 2,
// 		name: 'idle',
// 	};

// 	let bite = {
// 		pics: 8,
// 		width: 900 * 8 + 900 / 2,
// 		name: 'bite',
// 	};

// 	let swipe = {
// 		pics: 7,
// 		width: 900 * 7 + 900 / 2,
// 		name: 'swipe',
// 	};

// 	let punch = {
// 		pics: 3,
// 		width: 900 * 3 + 900 / 2,
// 		name: 'punch',
// 	};

// 	let special = {
// 		pics: 18,
// 		width: 900 * 18 + 900 / 2,
// 		name: 'special',
// 	};

// 	let crawl = {
// 		pics: 9,
// 		width: 900 * 9 + 900 / 2,
// 		name: 'crawl',
// 	};

// 	let walk = {
// 		pics: 10,
// 		width: 900 * 10 + 900 / 2,
// 		name: 'walk',
// 	};

// 	let currentSelection = swipe;

// 	let pics = currentSelection.pics;
// 	console.log('');
// 	console.log('');
// 	console.log('sprite sheet dimensions for: ', currentSelection.pics, ' ', currentSelection.name, ' pics.');
// 	console.log('width: ', currentSelection.width);
// 	console.log('height: 200');

// 	// calc left foot at center of a 900 image
// 	if (currentSelection == walk) {
// 		for (let i = 0; i < pics; i++) {
// 			let booty = 900 * i + 900 / 2 + 40;
// 			console.log('Image ', i + 1, 'booty: ', booty);
// 		}
// 	} else if (currentSelection == bite) {
// 		for (let i = 0; i < pics; i++) {
// 			let leftSideFootFacingRight = 900 * i + 900 / 2;
// 			console.log('Image ', i + 1, 'outside of left foot when facing right: ', leftSideFootFacingRight);
// 		}
// 		console.log('--------------');
// 		for (let i = 0; i < pics; i++) {
// 			let rightSideFootFacingleft = 900 * i + 900 / 2 + 104;
// 			console.log('Image ', i + 1, 'outside of right foot when facing left: ', rightSideFootFacingleft);
// 		}
// 	} else {
// 		for (let i = 0; i < pics; i++) {
// 			let leftSideFoot = 900 * i + 900 / 2;
// 			console.log('Image ', i + 1, 'Outside of left side foot: ', leftSideFoot);
// 		}
// 	}
// }

// calcPics();

function calcNeilPics() {
	let walk = {
		pics: 4,
		width: 200 * 4 + 200 / 2,
		name: 'walk',
	};

	let currentSelection = walk;

	let pics = currentSelection.pics;
	console.log('');
	console.log('');
	console.log('sprite sheet dimensions for: ', currentSelection.pics, ' ', currentSelection.name, ' pics.');
	console.log('width: ', currentSelection.width);
	console.log('height: 200');

	// calc left foot at center of a 200 image
	if (currentSelection == walk) {
		for (let i = 0; i < pics; i++) {
			let booty = 200 * i + 200 / 2 + 40;
			console.log('Image ', i + 1, 'booty: ', booty);
		}
	} else {
		for (let i = 0; i < pics; i++) {
			let leftSideFoot = 200 * i + 200 / 2;
			console.log('Image ', i + 1, 'Outside of left side foot: ', leftSideFoot);
		}
	}
}

calcNeilPics();
