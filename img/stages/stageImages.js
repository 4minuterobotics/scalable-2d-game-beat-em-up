import alienSpaceShipBg from './bluePipes.png';
import miamiStreet from './highway.png';
import tijuanaEmpty from './tijuana-empty.png';
import tijuana from './tijuana-stage.png';
import wrigleyville from './wrigleyville.png';

import createImage from '../../utils/imgStuff';

let stages = {
	alienSpaceShip: {
		description: 'dark blue pipes',
		image: createImage(alienSpaceShipBg),
	},
	miamiStreet: {
		description: 'pink tinted street. looks like some miami shit',
		image: createImage(miamiStreet),
	},
	activeTijuana: {
		description: 'a street with a bunch of stores and cars n shit around',
		image: createImage(tijuana),
	},
	emptyTijuana: {
		description: 'a street with bunch of stores but not cars n lights',
		image: createImage(tijuanaEmpty),
	},
	wrigleyville: {
		description: 'looks like wrigleyville at night',
		image: createImage(wrigleyville),
	},
};

export default stages;
