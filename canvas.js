/*
--------------------------------To-do list
-put player health bar on the screen 
-make player health drop periodically once in collision range. Eventually cause enemy to attack at those periodic times
-add different enemies than neil
-add music to intro screen
-add music to game 
-add video to the beginning
-put harvey scenes in the game
-put drew in the game

*/

import { Player, PlayerAttackCollision } from './classes/player';
import Enemy from './classes/enemy.js';
import { stage, createStageItems, createEnemyWaves } from './utils/stageStuff.js';
import { Circle, Rectangle, add, getHeight, getWidth, setTimer, stopTimer, Randomizer } from './codeHS.js';
const gravity = 1;

document.addEventListener('DOMContentLoaded', function () {
	// Add an event listener to the first element with the class name 'lawrenceGameStart'
	const lawrenceGameStartButton = document.querySelector('.lawrenceGameStart');
	if (lawrenceGameStartButton) {
		lawrenceGameStartButton.addEventListener('click', function () {
			// Hide elements with the class name 'homeScreen'
			const homeScreens = document.getElementsByClassName('homeScreen');
			for (let i = 0; i < homeScreens.length; i++) {
				homeScreens[i].style.display = 'none';
			}

			// Display the element with the id 'gameMenu'
			document.getElementById('gameMenu').style.display = 'block';
		});
	}

	// Add an event listener to the element with the id 'startGame'
	const startGameButton = document.getElementById('startGame');
	if (startGameButton) {
		startGameButton.addEventListener('click', function () {
			// Hide the element with the id 'gameMenu'
			document.getElementById('gameMenu').style.display = 'none';

			// Display the canvas element
			document.querySelector('canvas').style.display = 'block';

			// Initialize or start the game here
			main();
		});
	}
});

document.addEventListener('keydown', function (event) {
	if (event.key === 'm' || event.key === 'M') {
		const pauseMenu = document.getElementById('pauseMenu');
		const canvas = document.querySelector('canvas');

		if (canvas.style.display === 'block') {
			// Ensures it works only when the game is visible
			pauseMenu.style.display = pauseMenu.style.display === 'none' ? 'block' : 'none';
			// Add logic to pause or resume the game based on the pauseMenu's visibility
		}
	}
});
///////////////////////////////////////////////

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

//set the canvas to a set width and height
canvas.width = 1024;
canvas.height = 576;

console.log(c);
console.log(canvas);

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

console.log(c);

let currentLevel = 0;

//Class objects
let player;
let collisionCloud;
let neil;
let stageBackgroundTiles = []; // parallex scrolled background and hills
let stageBackgroundItems = []; // human tanks
let stageForegroundItems = []; //  support beams
let closeBgItems = [];
let farBgItems = [];
let veryFarBgItems = [];
let horizonBgItems = [];

//objects that can move in front and behind each other
export let moveableItems = [];

//enemy objects that can be hit
let enemyWave = [];
export let enemies = [];

//all stage objects
export let allStageItems = [];

let foregroundParallexRate = 5;
let stageParallexRate = 0.66;
let closeBgParallexRate = 0.13;
let farBgParallexRate = 0.09;
let veryFarParallexRate = 0.05;

// button states for player
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

//Tracks the players change in canvas x-position from its original position
let scrollOffset = 0;

/**
 * Initializes the game and starts the animation loop.
 */
function main() {
	create_game_objects(); //creates the images and game objects
	animate();
}

scrollOffset = 0; //this variable will track the players change in canvas x-position from its original position

/*************************helper functions*****************************/
function create_game_objects() {
	//stage objects
	stage[currentLevel].foregroundItems?.forEach((item, index) => {
		// foreground items
		stageForegroundItems[index] = createStageItems(item.numberOfItems, item.firstItemX, item.y, item.spacing, item.width, item.height, item.image);
	});
	stage[currentLevel].bgTiles?.forEach((item, index) => {
		// stage background itmes
		stageBackgroundTiles[index] = createStageItems(item.numberOfItems, item.firstItemX, item.y, item.spacing, item.width, item.height, item.image);
	});
	stage[currentLevel].bgItems?.forEach((item, index) => {
		// stage background itmes
		stageBackgroundItems[index] = createStageItems(item.numberOfItems, item.firstItemX, item.y, item.spacing, item.width, item.height, item.image);
	});
	stage[currentLevel].closeBgItems?.forEach((item, index) => {
		// close bg items
		closeBgItems[index] = createStageItems(item.numberOfItems, item.firstItemX, item.y, item.spacing, item.width, item.height, item.image);
	});
	stage[currentLevel].farBgItems?.forEach((item, index) => {
		// far bg items
		farBgItems[index] = createStageItems(item.numberOfItems, item.firstItemX, item.y, item.spacing, item.width, item.height, item.image);
	});
	stage[currentLevel].veryFarBgItems?.forEach((item, index) => {
		// very far bg items
		veryFarBgItems[index] = createStageItems(item.numberOfItems, item.firstItemX, item.y, item.spacing, item.width, item.height, item.image);
	});
	stage[currentLevel].horizonBgItems?.forEach((item, index) => {
		// still horizon items
		horizonBgItems[index] = createStageItems(item.numberOfItems, item.firstItemX, item.y, item.spacing, item.width, item.height, item.image);
	});

	//player object
	player = new Player();
	allStageItems.push(player);
	moveableItems.push(player);

	//attack collision cloud
	collisionCloud = new PlayerAttackCollision();
	allStageItems.push(collisionCloud);

	/*
	// other character object
	// 1st param is distance the wave of enemeis from the start of the level. 2nd param is their y position, 3rd param is their speed
	neil = new Enemy(1000, Randomizer.nextInt(canvas.height - 400, canvas.height - 200), Randomizer.nextInt(1, 3));
	allStageItems.push(neil);
	moveableItems.push(neil);
	enemies.push(neil);
	*/

	// enemies
	stage[currentLevel].enemyWave?.forEach((wave, index) => {
		enemyWave[index] = createEnemyWaves(wave.numberOfEnemies, wave.xPos, wave.yPos, wave.speed, wave.health);
	});

	// moveableItems?.forEach((item) => {
	// 	console.log('cur sprt: ', item);
	// });

	// enemyWave?.forEach((wave) => {
	// 	wave?.forEach((enemy) => {
	// 		moveableItems.push(enemy);
	//		enemies.push(enemy);
	// 		console.log('descrip: ', enemy.speed);
	// 	});
	// });
}

