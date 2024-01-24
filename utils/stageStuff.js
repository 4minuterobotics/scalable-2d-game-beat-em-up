import GenericObject from '../classes/genericObjects';
import stages from '../img/stages/stageImages';
import bgItems from '../img/bgItems/bgItems.js';
import foregroundItems from '../img/foregroundItems/foregroundItems';

export function createStageItems(number_of_items, first_item_x, y, gap, width, height, img) {
	let arr = [];
	for (let i = 0; i < number_of_items; i++) {
		let item = new GenericObject(first_item_x + gap * i, y, width, height, img);
		arr.push(item);
	}
	return arr;
}

export let stage = [
	{
		// stage 1: alien space ship, index 0
		foregroundItems: [
			{
				description: 'blue beams, kinda look metal',
				numberOfItems: 10,
				firstItemX: 50,
				y: 0,
				spacing: 1200,
				width: foregroundItems.blueBeams.image.width * 3,
				height: foregroundItems.blueBeams.image.height * 3,
				image: foregroundItems.blueBeams.image,
			},
		],
		bgTiles: [
			{
				description: 'blue pipes, gloomy and dark',
				numberOfItems: 15,
				firstItemX: 0,
				y: -320,
				spacing: 800 * 1.5,
				width: 800 * 1.5,
				height: 600 * 1.5,
				image: stages.alienSpaceShip.image,
			},
		],
		bgItems: [
			{
				description: 'tank with human inside, gloomy',
				numberOfItems: 10,
				firstItemX: 2700,
				y: 0,
				spacing: 2700,
				width: bgItems.stageLevel.dark.humanTank.width * 3,
				height: bgItems.stageLevel.dark.humanTank.height * 3,
				image: bgItems.stageLevel.dark.humanTank,
			},
			{
				description: 'empty lit tank',
				numberOfItems: 10,
				firstItemX: 1500,
				y: 0,
				spacing: 1500,
				width: bgItems.stageLevel.dark.emptyTank.width * 3,
				height: bgItems.stageLevel.dark.emptyTank.height * 3,
				image: bgItems.stageLevel.dark.emptyTank,
			},
			{
				description: 'dark empty tank, lights off',
				numberOfItems: 10,
				firstItemX: 10000,
				y: 0,
				spacing: 10000,
				width: bgItems.stageLevel.dark.darkTank.width * 3,
				height: bgItems.stageLevel.dark.darkTank.height * 3,
				image: bgItems.stageLevel.dark.darkTank,
			},
		],

		endOfStageX: 20000,
	},

	{
		//stage 2: south beach, index 1
		foregroundItems: [
			{
				description: 'individual palm trees',
				numberOfItems: 60,
				firstItemX: 10,
				y: -200,
				spacing: 3000,
				width: foregroundItems.palmTree.image.width * 4,
				height: foregroundItems.palmTree.image.height * 4,
				image: foregroundItems.palmTree.image,
			},
		],
		bgTiles: [
			{
				description: 'pink miami street',
				numberOfItems: 15,
				firstItemX: 0,
				y: -380,
				spacing: 800 * 1.6,
				width: 800 * 1.6,
				height: 600 * 1.6,
				image: stages.miamiStreet.image,
			},
		],
		closeBgItems: [
			{
				description: "3 palm trees looking like they're on a swamp",
				numberOfItems: 25,
				firstItemX: 0,
				y: -20,
				spacing: bgItems.close.light.palmTreesAndGrass.width * 2,
				width: bgItems.close.light.palmTreesAndGrass.width * 2,
				height: bgItems.close.light.palmTreesAndGrass.height * 2,
				image: bgItems.close.light.palmTreesAndGrass,
			},
		],
		farBgItems: [
			{
				description: 'pink buildings with a faded bottom.',
				numberOfItems: 15,
				firstItemX: 0,
				y: -10,
				spacing: bgItems.far.light.pinkEveningBuildings.width * 2,
				width: bgItems.far.light.pinkEveningBuildings.width * 2,
				height: bgItems.far.light.pinkEveningBuildings.height * 2,
				image: bgItems.far.light.pinkEveningBuildings,
			},
		],
		veryFarBgItems: [
			{
				description: 'pink clouds and an ocean bottom',
				numberOfItems: 15,
				firstItemX: 0,
				y: -40,
				spacing: bgItems.veryFar.light.pinkClouds.width * 2,
				width: bgItems.veryFar.light.pinkClouds.width * 2,
				height: bgItems.veryFar.light.pinkClouds.height * 2,
				image: bgItems.veryFar.light.pinkClouds,
			},
		],
		horizonBgItems: [
			{
				description: 'pink sun',
				numberOfItems: 1,
				firstItemX: 0,
				y: -60,
				spacing: bgItems.horizonMotionless.light.pinkMiamiSun.width * 2,
				width: bgItems.horizonMotionless.light.pinkMiamiSun.width * 2,
				height: bgItems.horizonMotionless.light.pinkMiamiSun.height * 2,
				image: bgItems.horizonMotionless.light.pinkMiamiSun,
			},
		],
		endOfStageX: 24000,
	},
	{
		//stage 3: tijuana, index 2

		bgTiles: [
			{
				description: 'active tijuana looking street',
				numberOfItems: 15,
				firstItemX: 0,
				y: -270,
				spacing: stages.activeTijuana.image.width * 2.8 * 2,
				width: stages.activeTijuana.image.width * 2.8,
				height: stages.activeTijuana.image.height * 2.8,
				image: stages.activeTijuana.image,
			},
			{
				description: 'empty tijuana looking street',
				numberOfItems: 15,
				firstItemX: stages.emptyTijuana.image.width * 2.8,
				y: -270,
				spacing: stages.emptyTijuana.image.width * 2.8 * 2,
				width: stages.emptyTijuana.image.width * 2.8,
				height: stages.activeTijuana.image.height * 2.8,
				image: stages.emptyTijuana.image,
			},
		],

		closeBgItems: [
			{
				description: 'orange smoggy buildings.',
				numberOfItems: 15,
				firstItemX: 0,
				y: -150,
				spacing: bgItems.close.light.smoggyOrangeBuildings.width * 2,
				width: bgItems.close.light.smoggyOrangeBuildings.width * 2,
				height: bgItems.close.light.smoggyOrangeBuildings.height * 2,
				image: bgItems.close.light.smoggyOrangeBuildings,
			},
		],
		farBgItems: [
			{
				description: 'orange smoggy skyline',
				numberOfItems: 15,
				firstItemX: 0,
				y: -40,
				spacing: bgItems.far.light.smoggyOrangeSkyline.width * 2,
				width: bgItems.far.light.smoggyOrangeSkyline.width * 2,
				height: bgItems.far.light.smoggyOrangeSkyline.height * 2,
				image: bgItems.far.light.smoggyOrangeSkyline,
			},
		],

		endOfStageX: 24000,
	},
	{
		//stage 4: wrigleyville, index 3

		bgTiles: [
			{
				description: 'wrigleyville looking street',
				numberOfItems: 15,
				firstItemX: 0,
				y: -420,
				spacing: stages.wrigleyville.image.width * 4.8,
				width: stages.wrigleyville.image.width * 4.8,
				height: stages.wrigleyville.image.height * 4.8,
				image: stages.wrigleyville.image,
			},
		],

		closeBgItems: [
			{
				description: 'maroon downtown buildings.',
				numberOfItems: 15,
				firstItemX: 0,
				y: -150,
				spacing: bgItems.close.dark.maroonBuildings.width * 2,
				width: bgItems.close.dark.maroonBuildings.width * 2,
				height: bgItems.close.dark.maroonBuildings.height * 2,
				image: bgItems.close.dark.maroonBuildings,
			},
		],
		farBgItems: [
			{
				description: 'dark green skyline',
				numberOfItems: 15,
				firstItemX: 0,
				y: -40,
				spacing: bgItems.far.dark.nightDowntownSkyline.width * 2,
				width: bgItems.far.dark.nightDowntownSkyline.width * 2,
				height: bgItems.far.dark.nightDowntownSkyline.height * 2,
				image: bgItems.far.dark.nightDowntownSkyline,
			},
		],

		endOfStageX: 24000,
	},
];
