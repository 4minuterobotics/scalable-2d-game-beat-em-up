import alienSpaceShipBg from './bluePipes.png';
import miamiStreet from './highway.png';
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
};

export default stages;