//this function loops every millisec
function animate() {
	// console.log(player.position.x + scrollOffset);

	c.fillStyle = 'white';
	c.fillRect(0, 0, canvas.width, canvas.height);

	//drawing items
	const drawItems = (items) => {
		items?.forEach((item) => {
			item.draw();
		});
	};

	veryFarBgItems?.forEach((typeOfVeryFarBgItem) => {
		drawItems(typeOfVeryFarBgItem);
	});
	horizonBgItems?.forEach((typeOfHorizonBgItem) => {
		drawItems(typeOfHorizonBgItem);
	});
	farBgItems?.forEach((typeOfFarBgItem) => {
		drawItems(typeOfFarBgItem);
	});
	closeBgItems?.forEach((typeOfCloseBgItem) => {
		drawItems(typeOfCloseBgItem);
	});
	stageBackgroundTiles?.forEach((typeOfStageTile) => {
		drawItems(typeOfStageTile);
	});
	stageBackgroundItems?.forEach((typeOfStageBgItem) => {
		drawItems(typeOfStageBgItem);
	});

	//all items that can change order on the screen get rendered based on their y value here
	moveableItems?.sort((a, b) => {
		return a.position.y + a.height - (b.position.y + b.height);
	});
	moveableItems?.forEach((item) => {
		item.update();
	});

	//for plarer attack impacts
	if (collisionCloud.madeContact == true) {
		collisionCloud.update(player.position.x, player.position.y, player.width, player.height);
	}

	stageForegroundItems?.forEach((typeOfForegroundItem) => {
		drawItems(typeOfForegroundItem);
	});

	/*************** action states ************/
	update_player_action_state_based_on_button_presses();

	/*************** things only allowed if the player isn't currently doing an action */
	if (player.doingSomething == false) {
		/************** player direction states ************/
		update_player_direction_state_based_on_button_presses();

		/*************lateral movement and platform scrolling **************/

		adjust_player_x_velocity_and_background_and_foreground_based_on_player_x_position_and_direction_states();

		/***********Vertical movement **************/
		adjust_player_y_velocity_based_on_player_y_position_and_direction_states();

		/******* directional based sprite switching conditional. **********/
		handle_player_directional_sprite_based_on_direction_state();

		/******* action based sprite switching conditional. **********/
		handle_action_sprite_changes_based_on_action_state();
	}

	/*
	////////////////////////////////////////////////////////////////////////////////
	if (Math.abs(neil.centerX - player.centerX) < 500) {
		neil.isActivated = true;
	}
	if (neil.isActivated) {
		// update_enemy_action_state_based_on_difficulty();

		// update_enemy_direction_state_based_on_button_presses();
		update_boss_direction_state_based_on_player_position();

		adjust_boss_x_velocity_based_on_direction_states();
		//adjust_enemy_x_velocity_based_on_player_position_and_difficulty();

		adjust_boss_y_velocity_based_on_direction_states();
		//adjust_enemy_y_velocity_based_on_player_position_and_difficulty();

		handle_boss_directional_sprite_based_on_direction_state();

		// handle_action_sprite_changes_based_on_enemy_action_state();
	}
*/

	////////////////////////////////////////////////////////////////////////////////
	let enemyObjects = moveableItems.filter((obj) => obj instanceof Enemy);

	enemyObjects?.forEach((enemy) => {
		if (Math.abs(enemy.centerX - player.centerX) < 500) {
			enemy.isActivated = true;
		}

		if (enemy.isActivated) {
			// update_enemy_action_state_based_on_difficulty();

			// update_enemy_direction_state_based_on_button_presses();
			update_enemy_direction_state_based_on_player_position(enemy);

			adjust_enemy_x_velocity_based_on_direction_states(enemy);
			//adjust_enemy_x_velocity_based_on_player_position_and_difficulty();

			adjust_enemy_y_velocity_based_on_direction_states(enemy);
			//adjust_enemy_y_velocity_based_on_player_position_and_difficulty();

			handle_enemy_directional_sprite_based_on_direction_state(enemy);

			// handle_action_sprite_changes_based_on_enemy_action_state();
		}
	});

	//win scenario
	if (scrollOffset > stage[currentLevel].endOfStageX) {
		//console.log('you win');
	}

	//lose scenario
	if (player.position.y > canvas.height) {
		// console.log('you lose');
		init(); // reset player stats
	}

	window.requestAnimationFrame(animate); // this is a JavaScript function that caues code to repeat over n over
}

function update_player_action_state_based_on_button_presses() {
	//punching
	if (actionKeys.space.pressed == true) {
		player.action.punch.state = true;
	}
	//biting
	else if (actionKeys.b.pressed == true) {
		player.action.bite.state = true;
	}
	//swiping
	else if (actionKeys.s.pressed == true) {
		player.action.swipe.state = true;
	}
}

