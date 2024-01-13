import tankWithHuman from './tank-1.png';
import emptyLitTank from './tank-2.png';
import emptyDarkTank from './tank-3.png';

import createImage from '../../../utils/imgStuff';
import * as canvasStuff from '../../../utils/canvasStuff';
import { canvas } from '../../../canvas.js';

let tankWithHumanImage = createImage(tankWithHuman);
let emptyLitTankImage = createImage(emptyLitTank);
let emptyDarkTankImage = createImage(emptyDarkTank);
// export let darkBgItems = { set1: [createImage(tankWithHuman), createImage(emptyLitTank), createImage(emptyDarkTank)] };

// export let bgTankSet1 = {
// 	image: tankWithHumanImage,
// 	x_gap: 1000,
// 	y: canvasStuff.canvas.height - 595,
// 	width: tankWithHumanImage.width * 3,
// 	height: tankWithHumanImage.height * 3,
// };
// export let tankWithHumanInside = [tankWithHumanImage, 1000, canvasStuff.canvas.height - 595, tankWithHumanImage.width * 3, tankWithHumanImage.height * 3];
let darkBgItems = {
	humanTank: {
		image: tankWithHumanImage,
		x_gap: 1000,
		// y: canvas.height - 595,
		y: 200,
		width: tankWithHumanImage.width * 3,
		height: tankWithHumanImage.height * 3,
	},
	emptyTank: {
		image: emptyLitTankImage,
		x_gap: 1000,
		// y: canvasStuff.canvas.height - 595,
		y: 34,
		width: tankWithHumanImage.width * 3,
		height: tankWithHumanImage.height * 3,
	},
	darkTank: {
		image: emptyDarkTankImage,
		x_gap: 1000,
		// y: canvasStuff.canvas.height - 595,
		y: 34,
		width: tankWithHumanImage.width * 3,
		height: tankWithHumanImage.height * 3,
	},
};

export default darkBgItems;
