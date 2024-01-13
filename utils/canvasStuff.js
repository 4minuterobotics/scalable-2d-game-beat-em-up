export function create2dCanvasContext(canvas, canvasName, c, twoD_or_3D) {
	canvas = document.querySelector(canvasName);
	c = canvas.getContext(twoD_or_3D);
}

export function set_canvas_size(width, height) {
	//set the canvas to a set width and height
	canvas.width = width;
	canvas.height = height;
}

export function create_colored_canvas(color, x, y, width, height) {
	c.fillStyle = color;
	c.fillRect(x, y, width, height);
}

// export { canvas, c };