function update_player_direction_state_based_on_button_presses() {
	//movement condtions placed in loop to register button presses
	let right_was_pressed = movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == false;
	let left_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == false && movementKeys.down.pressed == false;
	let up_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	let down_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	let up_right_was_pressed = movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	let down_right_was_pressed =
		movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	let up_left_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	let down_left_was_pressed =
		movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	let no_directional_keys_pressed =
		movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == false;

	//right
	if (right_was_pressed) {
		player.set_movement_state_to_right();

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//left
	else if (left_was_pressed) {
		player.set_movement_state_to_left();

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//up
	else if (up_was_pressed) {
		player.set_movement_state_to_up();

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//down
	else if (down_was_pressed) {
		player.set_movement_state_to_down();

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//up right
	else if (up_right_was_pressed) {
		player.set_movement_state_to_up_right();

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//down right
	else if (down_right_was_pressed) {
		player.set_movement_state_to_down_right();

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//up left
	else if (up_left_was_pressed) {
		player.set_movement_state_to_up_left();

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//down left
	else if (down_left_was_pressed) {
		player.set_movement_state_to_down_left();

		if (player.step.one == false) {
			player.play_first_footStep();
		}
	}
	//nothing pressed
	else if (no_directional_keys_pressed) {
		player.set_movement_state_to_stop();

		player.step.one == false;
	}
}

/************************************************************************************________________________________******* enemy */
function update_enemy_direction_state_based_on_player_position(enemy) {
	//movement condtions placed in loop to register button presses
	// let right_was_pressed = movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == false;
	// let left_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == false && movementKeys.down.pressed == false;
	// let up_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	// let down_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	// let up_right_was_pressed = movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	// let down_right_was_pressed =
	// 	movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	// let up_left_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	// let down_left_was_pressed =
	// 	movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	// let no_directional_keys_pressed =
	// 	movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == false;

	///////////////////may need to include offset value to get this to work
	let player_to_the_left = enemy.centerX >= player.centerX + enemy.stoppingDistance.x;
	let player_to_the_right = enemy.centerX <= player.centerX - enemy.stoppingDistance.x;
	let player_is_above = enemy.position.y + enemy.height - enemy.stoppingDistance.y > player.position.y + player.height;
	let player_is_below = enemy.position.y + enemy.height + enemy.stoppingDistance.y < player.position.y + player.height;

	let player_is_above_and_right = player_is_above && player_to_the_right;
	let player_is_above_and_left = player_is_above && player_to_the_left;
	let player_is_below_and_right = player_is_below && player_to_the_right;
	let player_is_below_and_left = player_is_below && player_to_the_left;

	//right
	if (player_to_the_right) {
		enemy.sound.speaking = false;
		if (player_is_above_and_right) {
			enemy.set_movement_state_to_up_right();
		} else if (player_is_below_and_right) {
			enemy.set_movement_state_to_down_right();
		} else {
			enemy.set_movement_state_to_right();
		}
	}
	//left
	else if (player_to_the_left) {
		enemy.sound.speaking = false;
		if (player_is_above_and_left) {
			enemy.set_movement_state_to_up_left();
		} else if (player_is_below_and_left) {
			enemy.set_movement_state_to_down_left();
		} else {
			enemy.set_movement_state_to_left();
		}
	} else {
		//above
		if (enemy.position.y + enemy.height - enemy.stoppingDistance.y > player.position.y + player.height) {
			enemy.sound.speaking = false;
			enemy.set_movement_state_to_up();
		}
		//below
		else if (player_is_below) {
			enemy.sound.speaking = false;
			enemy.set_movement_state_to_down();
		}
		//within range
		else {
			enemy.set_movement_state_to_stop();
			enemy.step.one == false;
			if (enemy.sound.speaking == false) {
				enemy.sound.speaking = true;
				let soundClip = Randomizer.nextInt(1, 2);
				if (soundClip == 1) {
					enemy.sound.wheresYourId.play();
				} else {
					enemy.sound.wassup.play();
				}
			}
		}
	}
}
/************************************************************************************________________________________******* enemy */

/************************************************************************************________________________________******* boss */
/*
function update_boss_direction_state_based_on_player_position() {
	//movement condtions placed in loop to register button presses
	// let right_was_pressed = movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == false;
	// let left_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == false && movementKeys.down.pressed == false;
	// let up_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	// let down_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	// let up_right_was_pressed = movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	// let down_right_was_pressed =
	// 	movementKeys.right.pressed == true && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	// let up_left_was_pressed = movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == true && movementKeys.down.pressed == false;
	// let down_left_was_pressed =
	// 	movementKeys.right.pressed == false && movementKeys.left.pressed == true && movementKeys.up.pressed == false && movementKeys.down.pressed == true;
	// let no_directional_keys_pressed =
	// 	movementKeys.right.pressed == false && movementKeys.left.pressed == false && movementKeys.up.pressed == false && movementKeys.down.pressed == false;

	///////////////////may need to include offset value to get this to work
	let player_to_the_left = neil.centerX >= player.centerX + 100;
	let player_to_the_right = neil.centerX <= player.centerX - 100;
	let player_is_above = neil.position.y + neil.height - 10 > player.position.y + player.height;
	let player_is_below = neil.position.y + neil.height + 10 < player.position.y + player.height;

	let player_is_above_and_right = player_is_above && player_to_the_right;
	let player_is_above_and_left = player_is_above && player_to_the_left;
	let player_is_below_and_right = player_is_below && player_to_the_right;
	let player_is_below_and_left = player_is_below && player_to_the_left;

	//right
	if (player_to_the_right) {
		neil.sound.speaking = false;
		if (player_is_above_and_right) {
			neil.set_movement_state_to_up_right();
		} else if (player_is_below_and_right) {
			neil.set_movement_state_to_down_right();
		} else {
			neil.set_movement_state_to_right();
		}
	}
	//left
	else if (player_to_the_left) {
		neil.sound.speaking = false;
		if (player_is_above_and_left) {
			neil.set_movement_state_to_up_left();
		} else if (player_is_below_and_left) {
			neil.set_movement_state_to_down_left();
		} else {
			neil.set_movement_state_to_left();
		}
	} else {
		//above
		if (neil.position.y + neil.height - 10 > player.position.y + player.height) {
			neil.sound.speaking = false;
			neil.set_movement_state_to_up();
		}
		//below
		else if (player_is_below) {
			neil.sound.speaking = false;
			neil.set_movement_state_to_down();
		}
		//within range
		else {
			neil.set_movement_state_to_stop();
			neil.step.one == false;
			if (neil.sound.speaking == false) {
				neil.sound.speaking = true;
				let soundClip = Randomizer.nextInt(1, 2);
				if (soundClip == 1) {
					neil.sound.wheresYourId.play();
				} else {
					neil.sound.wassup.play();
				}
			}
		}
	}
}
*/
/************************************************************************************________________________________******* boss */

function adjust_player_x_velocity_and_background_and_foreground_based_on_player_x_position_and_direction_states() {
	//console.log('scroll offset', scrollOffset);
	let player_is_moving_right_and_hasnt_reached_its_far_right_edge = player.directionState.right == true && player.position.x < player.position.farRightEdge;

	let player_is_moving_angled_right_and_hasnt_reached_its_far_right_edge =
		(player.directionState.upRight == true || player.directionState.downRight == true) && player.position.x < player.position.farRightEdge;

	let player_is_moving_left_while_offset_and_hasnt_reached_its_far_left_edge =
		player.directionState.left == true && player.position.x > player.position.leftEdgeWhileOffsetted;

	let player_is_moving_left_while_NOT_offset_and_hasnt_reached_its_far_left_edge_of_the_screen =
		player.directionState.left == true && scrollOffset == 0 && player.position.x > player.position.leftEdgeWithNoOffset;

	let player_is_moving_angled_left_while_offset_and_hasnt_reached_its_far_left_edge =
		(player.directionState.upLeft == true || player.directionState.downLeft == true) && player.position.x > player.position.leftEdgeWhileOffsetted;

	let player_is_moving_left_angled_while_NOT_offset_and_hasnt_reached_its_far_left_edge_of_the_screen =
		(player.directionState.upLeft == true || player.directionState.downLeft == true) && scrollOffset == 0 && player.position.x > player.position.leftEdgeWithNoOffset;

	let player_isnt_moving_left_or_right =
		player.directionState.right == false &&
		player.directionState.upRight == false &&
		player.directionState.downRight == false &&
		player.directionState.left == false &&
		player.directionState.upLeft == false &&
		player.directionState.downLeft == false;

	/*********************************** logic starts here********************************/
	if (player_is_moving_right_and_hasnt_reached_its_far_right_edge) {
		player.move_right_full_speed();
	} else if (player_is_moving_angled_right_and_hasnt_reached_its_far_right_edge) {
		player.move_right_half_speed();
	} else if (
		player_is_moving_left_while_offset_and_hasnt_reached_its_far_left_edge ||
		player_is_moving_left_while_NOT_offset_and_hasnt_reached_its_far_left_edge_of_the_screen
	) {
		player.move_left_full_speed();
	} else if (
		player_is_moving_angled_left_while_offset_and_hasnt_reached_its_far_left_edge ||
		player_is_moving_left_angled_while_NOT_offset_and_hasnt_reached_its_far_left_edge_of_the_screen
	) {
		player.move_left_half_speed();
	} else if (player_isnt_moving_left_or_right) {
		player.stop_horizontal_movement();
	} else {
		player.stop_horizontal_movement();
		if (player.directionState.right == true) {
			move_the_stage_objects_left_full_speed();
		} else if (player.directionState.upRight == true || player.directionState.downRight == true) {
			move_the_stage_objects_left_halfspeed();
		} else if (player.directionState.left == true && scrollOffset > 0) {
			move_the_stage_objects_right_full_speed();
		} else if ((player.directionState.upLeft == true || player.directionState.downLeft == true) && scrollOffset > 0) {
			move_the_stage_objects_right_half_speed();
		}
	}

	///////////////////////////////////////////////////////////// helper functions
	function move_the_stage_objects_left_full_speed() {
		scrollOffset += player.speed;

		//very far background items
		for (let i = 0; i < veryFarBgItems.length; i++) {
			veryFarBgItems[i]?.forEach((item) => {
				item.position.x -= player.speed * veryFarParallexRate;
			});
		}
		//far background items
		for (let i = 0; i < farBgItems.length; i++) {
			farBgItems[i]?.forEach((item) => {
				item.position.x -= player.speed * farBgParallexRate;
			});
		}
		//close background items
		for (let i = 0; i < closeBgItems.length; i++) {
			closeBgItems[i]?.forEach((item) => {
				item.position.x -= player.speed * closeBgParallexRate;
			});
		}
		//background items
		for (let i = 0; i < stageBackgroundItems.length; i++) {
			stageBackgroundItems[i]?.forEach((item) => {
				item.position.x -= player.speed * stageParallexRate;
			});
		}
		//stage background tiles
		for (let i = 0; i < stageBackgroundTiles.length; i++) {
			stageBackgroundTiles[i]?.forEach((item) => {
				item.position.x -= player.speed * stageParallexRate;
			});
		}

		//enemies
		for (let i = 0; i < enemyWave.length; i++) {
			enemyWave[i]?.forEach((enemy) => {
				enemy.position.x -= player.speed * stageParallexRate;
			});
		}

		/*
		//boss
		neil.position.x -= player.speed * stageParallexRate;
*/

		//foreground items
		for (let i = 0; i < stageForegroundItems.length; i++) {
			stageForegroundItems[i]?.forEach((item) => {
				item.position.x -= player.speed;
			});
		}
	}

	function move_the_stage_objects_left_halfspeed() {
		scrollOffset += player.speed / 2;

		//very far background items
		veryFarBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x -= (player.speed * veryFarParallexRate) / 2;
			});
		});
		//far background items
		farBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x -= (player.speed * farBgParallexRate) / 2;
			});
		});
		//close background items
		closeBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x -= (player.speed * closeBgParallexRate) / 2;
			});
		});
		//background items
		stageBackgroundItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x -= (player.speed * stageParallexRate) / 2;
			});
		});
		//stage background tiles
		stageBackgroundTiles.forEach((group) => {
			group?.forEach((item) => {
				item.position.x -= (player.speed * stageParallexRate) / 2;
			});
		});

		//enemies
		for (let i = 0; i < enemyWave.length; i++) {
			enemyWave[i]?.forEach((enemy) => {
				enemy.position.x -= (player.speed * stageParallexRate) / 2;
			});
		}

		/*
		//boss
		neil.position.x -= (player.speed * stageParallexRate) / 2;
*/

		//foreground items
		stageForegroundItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x -= player.speed / 2;
			});
		});
	}

	function move_the_stage_objects_right_full_speed() {
		scrollOffset -= player.speed;

		//very far background items
		veryFarBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += player.speed * veryFarParallexRate;
			});
		});
		//far background items
		farBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += player.speed * farBgParallexRate;
			});
		});
		//close background items
		closeBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += player.speed * closeBgParallexRate;
			});
		});
		//background items
		stageBackgroundItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += player.speed * stageParallexRate;
			});
		});
		//background tiles
		stageBackgroundTiles.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += player.speed * stageParallexRate;
			});
		});

		//enemies
		enemyWave.forEach((wave) => {
			wave?.forEach((enemy) => {
				enemy.position.x += player.speed * stageParallexRate;
			});
		});

		/*
		//boss
		neil.position.x += player.speed * stageParallexRate;
*/

		//foreground items
		stageForegroundItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += player.speed;
			});
		});
	}

	function move_the_stage_objects_right_half_speed() {
		scrollOffset -= player.speed / 2;

		//very far background items
		veryFarBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += (player.speed * veryFarParallexRate) / 2;
			});
		});
		//far background items
		farBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += (player.speed * farBgParallexRate) / 2;
			});
		});
		//close background items
		closeBgItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += (player.speed * closeBgParallexRate) / 2;
			});
		});
		//background items
		stageBackgroundItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += (player.speed * stageParallexRate) / 2;
			});
		});
		//background tiles
		stageBackgroundTiles.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += (player.speed * stageParallexRate) / 2;
			});
		});

		//enemies
		enemyWave.forEach((wave) => {
			wave?.forEach((enemy) => {
				enemy.position.x += (player.speed * stageParallexRate) / 2;
			});
		});

		/*
		//boss
		neil.position.x += (player.speed * stageParallexRate) / 2;
*/

		//foregroung items
		stageForegroundItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += player.speed / 2;
			});
		});
	}
}

