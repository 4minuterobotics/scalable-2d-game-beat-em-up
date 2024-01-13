import walk_left_sprite from './walk-left-sprite.png';
import walk_right_sprite from './walk-right-sprite.png';

import createImage from '../../../utils/imgStuff';

// let attacks = [
// 	{
// 		attack1L: createImage(punch_left_sprite),
// 		attack1R: createImage(punch_right_sprite),
// 	},
// 	{
// 		attack2L: createImage(swipe_left_sprite),
// 		attack2R: createImage(swipe_right_sprite),
// 	},
// 	{
// 		attack3L: createImage(bite_left_sprite),
// 		attack3R: createImage(bite_right_sprite),
// 	},
// ];

let movement = [
	// {
	// 	idleL: createImage(idle_left_sprite),
	// 	idleR: createImage(idle_right_sprite),
	// },
	{
		walkL: createImage(walk_left_sprite),
		walkR: createImage(walk_right_sprite),
	},
];

export { movement };
