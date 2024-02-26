export default function createImage(imageSrc) {
	let image = new Image();
	image.src = imageSrc;
	return image;
}

// function createImagePromise(imageSrc) {
// 	return new Promise((resolve, reject) => {
// 		const image = new Image();
// 		image.src = imageSrc; // Set the source of the image to start loading
// 		image.onload = () => resolve(image); // Resolve the promise with the loaded image
// 		image.onerror = (error) => reject(error); // Reject the promise if there's an error loading the image
// 	});
// }

// export default async function createImage(imageSrc) {
// 	try {
// 		const loadedImage = await createImagePromise(imageSrc);
// 		console.log('Image loaded successfully');

// 		// Now you can use the loadedImage, for example, add it to the DOM
// 		return loadedImage;
// 	} catch (error) {
// 		console.error('Failed to load the image:', error);
// 	}
// }

// loadImageAndUseIt('path/to/your/image.jpg');