/******************************************************************************************************************* enemy */
function adjust_enemy_x_velocity_based_on_direction_states(enemy) {
	//console.log('scroll offset', scrollOffset);
	let enemy_is_moving_right = enemy.directionState.right == true;

	let enemy_is_moving_left = enemy.directionState.left == true;

	let enemy_is_moving_angled_left = enemy.directionState.upLeft == true || enemy.directionState.downLeft;

	let enemy_is_moving_angled_right = enemy.directionState.upRight == true || enemy.directionState.downRight;

	let enemy_isnt_moving_left_or_right =
		enemy.directionState.right == false &&
		enemy.directionState.upRight == false &&
		enemy.directionState.downRight == false &&
		enemy.directionState.left == false &&
		enemy.directionState.upLeft == false &&
		enemy.directionState.downLeft == false;

	/*********************************** logic starts here********************************/
	if (enemy_is_moving_right) {
		enemy.move_right_full_speed();
	} else if (enemy_is_moving_angled_right) {
		enemy.move_right_half_speed();
	} else if (enemy_is_moving_left) {
		enemy.move_left_full_speed();
	} else if (enemy_is_moving_angled_left) {
		enemy.move_left_half_speed();
	} else if (enemy_isnt_moving_left_or_right) {
		enemy.stop_horizontal_movement();
	} else {
		enemy.stop_horizontal_movement();
	}
}
/******************************************************************************************************************* enemy */

