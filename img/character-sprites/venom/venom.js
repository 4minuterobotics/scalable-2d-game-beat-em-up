import bite_left_sprite from './bite-left-spritesheet.png';
import bite_right_sprite from './bite-right-spritesheet.png';
import idle_left_sprite from './idle-left-spritesheet.png';
import idle_right_sprite from './idle-right-spritesheet.png';
import punch_left_sprite from './punch-left-spritesheet.png';
import punch_right_sprite from './punch-right-spritesheet.png';
import start_sprite from './start-sprite-sheet.png';
import swipe_left_sprite from './swipe-left-spritesheet.png';
import swipe_right_sprite from './swipe-right-spritesheet.png';
import walk_left_sprite from './walk-left-sprite.png';
import walk_right_sprite from './walk-right-sprite.png';

import createImage from '../../../utils/imgStuff';

let attacks = [
	{
		attack1L: createImage(punch_left_sprite),
		attack1R: createImage(punch_right_sprite),
	},
	{
		attack2L: createImage(swipe_left_sprite),
		attack2R: createImage(swipe_right_sprite),
	},
	{
		attack3L: createImage(bite_left_sprite),
		attack3R: createImage(bite_right_sprite),
	},
];

let movement = [
	{
		idleL: createImage(idle_left_sprite),
		idleR: createImage(idle_right_sprite),
	},
	{
		walkL: createImage(walk_left_sprite),
		walkR: createImage(walk_right_sprite),
	},
];

let start = createImage(start_sprite);

export { attacks, movement, start };
