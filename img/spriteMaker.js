/*all sprites{
    height: 200 px
    width: 380 px
    feet distance: 100px
    image placement: back foot 380x /2 + or - 25 
}
*/
let start = {
	pics: 20,
	width: 7600,
};

let idle = {
	pics: 13,
	width: 4940,
};

let bite = {
	pics: 8,
	width: 3040,
};

let swipe = {
	pics: 7,
	width: 2660,
};

let punch = {
	pics: 3,
	width: 1140,
};

let special = {
	pics: 18,
	width: 6840,
};

let crawl = {
	pics: 9,
	width: 3420,
	//5: 27 off
	//6: 66 off
	//
};

let walk = {
	pics: 10,
	width: 3800,
};

let currentSelection = idle;

let pics = currentSelection.pics;

function calcPics() {
	console.log('Total width: ', currentSelection.width);
	for (let i = 0; i < pics; i++) {
		let leftFootFacingRight = 380 * i + 380 / 2 - 25;
		console.log('Image ', i + 1, ' Facing right: ', leftFootFacingRight);
	}

	for (let i = 0; i < pics; i++) {
		let rightFootFacingLeft = 380 * i + 380 / 2 + 25;
		console.log('Image ', i + 1, ' Facing left: ', rightFootFacingLeft);
	}
}