/******************************************************************************************************************* boss */
/*
function adjust_boss_x_velocity_based_on_direction_states() {
	//console.log('scroll offset', scrollOffset);
	let enemy_is_moving_right = neil.directionState.right == true;

	let enemy_is_moving_left = neil.directionState.left == true;

	let enemy_is_moving_angled_left = neil.directionState.upLeft == true || neil.directionState.downLeft;

	let enemy_is_moving_angled_right = neil.directionState.upRight == true || neil.directionState.downRight;

	let enemy_isnt_moving_left_or_right =
		neil.directionState.right == false &&
		neil.directionState.upRight == false &&
		neil.directionState.downRight == false &&
		neil.directionState.left == false &&
		neil.directionState.upLeft == false &&
		neil.directionState.downLeft == false;

	///////////////////////////////////////// logic starts here ///////////////////////////////////////
	if (enemy_is_moving_right) {
		neil.move_right_full_speed();
	} else if (enemy_is_moving_angled_right) {
		neil.move_right_half_speed();
	} else if (enemy_is_moving_left) {
		neil.move_left_full_speed();
	} else if (enemy_is_moving_angled_left) {
		neil.move_left_half_speed();
	} else if (enemy_isnt_moving_left_or_right) {
		neil.stop_horizontal_movement();
	} else {
		neil.stop_horizontal_movement();
	}
}
*/
/******************************************************************************************************************* boss */

function adjust_player_y_velocity_based_on_player_y_position_and_direction_states() {
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	let player_is_moving_up_and_hasnt_reached_its_top_border = player.directionState.up == true && player.position.y >= canvas.height - 480;
	let player_is_moving_angled_up_and_hasnt_reached_its_top_border =
		(player.directionState.upRight == true || player.directionState.upLeft == true) && player.position.y >= canvas.height - 480;
	let player_is_moving_down_and_hasnt_reached_its_bottom_border = player.directionState.down == true && player.position.y + player.height + 10 <= canvas.height;
	let player_is_moving_angled_down_and_hasnt_reached_its_bottom_border =
		(player.directionState.downRight == true || player.directionState.downLeft == true) && player.position.y + player.height + 10 <= canvas.height;
	let player_isnt_moving =
		player.directionState.up == false &&
		player.directionState.upRight == false &&
		player.directionState.upLeft == false &&
		player.directionState.down == false &&
		player.directionState.downRight == false &&
		player.directionState.downLeft == false;

	/*********************************** logic starts here********************************/
	if (player_is_moving_up_and_hasnt_reached_its_top_border) {
		player.move_up_full_speed();
		// console.log('go up. Player position :', player.position);
	} else if (player_is_moving_angled_up_and_hasnt_reached_its_top_border) {
		player.move_up_half_speed();
		// console.log('go angled up. Player position :', player.position);
	} else if (player_is_moving_down_and_hasnt_reached_its_bottom_border) {
		player.move_down_full_speed();
		// console.log('go down. Player position :', player.position);
	} else if (player_is_moving_angled_down_and_hasnt_reached_its_bottom_border) {
		player.move_down_half_speed();
		// console.log('go angled down. Player position :', player.position);
	} else if (player_isnt_moving) {
		player.stop_vertical_movement();
	} else {
		player.stop_vertical_movement();
	}
}

/********************************************************************************************************************** enemy */
function adjust_enemy_y_velocity_based_on_direction_states(enemy) {
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	let enemy_is_moving_up_and_hasnt_reached_its_top_border = enemy.directionState.up == true;
	let enemy_is_moving_angled_up_and_hasnt_reached_its_top_border = enemy.directionState.upRight == true || enemy.directionState.upLeft == true;
	let enemy_is_moving_down_and_hasnt_reached_its_bottom_border = enemy.directionState.down == true;
	let enemy_is_moving_angled_down_and_hasnt_reached_its_bottom_border = enemy.directionState.downRight == true || enemy.directionState.downLeft == true;
	let enemy_isnt_moving =
		enemy.directionState.up == false &&
		enemy.directionState.upRight == false &&
		enemy.directionState.upLeft == false &&
		enemy.directionState.down == false &&
		enemy.directionState.downRight == false &&
		enemy.directionState.downLeft == false;

	/*********************************** logic starts here********************************/
	if (enemy_is_moving_up_and_hasnt_reached_its_top_border) {
		enemy.move_up_full_speed();
		// console.log('go up. Enemy position :', enemy.position);
	} else if (enemy_is_moving_angled_up_and_hasnt_reached_its_top_border) {
		enemy.move_up_half_speed();
		// console.log('go angled up. Enemy position :', enemy.position);
	} else if (enemy_is_moving_down_and_hasnt_reached_its_bottom_border) {
		enemy.move_down_full_speed();
		// console.log('go down. Enemy position :', enemy.position);
	} else if (enemy_is_moving_angled_down_and_hasnt_reached_its_bottom_border) {
		enemy.move_down_half_speed();
		// console.log('go angled down. Enemy position :', enemy.position);
	} else if (enemy_isnt_moving) {
		enemy.stop_vertical_movement();
	} else {
		enemy.stop_vertical_movement();
	}
}
/************************************************************************************************************************* enemy */

/**********************************************************************************************************************boss */
/*
function adjust_boss_y_velocity_based_on_direction_states() {
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	let enemy_is_moving_up_and_hasnt_reached_its_top_border = neil.directionState.up == true;
	let enemy_is_moving_angled_up_and_hasnt_reached_its_top_border = neil.directionState.upRight == true || neil.directionState.upLeft == true;
	let enemy_is_moving_down_and_hasnt_reached_its_bottom_border = neil.directionState.down == true;
	let enemy_is_moving_angled_down_and_hasnt_reached_its_bottom_border = neil.directionState.downRight == true || neil.directionState.downLeft == true;
	let enemy_isnt_moving =
		neil.directionState.up == false &&
		neil.directionState.upRight == false &&
		neil.directionState.upLeft == false &&
		neil.directionState.down == false &&
		neil.directionState.downRight == false &&
		neil.directionState.downLeft == false;

	////////////////////////////////////////// logic starts here //////////////////////////////////////////
	if (enemy_is_moving_up_and_hasnt_reached_its_top_border) {
		neil.move_up_full_speed();
		// console.log('go up. Enemy position :', neil.position);
	} else if (enemy_is_moving_angled_up_and_hasnt_reached_its_top_border) {
		neil.move_up_half_speed();
		// console.log('go angled up. Enemy position :', neil.position);
	} else if (enemy_is_moving_down_and_hasnt_reached_its_bottom_border) {
		neil.move_down_full_speed();
		// console.log('go down. Enemy position :', neil.position);
	} else if (enemy_is_moving_angled_down_and_hasnt_reached_its_bottom_border) {
		neil.move_down_half_speed();
		// console.log('go angled down. Enemy position :', neil.position);
	} else if (enemy_isnt_moving) {
		neil.stop_vertical_movement();
	} else {
		neil.stop_vertical_movement();
	}
}
*/
/*************************************************************************************************************************boss*/

