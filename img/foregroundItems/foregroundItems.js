import blueBeam from './support.png';
import palmTree from './palm-tree.png';
import createImage from '../../utils/imgStuff';

let foregroundItems = {
	blueBeams: {
		description: 'blue metal beams, meant for indoor',
		image: createImage(blueBeam),
	},
	palmTree: {
		description: 'a palm tree',
		image: createImage(palmTree),
	},
};

export default foregroundItems;
