import { Howl } from 'howler';

export function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

export async function loadImageMap(map) {
	const entries = await Promise.all(
		Object.entries(map).map(async ([key, src]) => {
			if (src == null) return [key, null];
			if (typeof src === 'string') return [key, await loadImage(src)];
			if (typeof src === 'object') return [key, await loadImageMap(src)];
			return [key, src];
		})
	);
	return Object.fromEntries(entries);
}

export function loadSound(src, trim) {
	if (trim && typeof trim.startMs === 'number') {
		const startMs = Math.max(0, Math.round(trim.startMs));
		const durationMs =
			typeof trim.endMs === 'number' ? Math.max(1, Math.round(trim.endMs - startMs)) : 600000;
		const howl = new Howl({ src: [src], sprite: { trim: [startMs, durationMs] } });
		const origPlay = howl.play.bind(howl);
		howl.play = (arg) => {
			if (arg === undefined || typeof arg === 'object') return origPlay('trim');
			return origPlay(arg);
		};
		howl._trim = { startSec: startMs / 1000, endSec: (startMs + durationMs) / 1000 };
		howl._sourceUrl = src;
		return howl;
	}
	const howl = new Howl({ src: [src] });
	howl._sourceUrl = src;
	return howl;
}

function basenameOf(url) {
	return url.split('/').pop().split('?')[0];
}

export function loadSoundMap(map, trims = {}) {
	const out = {};
	for (const [key, src] of Object.entries(map)) {
		out[key] = loadSound(src, trims[basenameOf(src)]);
	}
	return out;
}