function handle_player_directional_sprite_based_on_direction_state() {
	let player_Direction_Has_Changed = JSON.stringify(player.directionState) !== JSON.stringify(player.lastDirectionState);
	let player_is_moving_up_down_or_right_and_facing_right_and_sprite_isnt_showing_run_right =
		(player.directionState.up == true ||
			player.directionState.down == true ||
			player.directionState.right == true ||
			player.directionState.upRight == true ||
			player.directionState.downRight == true) &&
		lastKey == 'right' &&
		player.currentSprite != player.sprites.run.right;
	let player_is_moving_up_down_or_left_and_facing_left_and_sprite_isnt_showing_run_left =
		(player.directionState.up == true ||
			player.directionState.down == true ||
			player.directionState.left == true ||
			player.directionState.upLeft == true ||
			player.directionState.downLeft == true) &&
		lastKey == 'left' &&
		player.currentSprite != player.sprites.run.left;
	let player_has_stopped_and_facing_left_and_sprite_not_showing_idle_left =
		player.directionState.stop == true && lastKey == 'left' && player.currentSprite != player.sprites.stand.left;
	let player_has_stopped_and_facing_right_and_sprite_not_showing_idle_right =
		player.directionState.stop == true && lastKey == 'right' && player.currentSprite != player.sprites.stand.right;

	/*********************************** logic starts here********************************/
	if (player_Direction_Has_Changed) {
		player.lastDirectionState = JSON.stringify(player.directionState);

		//change to run right sprite
		if (player_is_moving_up_down_or_right_and_facing_right_and_sprite_isnt_showing_run_right) {
			player.reset_frames_and_sprite_counter();
			player.change_sprite_based_on_direction_input(player.sprites.run.right, 'right', player.sprites.run.cropWidth, player.sprites.run.width);
		}

		//change to run left sprite
		else if (player_is_moving_up_down_or_left_and_facing_left_and_sprite_isnt_showing_run_left) {
			player.reset_frames_and_sprite_counter();
			player.change_sprite_based_on_direction_input(player.sprites.run.left, 'left', player.sprites.run.cropWidth, player.sprites.run.width);
		}

		//change to idle left sprite
		else if (player_has_stopped_and_facing_left_and_sprite_not_showing_idle_left) {
			player.reset_frames_and_sprite_counter();
			player.change_sprite_based_on_direction_input(player.sprites.stand.left, 'left', player.sprites.stand.cropWidth, player.sprites.stand.width);
		}

		//change to idle right sprite
		else if (player_has_stopped_and_facing_right_and_sprite_not_showing_idle_right) {
			player.reset_frames_and_sprite_counter();
			player.change_sprite_based_on_direction_input(player.sprites.stand.right, 'right', player.sprites.stand.cropWidth, player.sprites.stand.width);
		}
	}
}

/*************************************************************************************************************enemy */
function handle_enemy_directional_sprite_based_on_direction_state(enemy) {
	let enemy_Direction_Has_Changed = JSON.stringify(enemy.directionState) !== JSON.stringify(enemy.lastDirectionState);
	let enemy_is_moving_up_down_or_right_and_facing_right_and_sprite_isnt_showing_run_right =
		(enemy.directionState.up == true ||
			enemy.directionState.down == true ||
			enemy.directionState.right == true ||
			enemy.directionState.upRight == true ||
			enemy.directionState.downRight == true) &&
		enemy.lastDirection == 'right' &&
		enemy.currentSprite != enemy.sprites.run.right;
	let enemy_is_moving_up_down_or_left_and_facing_left_and_sprite_isnt_showing_run_left =
		(enemy.directionState.up == true ||
			enemy.directionState.down == true ||
			enemy.directionState.left == true ||
			enemy.directionState.upLeft == true ||
			enemy.directionState.downLeft == true) &&
		enemy.lastDirection == 'left' &&
		enemy.currentSprite != enemy.sprites.run.left;
	let enemy_has_stopped_and_facing_left_and_sprite_not_showing_idle_left =
		enemy.directionState.stop == true && enemy.lastDirection == 'left' && enemy.currentSprite != enemy.sprites.stand.left;
	let enemy_has_stopped_and_facing_right_and_sprite_not_showing_idle_right =
		enemy.directionState.stop == true && enemy.lastDirection == 'right' && enemy.currentSprite != enemy.sprites.stand.right;

	/*********************************** logic starts here********************************/
	if (enemy_Direction_Has_Changed) {
		enemy.lastDirectionState = JSON.stringify(enemy.directionState);

		//change to run right sprite
		if (enemy_is_moving_up_down_or_right_and_facing_right_and_sprite_isnt_showing_run_right) {
			enemy.reset_frames_and_sprite_counter();
			enemy.change_sprite_based_on_direction_input(enemy.sprites.run.right, 'right', enemy.sprites.run.cropWidth, enemy.sprites.run.width);
		}

		//change to run left sprite
		else if (enemy_is_moving_up_down_or_left_and_facing_left_and_sprite_isnt_showing_run_left) {
			enemy.reset_frames_and_sprite_counter();
			enemy.change_sprite_based_on_direction_input(enemy.sprites.run.left, 'left', enemy.sprites.run.cropWidth, enemy.sprites.run.width);
		}

		//change to idle left sprite
		else if (enemy_has_stopped_and_facing_left_and_sprite_not_showing_idle_left) {
			enemy.reset_frames_and_sprite_counter();
			enemy.change_sprite_based_on_direction_input(enemy.sprites.stand.left, 'left', enemy.sprites.stand.cropWidth, enemy.sprites.stand.width);
		}

		//change to idle right sprite
		else if (enemy_has_stopped_and_facing_right_and_sprite_not_showing_idle_right) {
			enemy.reset_frames_and_sprite_counter();
			enemy.change_sprite_based_on_direction_input(enemy.sprites.stand.right, 'right', enemy.sprites.stand.cropWidth, enemy.sprites.stand.width);
		}
	}
}
/********************************************************************************************************enemy */

