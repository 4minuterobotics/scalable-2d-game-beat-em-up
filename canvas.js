import Game from './src/engine/Game.js';
import Input from './src/engine/Input.js';
import Joystick from './src/ui/Joystick.js';
import { wireMenu } from './src/ui/Menu.js';
import TuningPanel from './src/ui/TuningPanel.js';
import loadStage from './src/game/loadStage.js';
import loadGame from './src/engine/loadGame.js';

const GAME_SLUG = 'township';

const canvas = document.querySelector('canvas');
let input = null;
let joystick = null;
let currentGame = null;
let tuningPanel = null;
let stageIndex = 0;
let startStage = null;

function isMobile() {
	return window.innerWidth <= 800;
}

async function main() {
	const game = await loadGame(GAME_SLUG);
	window.__GAME_SLUG__ = game.slug;

	canvas.width = game.viewport.width;
	canvas.height = game.viewport.height;

	input = new Input(game.inputBindings);

	let currentPlayerName = game.playerCharacter;
	if (!game.characters[currentPlayerName]) throw new Error(`Missing player character: ${currentPlayerName}`);

	const enemyConfigs = { ...game.characters };

	startStage = async function (index) {
		const stageName = game.stageOrder[index];
		const loader = game.stageLoaders[stageName];
		if (!loader) throw new Error(`Missing stage: ${stageName}`);
		const stage = await loader();

		const world = loadStage({
			stage,
			playerConfig: game.characters[currentPlayerName],
			enemyConfigs,
			input,
			viewport: game.viewport,
			bounds: game.bounds,
			playerStart: game.playerStart,
		});

		world.stageName = stageName;
		if (game.camera) {
			if (typeof game.camera.bandLeft === 'number') world.camera.bandLeft = game.camera.bandLeft;
			if (typeof game.camera.bandRight === 'number') world.camera.bandRight = game.camera.bandRight;
		}

		world.onStageComplete = () => {
			if (world._transitioning) return;
			world._transitioning = true;
			stageIndex = (stageIndex + 1) % game.stageOrder.length;
			startStage(stageIndex);
		};
		world.onPlayerDead = () => {
			if (world._transitioning) return;
			world._transitioning = true;
			startStage(stageIndex);
		};

		const scene = {
			update: () => world.update(),
			draw: (ctx) => {
				world.draw(ctx);
				if (joystick) joystick.draw();
			},
		};

		if (!currentGame) {
			currentGame = new Game({ canvas, scene });
			currentGame.start();
		} else {
			currentGame.setScene(scene);
		}

		if (!tuningPanel) {
			tuningPanel = new TuningPanel({
				onResetStage: () => startStage(stageIndex),
				stages: game.stageOrder,
				onSelectStage: (index) => {
					stageIndex = index;
					startStage(index);
				},
				characters: Object.keys(game.characters),
				currentPlayer: currentPlayerName,
				onSelectPlayer: (name) => {
					if (!game.characters[name]) return;
					currentPlayerName = name;
					tuningPanel.currentPlayer = name;
					startStage(stageIndex);
				},
			});
		}
		tuningPanel.currentPlayer = currentPlayerName;
		tuningPanel.setWorld(world);
	};

	if (isMobile()) {
		joystick = new Joystick({ canvas, x: 120, y: 510, innerRadius: 20, outerRadius: 50, input });
	}

	startStage(stageIndex);
}

wireMenu({
	canvas,
	onStart: main,
	getGame: () => currentGame,
});
