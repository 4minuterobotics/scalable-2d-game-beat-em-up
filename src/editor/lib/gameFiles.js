const gameJsons = import.meta.glob('/src/data/games/**/*.json', {
	eager: true,
	import: 'default',
});

export function listGames() {
	const slugs = new Set();
	for (const key of Object.keys(gameJsons)) {
		const m = key.match(/^\/src\/data\/games\/([^/]+)\/game\.json$/);
		if (m) slugs.add(m[1]);
	}
	return [...slugs].map((slug) => ({
		slug,
		game: gameJsons[`/src/data/games/${slug}/game.json`],
	}));
}

export function loadGameData(slug) {
	const base = `/src/data/games/${slug}`;
	const game = gameJsons[`${base}/game.json`];
	if (!game) return null;
	const sounds = gameJsons[`${base}/sounds.json`] ?? {};

	const characters = {};
	for (const [key, json] of Object.entries(gameJsons)) {
		const m = key.match(new RegExp(`^${base}/characters/([^/]+)\\.json$`));
		if (m) characters[m[1]] = json;
	}

	const stages = {};
	for (const [key, json] of Object.entries(gameJsons)) {
		const m = key.match(new RegExp(`^${base}/stages/([^/]+)\\.json$`));
		if (m) stages[m[1]] = json;
	}

	return { slug, game, sounds, characters, stages };
}
