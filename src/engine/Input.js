export default class Input {
	constructor(bindings) {
		this.bindings = bindings;
		this.keys = new Set();
		this.axes = { x: 0, y: 0 };
		this._lastDirectionKey = 'right';
		this._attach();
	}

	_attach() {
		window.addEventListener('keydown', (e) => {
			const name = this._name(e);
			this.keys.add(name);
			if (name === 'right' || name === 'left') this._lastDirectionKey = name;
		});
		window.addEventListener('keyup', (e) => {
			this.keys.delete(this._name(e));
		});
	}

	_name(e) {
		switch (e.key) {
			case 'ArrowUp':
				return 'up';
			case 'ArrowDown':
				return 'down';
			case 'ArrowLeft':
				return 'left';
			case 'ArrowRight':
				return 'right';
			case ' ':
				return 'space';
			default:
				return e.key.toLowerCase();
		}
	}

	isDown(action) {
		const keys = this.bindings[action];
		if (keys) {
			for (const k of keys) if (this.keys.has(k)) return true;
		}
		if (action === 'right' && this.axes.x > 0.5) return true;
		if (action === 'left' && this.axes.x < -0.5) return true;
		if (action === 'up' && this.axes.y < -0.5) return true;
		if (action === 'down' && this.axes.y > 0.5) return true;
		return false;
	}

	setAxes(x, y) {
		this.axes.x = x;
		this.axes.y = y;
		if (x > 0.5) this._lastDirectionKey = 'right';
		else if (x < -0.5) this._lastDirectionKey = 'left';
	}

	lastDirectionKey() {
		return this._lastDirectionKey;
	}
}
