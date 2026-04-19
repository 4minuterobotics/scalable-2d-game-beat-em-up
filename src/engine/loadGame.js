import { loadImage, loadSound } from './AssetLoader.js';
import { resolveAssetUrl } from './assetResolver.js';

const gameJsons = import.meta.glob('/src/data/games/**/*.json', {
	eager: true,
	import: 'default',
});

function getGameJson(slug, relativePath) {
	const key = `/src/data/games/${slug}/${relativePath}`;
	const json = gameJsons[key];
	if (!json) throw new Error(`Missing JSON: ${key}`);
	return json;
}

function listFilesIn(slug, folder) {
	const prefix = `/src/data/games/${slug}/${folder}/`;
	return Object.entries(gameJsons)
		.filter(([key]) => key.startsWith(prefix) && key.endsWith('.json'))
		.map(([key, json]) => ({ key, json, name: key.slice(prefix.length).replace(/\.json$/, '') }));
}

function buildSoundMap(soundsJson) {
	const map = {};
	for (const [name, cfg] of Object.entries(soundsJson)) {
		const url = resolveAssetUrl(cfg.fileUrl);
		map[name] = loadSound(url, cfg.trim);
	}
	return map;
}

async function loadImageByPath(path) {
	if (!path) return null;
	return loadImage(resolveAssetUrl(path));
}

async function hydrateAnimation(anim) {
	const out = { ...anim };
	if (anim.image) out.image = await loadImageByPath(anim.image);
	if (anim.mirroredImage) out.mirroredImage = await loadImageByPath(anim.mirroredImage);
	if (anim.attack?.hitSprite) {
		out.attack = {
			...anim.attack,
			hitSprite: {
				image: await loadImageByPath(anim.attack.hitSprite.image),
				mirroredImage: await loadImageByPath(anim.attack.hitSprite.mirroredImage),
			},
		};
	}
	return out;
}

async function hydrateCharacter(json, soundMap) {
	const animations = {};
	for (const [name, anim] of Object.entries(json.animations ?? {})) {
		animations[name] = await hydrateAnimation(anim);
	}
	const sounds = {};
	for (const [slot, soundName] of Object.entries(json.soundSlots ?? {})) {
		if (soundMap[soundName]) sounds[slot] = soundMap[soundName];
	}
	let sheet;
	if (json.sheet) {
		sheet = {
			image: await loadImageByPath(json.sheet.image),
			mirroredImage: await loadImageByPath(json.sheet.mirroredImage),
			columns: json.sheet.columns,
			rows: json.sheet.rows,
			frameWidth: json.sheet.frameWidth,
			frameHeight: json.sheet.frameHeight,
			pixelWidth: json.sheet.pixelWidth ?? json.sheet.columns * json.sheet.frameWidth,
			pixelHeight: json.sheet.pixelHeight ?? json.sheet.rows * json.sheet.frameHeight,
		};
	}
	return {
		name: json.name,
		kind: json.kind,
		frameWidth: json.frameWidth,
		frameHeight: json.frameHeight,
		frameOffsetX: json.frameOffsetX ?? 0,
		draw: json.draw,
		speed: json.speed,
		health: json.health,
		spriteCenterOffset: json.spriteCenterOffset ?? 0,
		startDirection: json.startDirection ?? 'right',
		startAnimation: json.startAnimation ?? 'idle',
		animations,
		inputActions: json.inputActions ?? {},
		ai: json.ai,
		sounds,
		sheet,
	};
}

async function hydrateStage(json) {
	const layers = [];
	for (const layerCfg of json.layers ?? []) {
		const items = [];
		for (const itemCfg of layerCfg.items ?? []) {
			const image = await loadImageByPath(itemCfg.image);
			if (!image) continue;
			const width = itemCfg.width ?? (itemCfg.widthScale ? image.width * itemCfg.widthScale : image.width);
			const height = itemCfg.height ?? (itemCfg.heightScale ? image.height * itemCfg.heightScale : image.height);
			const x = itemCfg.x ?? (itemCfg.xScale ? image.width * itemCfg.xScale : 0);
			const spacing =
				itemCfg.spacing ?? (itemCfg.spacingScale ? image.width * itemCfg.spacingScale : 0);
			items.push({ image, x, y: itemCfg.y ?? 0, width, height, count: itemCfg.count ?? 1, spacing });
		}
		layers.push({
			id: layerCfg.id,
			parallax: layerCfg.parallax ?? 1,
			drawOrder: layerCfg.drawOrder ?? 0,
			depth: layerCfg.depth ?? 'background',
			items,
		});
	}
	layers.sort((a, b) => a.drawOrder - b.drawOrder);
	const lengthTiles = json.lengthTiles ?? 30;
	const tileWidth = json.tileWidth ?? 1200;
	const ending = {
		type: json.ending?.type ?? 'music',
		tileCount: json.ending?.tileCount ?? 0,
		durationMs: json.ending?.durationMs ?? 0,
		music: json.ending?.music ?? null,
		boss: json.ending?.boss ?? null,
		cutscene: json.ending?.cutscene ?? null,
	};
	return {
		name: json.name,
		lengthTiles,
		tileWidth,
		length: lengthTiles * tileWidth,
		ending,
		layers,
		enemies: json.enemies ?? [],
	};
}

export default async function loadGame(slug) {
	const game = getGameJson(slug, 'game.json');
	const soundsJson = getGameJson(slug, 'sounds.json');
	const soundMap = buildSoundMap(soundsJson);

	const characters = {};
	for (const { json } of listFilesIn(slug, 'characters')) {
		const hydrated = await hydrateCharacter(json, soundMap);
		characters[hydrated.name] = hydrated;
	}

	const stageLoaders = {};
	const stageCache = {};
	for (const { json, name } of listFilesIn(slug, 'stages')) {
		stageLoaders[name] = async () => {
			if (!stageCache[name]) stageCache[name] = await hydrateStage(json);
			return stageCache[name];
		};
	}

	return {
		slug: game.slug,
		title: game.title,
		viewport: game.viewport,
		bounds: game.bounds,
		camera: game.camera,
		playerStart: game.playerStart,
		playerCharacter: game.playerCharacter,
		inputBindings: game.inputBindings ?? {},
		stageOrder: game.stageOrder ?? [],
		characters,
		stageLoaders,
		soundMap,
	};
}
