export function wireMenu({ canvas, onStart, getGame }) {
	const bindDom = () => {
		const homeBtn = document.querySelector('.lawrenceGameStart');
		if (homeBtn) {
			homeBtn.addEventListener('click', () => {
				for (const el of document.getElementsByClassName('homeScreen')) {
					el.style.display = 'none';
				}
				document.getElementById('gameMenu').style.display = 'block';
			});
		}

		const startBtn = document.getElementById('startGame');
		if (startBtn) {
			startBtn.addEventListener('click', () => {
				document.getElementById('gameMenu').style.display = 'none';
				canvas.style.display = 'block';
				document.body.style.backgroundImage = 'none';
				onStart();
			});
		}
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', bindDom);
	} else {
		bindDom();
	}

	document.addEventListener('keydown', (e) => {
		if (e.key !== 'm' && e.key !== 'M') return;
		if (canvas.style.display !== 'block') return;
		const pauseMenu = document.getElementById('pauseMenu');
		const visible = pauseMenu.style.display !== 'none';
		pauseMenu.style.display = visible ? 'none' : 'block';
		const game = getGame?.();
		if (game) {
			if (visible) game.resume();
			else game.pause();
		}
	});
}