/*************************************************************************************************************boss */
/*
function handle_boss_directional_sprite_based_on_direction_state() {
	let enemy_Direction_Has_Changed = JSON.stringify(neil.directionState) !== JSON.stringify(neil.lastDirectionState);
	let enemy_is_moving_up_down_or_right_and_facing_right_and_sprite_isnt_showing_run_right =
		(neil.directionState.up == true ||
			neil.directionState.down == true ||
			neil.directionState.right == true ||
			neil.directionState.upRight == true ||
			neil.directionState.downRight == true) &&
		neil.lastDirection == 'right' &&
		neil.currentSprite != neil.sprites.run.right;
	let enemy_is_moving_up_down_or_left_and_facing_left_and_sprite_isnt_showing_run_left =
		(neil.directionState.up == true ||
			neil.directionState.down == true ||
			neil.directionState.left == true ||
			neil.directionState.upLeft == true ||
			neil.directionState.downLeft == true) &&
		neil.lastDirection == 'left' &&
		neil.currentSprite != neil.sprites.run.left;
	let enemy_has_stopped_and_facing_left_and_sprite_not_showing_idle_left =
		neil.directionState.stop == true && neil.lastDirection == 'left' && neil.currentSprite != neil.sprites.stand.left;
	let enemy_has_stopped_and_facing_right_and_sprite_not_showing_idle_right =
		neil.directionState.stop == true && neil.lastDirection == 'right' && neil.currentSprite != neil.sprites.stand.right;

	////////////////////////////////////////// logic starts here //////////////////////////////////////////
	if (enemy_Direction_Has_Changed) {
		neil.lastDirectionState = JSON.stringify(neil.directionState);

		//change to run right sprite
		if (enemy_is_moving_up_down_or_right_and_facing_right_and_sprite_isnt_showing_run_right) {
			neil.reset_frames_and_sprite_counter();
			neil.change_sprite_based_on_direction_input(neil.sprites.run.right, 'right', neil.sprites.run.cropWidth, neil.sprites.run.width);
		}

		//change to run left sprite
		else if (enemy_is_moving_up_down_or_left_and_facing_left_and_sprite_isnt_showing_run_left) {
			neil.reset_frames_and_sprite_counter();
			neil.change_sprite_based_on_direction_input(neil.sprites.run.left, 'left', neil.sprites.run.cropWidth, neil.sprites.run.width);
		}

		//change to idle left sprite
		else if (enemy_has_stopped_and_facing_left_and_sprite_not_showing_idle_left) {
			neil.reset_frames_and_sprite_counter();
			neil.change_sprite_based_on_direction_input(neil.sprites.stand.left, 'left', neil.sprites.stand.cropWidth, neil.sprites.stand.width);
		}

		//change to idle right sprite
		else if (enemy_has_stopped_and_facing_right_and_sprite_not_showing_idle_right) {
			neil.reset_frames_and_sprite_counter();
			neil.change_sprite_based_on_direction_input(neil.sprites.stand.right, 'right', neil.sprites.stand.cropWidth, neil.sprites.stand.width);
		}
	}
}
*/
/******************************************************************************************************** boss*/

