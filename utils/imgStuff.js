export default function createImage(imageSrc) {
	let image = new Image();
	image.src = imageSrc;
	return image;
}
