import tankWithHuman from './tank-1.png';
import emptyLitTank from './tank-2.png';
import emptyDarkTank from './tank-3.png';
import pinkClouds from './pink-clouds.png';
import palmTreesAndGrass from './palmtrees-and-grass.png';
import pinkEveningBuildings from './pink-evening-buildings.png';
import pinkMiamiSun from './pink-miami-sun.png';
import createImage from '../../utils/imgStuff';

let bgItems = {
	stageLevel: {
		dark: {
			humanTank: createImage(tankWithHuman),
			emptyTank: createImage(emptyLitTank),
			darkTank: createImage(emptyDarkTank),
		},
	},
	close: {
		light: {
			palmTreesAndGrass: createImage(palmTreesAndGrass),
		},
		dark: {},
	},
	far: {
		light: {
			pinkEveningBuildings: createImage(pinkEveningBuildings),
		},
		dark: {},
	},
	veryFar: {
		light: {
			pinkClouds: createImage(pinkClouds),
		},
		dark: {},
	},
	horizonMotionless: {
		light: {
			pinkMiamiSun: createImage(pinkMiamiSun),
		},
		dark: {},
	},
};

export default bgItems;
