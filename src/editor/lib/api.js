async function postJson(url, body) {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`${res.status}: ${(await res.text()) || 'request failed'}`);
	return res.json();
}

export function saveCharacter(gameSlug, characterName, config) {
	return postJson('/_dev/save-character', { gameSlug, characterName, config });
}

export function saveStage(gameSlug, stageName, config) {
	return postJson('/_dev/save-stage', { gameSlug, stageName, config });
}

export function saveGame(gameSlug, config) {
	return postJson('/_dev/save-game', { gameSlug, config });
}

export function persistSoundTrim(gameSlug, soundName, trim) {
	return postJson('/_dev/sound-trims', { gameSlug, soundName, trim });
}

export async function uploadAsset(file, { kind = 'image', subdir = '' } = {}) {
	const res = await fetch('/_dev/upload-asset', {
		method: 'POST',
		headers: {
			'X-Filename': file.name,
			'X-Asset-Kind': kind,
			'X-Subdir': subdir,
			'Content-Type': 'application/octet-stream',
		},
		body: file,
	});
	if (!res.ok) throw new Error(`${res.status}: ${(await res.text()) || 'upload failed'}`);
	return res.json();
}

export async function cropAndRembg({ dataUri, outputFilename, subdir = '' }) {
	return postJson('/_dev/crop-and-rembg', { dataUri, outputFilename, subdir });
}
