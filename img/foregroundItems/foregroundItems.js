import blueBeam from './support.png';
import palmTree from './palm-tree.png';
// import createImage from '../../utils/imgStuff';

// let foregroundItems = {
// 	blueBeams: {
// 		description: 'blue metal beams, meant for indoor',
// 		image: createImage(blueBeam),
// 	},
// 	palmTree: {
// 		description: 'a palm tree',
// 		image: createImage(palmTree),
// 	},
// };

// export default foregroundItems;

export async function loadForegroundItems() {
	const loadedBlueBeams = await createImage(blueBeam);
	const loadedPalmTree = await createImage(palmTree);

	const foreground = {
		blueBeams: {
			description: 'blue metal beams, meant for indoor',
			image: loadedBlueBeams,
		},
		palmTree: {
			description: 'a palm tree',
			image: loadedPalmTree,
		},
	};

	return foreground;
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