function handle_action_sprite_changes_based_on_action_state() {
	switch (true) {
		// player punching
		case player.action.punch.state:
			player.sound.punch.play();
			player.sound.myVoice.play();
			if (lastKey == 'right') {
				// console.log(player.position.x + player.width / 2);
				handle_enemy_damage(
					player.action.punch.attackWidth,
					player.sprites.punch.rightCollision,
					lastKey,
					player.sprites.punch.cropWidth,
					player.sprites.punch.width,
					player.sound.tap
				);
				// handle_boss_damage(
				// 	player.action.punch.attackWidth,
				// 	player.sprites.punch.rightCollision,
				// 	lastKey,
				// 	player.sprites.punch.cropWidth,
				// 	player.sprites.punch.width,
				// 	player.sound.tap
				// );
				player.update_player_action_sprite_based_on_action_state(player.sprites.punch.right, lastKey, player.sprites.punch.cropWidth, player.sprites.punch.width);
			} else if (lastKey == 'left') {
				// console.log(player.position.x + player.width / 2);
				handle_enemy_damage(
					player.action.punch.attackWidth,
					player.sprites.punch.leftCollision,
					lastKey,
					player.sprites.punch.cropWidth,
					player.sprites.punch.width,
					player.sound.tap
				);
				// handle_boss_damage(
				// 	player.action.punch.attackWidth,
				// 	player.sprites.punch.leftCollision,
				// 	lastKey,
				// 	player.sprites.punch.cropWidth,
				// 	player.sprites.punch.width,
				// 	player.sound.tap
				// );
				player.update_player_action_sprite_based_on_action_state(player.sprites.punch.left, lastKey, player.sprites.punch.cropWidth, player.sprites.punch.width);
			}
			break;

		// player biting
		case player.action.bite.state:
			// player.sound.bite.play();
			player.sound.dragon.play();
			if (lastKey == 'right') {
				handle_enemy_damage(
					player.action.bite.attackWidth,
					player.sprites.bite.rightCollision,
					lastKey,
					player.sprites.bite.cropWidth,
					player.sprites.bite.width,
					player.sound.bite
				);
				// handle_boss_damage(
				// 	player.action.bite.attackWidth,
				// 	player.sprites.bite.rightCollision,
				// 	lastKey,
				// 	player.sprites.bite.cropWidth,
				// 	player.sprites.bite.width,
				// 	player.sound.bite
				// );
				player.update_player_action_sprite_based_on_action_state(player.sprites.bite.right, lastKey, player.sprites.bite.cropWidth, player.sprites.bite.width);
			} else if (lastKey == 'left') {
				handle_enemy_damage(
					player.action.bite.attackWidth,
					player.sprites.bite.leftCollision,
					lastKey,
					player.sprites.bite.cropWidth,
					player.sprites.bite.width,
					player.sound.bite
				);
				// handle_boss_damage(
				// 	player.action.bite.attackWidth,
				// 	player.sprites.bite.leftCollision,
				// 	lastKey,
				// 	player.sprites.bite.cropWidth,
				// 	player.sprites.bite.width,
				// 	player.sound.bite
				// );
				player.update_player_action_sprite_based_on_action_state(player.sprites.bite.left, lastKey, player.sprites.bite.cropWidth, player.sprites.bite.width);
			}
			break;

		// player swiping
		case player.action.swipe.state:
			player.sound.swipe.play();
			player.sound.wetFart.play();
			if (lastKey == 'right') {
				handle_enemy_damage(
					player.action.swipe.attackWidth,
					player.sprites.swipe.rightCollision,
					lastKey,
					player.sprites.swipe.cropWidth,
					player.sprites.swipe.width,
					player.sound.whip
				);
				// handle_boss_damage(
				// 	player.action.swipe.attackWidth,
				// 	player.sprites.swipe.rightCollision,
				// 	lastKey,
				// 	player.sprites.swipe.cropWidth,
				// 	player.sprites.swipe.width,
				// 	player.sound.whip
				// );
				player.update_player_action_sprite_based_on_action_state(player.sprites.swipe.right, lastKey, player.sprites.swipe.cropWidth, player.sprites.swipe.width);
			} else if (lastKey == 'left') {
				handle_enemy_damage(
					player.action.swipe.attackWidth,
					player.sprites.swipe.leftCollision,
					lastKey,
					player.sprites.swipe.cropWidth,
					player.sprites.swipe.width,
					player.sound.whip
				);
				// handle_boss_damage(
				// 	player.action.swipe.attackWidth,
				// 	player.sprites.swipe.leftCollision,
				// 	lastKey,
				// 	player.sprites.swipe.cropWidth,
				// 	player.sprites.swipe.width,
				// 	player.sound.whip
				// );
				player.update_player_action_sprite_based_on_action_state(player.sprites.swipe.left, lastKey, player.sprites.swipe.cropWidth, player.sprites.swipe.width);
			}
			break;
	}

	////////////////////////////////---------------------------------------------------------------------------- enemy
	//this must eventually turn into a "forEach" iterating through the array holding enemy objects
	function handle_enemy_damage(attackWidth, collisionSprite, direction, cropWidth, imageWidth, collisionSound) {
		// for each moveable item
		//if its an Enemy object
		//let enemy = that object and pass the index
		// let index = the index passed

		// if enemy dies (or for now, contact made), splice that object on movableItems with the index
		moveableItems.forEach((item, index) => {
			if (item instanceof Enemy) {
				let enemy = item;
				let enemyIndex = index;

				let enemy_is_to_the_left = player.position.x + player.width / 2 >= enemy.position.x + enemy.width / 2 + enemy.spriteOffset;
				let enemy_is_to_the_right = player.position.x + player.width / 2 <= enemy.position.x + enemy.width / 2 + enemy.spriteOffset;
				let enemy_within_left_striking_range =
					player.position.x + player.width / 2 - attackWidth + player.spriteOffset - (enemy.position.x + enemy.width / 2 + enemy.spriteOffset) <= 0;
				let enemy_within_right_striking_range = enemy.position.x + enemy.width / 2 + enemy.spriteOffset - (player.position.x + player.width / 2 + attackWidth) <= 0;
				let enemy_within_y_striking_range = Math.abs(player.position.y + player.height - (enemy.position.y + enemy.height)) <= 40;
				if (lastKey == 'right') {
					if (enemy_is_to_the_right && enemy_within_right_striking_range && enemy_within_y_striking_range) {
						console.log('hit enemy. now put the attackWidth range in the player class for that action and adjust the y value above in the conditions');
						collisionCloud.madeContact = true;
						console.log('player made contact: ', collisionCloud.madeContact);
						collisionCloud.update_collision_cloud_sprite_based_on_action_state(collisionSprite, direction, cropWidth, imageWidth, collisionSound);
						lowerEnemyHealth(collisionSprite, enemy);
						// moveableItems.splice(enemyIndex, 1);
					}
				} else if (lastKey == 'left') {
					if (enemy_is_to_the_left && enemy_within_left_striking_range && enemy_within_y_striking_range) {
						console.log('hit enemy to the left. now put the attackWidth range in the player class for that action and adjust the y value above in the conditions');
						collisionCloud.madeContact = true;
						console.log('player made contact: ', collisionCloud.madeContact);
						collisionCloud.update_collision_cloud_sprite_based_on_action_state(collisionSprite, direction, cropWidth, imageWidth, collisionSound);
						lowerEnemyHealth(collisionSprite, enemy);
						// moveableItems.splice(enemyIndex, 1);
					}
				}
				if (enemy.health <= 0) {
					moveableItems.splice(enemyIndex, 1);
				}
			}
		});

		function lowerEnemyHealth(collisionSprite, enemy) {
			if (collisionSprite == player.sprites.punch.rightCollision || collisionSprite == player.sprites.punch.leftCollision) {
				enemy.health -= player.action.punch.damage;
			} else if (collisionSprite == player.sprites.swipe.rightCollision || collisionSprite == player.sprites.swipe.leftCollision) {
				enemy.health -= player.action.swipe.damage;
			} else if (collisionSprite == player.sprites.bite.rightCollision || collisionSprite == player.sprites.bite.leftCollision) {
				enemy.health -= player.action.bite.damage;
			}
		}
	}
	////////////////////////////////---------------------------------------------------------------------------- enemy

	////////////////////////////////---------------------------------------------------------------------------- boss
	/*
	//this must eventually turn into a "forEach" iterating through the array holding enemy objects
	function handle_boss_damage(attackWidth, collisionSprite, direction, cropWidth, imageWidth, collisionSound) {
		let enemy_is_to_the_left = player.position.x + player.width / 2 >= neil.position.x + neil.width / 2 + neil.spriteOffset;
		let enemy_is_to_the_right = player.position.x + player.width / 2 <= neil.position.x + neil.width / 2 + neil.spriteOffset;
		let enemy_within_left_striking_range =
			player.position.x + player.width / 2 - attackWidth + player.spriteOffset - (neil.position.x + neil.width / 2 + neil.spriteOffset) <= 0;
		let enemy_within_right_striking_range = neil.position.x + neil.width / 2 + neil.spriteOffset - (player.position.x + player.width / 2 + attackWidth) <= 0;
		let enemy_within_y_striking_range = Math.abs(player.position.y + player.height - (neil.position.y + neil.height)) <= 20;
		if (lastKey == 'right') {
			if (enemy_is_to_the_right && enemy_within_right_striking_range && enemy_within_y_striking_range) {
				console.log('hit enemy. now put the attackWidth range in the player class for that action and adjust the y value above in the conditions');
				collisionCloud.madeContact = true;
				console.log('player made contact: ', collisionCloud.madeContact);
				collisionCloud.update_collision_cloud_sprite_based_on_action_state(collisionSprite, direction, cropWidth, imageWidth, collisionSound);
			}
		} else if (lastKey == 'left') {
			if (enemy_is_to_the_left && enemy_within_left_striking_range && enemy_within_y_striking_range) {
				console.log('hit enemy to the left. now put the attackWidth range in the player class for that action and adjust the y value above in the conditions');
				collisionCloud.madeContact = true;
				console.log('player made contact: ', collisionCloud.madeContact);
				collisionCloud.update_collision_cloud_sprite_based_on_action_state(collisionSprite, direction, cropWidth, imageWidth, collisionSound);
			}
		}
	}
	*/
	////////////////////////////////---------------------------------------------------------------------------- boss
}

function logXandY(event) {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	console.log(`X: ${x}, Y: ${y}`);
}

function mouseClickMethod(callback) {
	canvas.addEventListener('click', callback);
}

// Call the function with logXandY as the callback
mouseClickMethod(logXandY);

// add event listeners for the keys. specify as a string what event is getting called
window.addEventListener('keydown', (event) => {
	// console.log(event);
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

		case 'x':
			// console.log('x');
			testController = !testController;
			console.log('player doing something: ', player.doingSomething);

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
			// console.log('space');
			actionKeys.space.pressed = false;
			break;

		case 'b':
			// console.log('space');
			actionKeys.b.pressed = false;
			break;

		case 's':
			// console.log('space');
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
	let idle = {
		pics: 1,
		width: 200 * 1 + 200 / 2,
		name: 'idle',
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
			let booty = 200 * i + 200 / 2 + 30;
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
