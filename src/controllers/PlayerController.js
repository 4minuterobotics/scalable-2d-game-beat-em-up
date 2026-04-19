export default class PlayerController {
	constructor(character, input) {
		this.character = character;
		this.input = input;
	}

	update() {
		const c = this.character;
		if (c.isActing) return;

		const right = this.input.isDown('right') ? 1 : 0;
		const left = this.input.isDown('left') ? 1 : 0;
		const up = this.input.isDown('up') ? 1 : 0;
		const down = this.input.isDown('down') ? 1 : 0;

		c.intent.moveX = right - left;
		c.intent.moveY = down - up;
		c.intent.sprint = this.input.isDown('sprint');

		if (c.config.inputActions) {
			for (const [inputAction, animName] of Object.entries(c.config.inputActions)) {
				if (this.input.isDown(inputAction) && c.config.animations[animName]) {
					c.intent.action = animName;
					break;
				}
			}
		}
	}
}
