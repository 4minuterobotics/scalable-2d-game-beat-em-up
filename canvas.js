import Player from './classes/player';

import { stage, createStageBackgroundTiles, createStageItems } from './utils/stageStuff.js';

const gravity = 1;

// utils.canvasStuff.create2dCanvasContext(canvas, 'canvas', c, '2d');
// utils.canvasStuff.set_canvas_size(1024, 576);
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

let currentLevel = 1;

//Class objects
let player;
let stageBackgroundTiles = []; // parallex scrolled background and hills
let stageBackgroundItems = []; // human tanks
let stageForegroundItems = []; //  support beams
let closeBgItems = [];
let farBgItems = [];
let veryFarBgItems = [];
let horizonBgItems = [];

let foregroundParallexRate = 5;
let stageParallexRate = 0.66;
let closeBgParallexRate = 0.5;
let farBgParallexRate = 0.35;
let veryFarParallexRate = 0.2;

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

//Tracks the players change in canvas x-position from its original position
let scrollOffset = 0;

/**
 * Initializes the game and starts the animation loop.
 */
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

	/*************************helper functions*****************************/
	function create_game_objects() {
		//player object
		player = new Player();

		//stage objects

		stage[currentLevel].foregroundItems?.forEach((item, index) => {
			// foreground items
			stageForegroundItems[index] = createStageItems(item.numberOfItems, item.firstItemX, item.y, item.spacing, item.width, item.height, item.image);
		});
		stage[currentLevel].bgTiles?.forEach((item, index) => {
			// stage tiles
			stageBackgroundTiles[index] = createStageBackgroundTiles(item.numberOfItems, item.y, item.width, item.height, item.image);
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
	}
}

//this function loops every millisec
function animate() {
	c.fillStyle = 'white';
	c.fillRect(0, 0, canvas.width, canvas.height);

	//fill canvas with the color white
	// utils.canvasStuff.create_colored_canvas('white', 0, 0, utils.canvasStuff.canvas.width, utils.canvasStuff.canvas.height);

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

	//upadate the player spite frame number and crop position, then draws the sprite onto the screen, then updates its positon value
	player.update();

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
		//foregroung items
		stageForegroundItems.forEach((group) => {
			group?.forEach((item) => {
				item.position.x += player.speed / 2;
			});
		});
	}
}

function adjust_player_y_velocity_based_on_player_y_position_and_direction_states() {
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	let player_is_moving_up_and_hasnt_reached_its_top_border = player.directionState.up == true && player.position.y >= canvas.height - 480;
	let player_is_moving_angled_up_and_hasnt_reached_its_top_border =
		(player.directionState.upRight == true || player.directionState.upLeft == true) && player.position.y >= canvas.height - 480;
	let player_is_moving_down_and_hasnt_reached_its_bottom_border = player.directionState.down == true && player.position.y + player.height - 290 <= canvas.height;
	let player_is_moving_angled_down_and_hasnt_reached_its_bottom_border =
		(player.directionState.downRight == true || player.directionState.downLeft == true) && player.position.y + player.height - 290 <= canvas.height;
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

function handle_action_sprite_changes_based_on_action_state() {
	switch (true) {
		// player punching
		case player.action.punch:
			player.sound.punch.play();
			player.sound.myVoice.play();
			if (lastKey == 'right') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.punch.right, lastKey, player.sprites.punch.cropWidth, player.sprites.punch.width);
			} else if (lastKey == 'left') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.punch.left, lastKey, player.sprites.punch.cropWidth, player.sprites.punch.width);
			}
			break;

		// player biting
		case player.action.bite:
			player.sound.bite.play();
			player.sound.dragon.play();
			if (lastKey == 'right') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.bite.right, lastKey, player.sprites.bite.cropWidth, player.sprites.bite.width);
			} else if (lastKey == 'left') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.bite.left, lastKey, player.sprites.bite.cropWidth, player.sprites.bite.width);
			}
			break;

		// player swiping
		case player.action.swipe:
			player.sound.swipe.play();
			player.sound.wetFart.play();
			if (lastKey == 'right') {
				player.reset_frames_and_sprite_counter();
				player.update_player_action_sprite_based_on_action_state(player.sprites.swipe.right, lastKey, player.sprites.swipe.cropWidth, player.sprites.swipe.width);
			} else if (lastKey == 'left') {
				player.update_player_action_sprite_based_on_action_state(player.sprites.swipe.left, lastKey, player.sprites.swipe.cropWidth, player.sprites.swipe.width);
			}
			break;
	}
}

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
			if (player.startAnimation == false) {
				player.doingSomething = !player.doingSomething;
				console.log('player doing something: ', player.doingSomething);
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
