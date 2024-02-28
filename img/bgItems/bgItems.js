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

// import createImage from '../../utils/imgStuff';

export async function loadBackgroundItems() {
	const loadedTankWithHuman = await createImage(tankWithHuman);
	const loadedEmptyLitTank = await createImage(emptyLitTank);
	const loadedEmptyDarkTank = await createImage(emptyDarkTank);
	const loadedPalmTreesAndGrass = await createImage(palmTreesAndGrass);
	const loadedSmoggyOrangeBuildings = await createImage(smoggyOrangeBuildings);
	const loadedMaroonBuildings = await createImage(maroonBuildings);
	const loadedPinkEveningBuildings = await createImage(pinkEveningBuildings);
	const loadedSmoggyOrangeSkyline = await createImage(smoggyOrangeSkyline);
	const loadedNightDowntownSkyline = await createImage(nightDowntownSkyline);
	const loadedPinkClouds = await createImage(pinkClouds);
	const loadedPinkMiamiSun = await createImage(pinkMiamiSun);

	const bgItems = {
		stageLevel: {
			dark: {
				humanTank: loadedTankWithHuman,
				emptyTank: loadedEmptyLitTank,
				darkTank: loadedEmptyDarkTank,
			},
		},
		close: {
			light: {
				palmTreesAndGrass: loadedPalmTreesAndGrass,
				smoggyOrangeBuildings: loadedSmoggyOrangeBuildings,
			},
			dark: { maroonBuildings: loadedMaroonBuildings },
		},
		far: {
			light: {
				pinkEveningBuildings: loadedPinkEveningBuildings,
				smoggyOrangeSkyline: loadedSmoggyOrangeSkyline,
			},
			dark: { nightDowntownSkyline: loadedNightDowntownSkyline },
		},
		veryFar: {
			light: {
				pinkClouds: loadedPinkClouds,
			},
			dark: {},
		},
		horizonMotionless: {
			light: {
				pinkMiamiSun: loadedPinkMiamiSun,
			},
			dark: {},
		},
	};

	return bgItems;
}

async function createImage(imageSrc) {
	try {
		const loadedImage = await createImagePromise(imageSrc);
		return loadedImage;
	} catch (error) {
		console.error('Failed to load the image:', error);
	}
}

function createImagePromise(imageSrc) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = imageSrc;
		image.onload = () => resolve(image);
		image.onerror = (error) => reject(error);
	});
}
