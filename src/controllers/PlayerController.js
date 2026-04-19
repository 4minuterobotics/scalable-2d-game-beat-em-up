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

		// Actions that the engine handles specially (movement/modifier) must never
		// be fired as _startAction() — doing so locks the character into a looping
		// animation with isActing=true and no exit.
		const MOVEMENT_RESERVED = new Set(['right', 'left', 'up', 'down', 'sprint']);
		// Slots the engine drives on its own (walk/run/start/hurt) must not be
		// replayed via _startAction either — they're looping and would freeze the
		// character.
		const LOCOMOTION_SLOTS = new Set([
			c.config.walkAnimation,
			c.config.runAnimation,
			c.config.startAnimation,
			c.config.hurtAnimation,
		].filter(Boolean));

		if (c.config.inputActions) {
			for (const [inputAction, animName] of Object.entries(c.config.inputActions)) {
				if (MOVEMENT_RESERVED.has(inputAction)) continue;
				if (LOCOMOTION_SLOTS.has(animName)) continue;
				if (this.input.isDown(inputAction) && c.config.animations[animName]) {
					c.intent.action = animName;
					break;
				}
			}
		}

		// Auto-wire: if no explicit mapping matched, fire any animation whose name matches
		// a held game action — unless that name is a movement/modifier or a locomotion/
		// reaction slot the engine drives on its own.
		if (!c.intent.action) {
			const excluded = new Set([
				...MOVEMENT_RESERVED,
				c.config.walkAnimation,
				c.config.runAnimation,
				c.config.startAnimation,
				c.config.hurtAnimation,
			].filter(Boolean));
			const bindings = this.input.bindings ?? {};
			for (const action of Object.keys(bindings)) {
				if (excluded.has(action)) continue;
				if (!c.config.animations?.[action]) continue;
				const explicit = c.config.inputActions?.[action];
				if (explicit === '' || explicit === null) continue; // user explicitly cleared
				if (!this.input.isDown(action)) continue;
				c.intent.action = action;
				break;
			}
		}
	}
}
