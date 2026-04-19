const imageModules = import.meta.glob('/img/**/*.{png,jpg,jpeg,webp,gif}', {
	eager: true,
	query: '?url',
	import: 'default',
});
const soundModules = import.meta.glob('/sounds/**/*.{mp3,wav,ogg}', {
	eager: true,
	query: '?url',
	import: 'default',
});

const lookup = { ...imageModules, ...soundModules };

function normalize(path) {
	if (!path) return null;
	return path.startsWith('/') ? path : '/' + path;
}

export function resolveAssetUrl(path) {
	const key = normalize(path);
	if (!key) return null;
	const url = lookup[key];
	if (!url) console.warn(`[assetResolver] no bundled URL for "${key}"`);
	return url ?? key;
}
