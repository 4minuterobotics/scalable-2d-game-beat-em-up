import tankWithHuman from './tank-1.png';
import emptyLitTank from './tank-2.png';
import emptyDarkTank from './tank-3.png';
import pinkClouds from './pink-clouds.png';
import palmTreesAndGrass from './palmtrees-and-grass.png';
import pinkEveningBuildings from './pink-evening-buildings.png';
import pinkMiamiSun from './pink-miami-sun.png';
import smoggyOrangeBuildings from './smoggy-orange-far-bg.png';
import smoggyOrangeSkyline from './smoggy-orange-very-far-bg.png';
import maroonBuildings from './maroon-buildings.png';
import nightDowntownSkyline from './night-downtown-skyline.png';

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
			smoggyOrangeBuildings: createImage(smoggyOrangeBuildings),
		},
		dark: { maroonBuildings: createImage(maroonBuildings) },
	},
	far: {
		light: {
			pinkEveningBuildings: createImage(pinkEveningBuildings),
			smoggyOrangeSkyline: createImage(smoggyOrangeSkyline),
		},
		dark: { nightDowntownSkyline: createImage(nightDowntownSkyline) },
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
