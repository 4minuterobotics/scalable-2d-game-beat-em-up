import Layer from '../engine/Layer.js';
import World from './World.js';
import Character from '../characters/Character.js';
import PlayerController from '../controllers/PlayerController.js';
import AIController from '../controllers/AIController.js';

function expandItems(items) {
	const out = [];
	for (const item of items) {
		const count = item.count ?? 1;
		const spacing = item.spacing ?? 0;
		for (let i = 0; i < count; i++) {
			out.push({
				image: item.image,
				x: item.x + spacing * i,
				y: item.y,
				width: item.width,
				height: item.height,
			});
		}
	}
	return out;
}

function buildLayers(stage) {
	const bg = [];
	const fg = [];
	for (const layerCfg of stage.layers) {
		const layer = new Layer({
			id: layerCfg.id,
			parallax: layerCfg.parallax,
			items: expandItems(layerCfg.items ?? []),
		});
		if (layerCfg.depth === 'foreground') fg.push(layer);
		else bg.push(layer);
	}
	return { bg, fg };
}

function spawnEnemies(world, stage, enemyConfigs) {
	for (const wave of stage.enemies ?? []) {
		const cfg = enemyConfigs[wave.character ?? wave.type];
		if (!cfg) continue;
		const count = wave.count ?? 1;
		let speed = wave.speed ?? cfg.speed;
		for (let i = 0; i < count; i++) {
			const x = wave.x + (wave.xJitter ? Math.random() * wave.xJitter : 0) + i * (wave.spacing ?? 0);
			const yMin = wave.yMin ?? wave.y;
			const yMax = wave.yMax ?? wave.y;
			const y = yMin + Math.random() * (yMax - yMin);
			const charConfig = {
				...cfg,
				speed,
				health: wave.health ?? cfg.health,
			};
			const enemy = new Character(charConfig, x, y);
			enemy.direction = 'left';
			const ai = new AIController(enemy, world, cfg.ai ?? {});
			world.addEnemy(enemy, ai);
			speed += 0.25;
		}
	}
}

export default function loadStage({ stage, playerConfig, enemyConfigs, input, viewport, bounds, playerStart }) {
	const { bg, fg } = buildLayers(stage);
	const world = new World({
		viewportWidth: viewport.width,
		viewportHeight: viewport.height,
		stageLength: stage.length,
		bgLayers: bg,
		fgLayers: fg,
		bounds,
	});

	const player = new Character(playerConfig, playerStart.x, playerStart.y);
	const playerController = new PlayerController(player, input);
	world.setPlayer(player, playerController);

	spawnEnemies(world, stage, enemyConfigs);

	return world;
}
