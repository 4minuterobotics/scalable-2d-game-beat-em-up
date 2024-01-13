import GenericObject from '../classes/genericObjects';

//setting the x and y to -1 gets rid of the white edges.
export function createStageBackgroundTiles(number_of_tiles, y, width, height, img) {
	let arr = [];
	for (let i = 0; i < number_of_tiles; i++) {
		let tile = new GenericObject(width * i - 1, y, width, height, img);
		arr.push(tile);
	}
	return arr;
}
export function createStageItems(number_of_items, first_item_x, y, gap, width, height, img) {
	let arr = [];
	for (let i = 0; i < number_of_items; i++) {
		let item = new GenericObject(first_item_x + gap * i, y, width, height, img);
		arr.push(item);
	}
	return arr;
}
