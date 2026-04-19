import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Replicate from 'replicate';

const REMBG_MODEL = 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const SOUND_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const ENTITY_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const UPLOAD_FILENAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(png|jpg|jpeg|webp|gif|mp3|wav|ogg)$/i;
const UPLOAD_KIND_DIRS = {
	image: 'img',
	sound: 'sounds',
};
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

async function readJson(req) {
	const chunks = [];
	for await (const chunk of req) chunks.push(chunk);
	return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function writeEntityJson(server, gameSlug, folder, name, config) {
	const path = resolve(server.config.root, 'src/data/games', gameSlug, folder, `${name}.json`);
	await writeFile(path, JSON.stringify(config, null, 2) + '\n');
	return path;
}

function devEditorEndpoints() {
	return {
		name: 'dev-editor-endpoints',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use('/_dev/save-character', async (req, res) => {
				try {
					if (req.method !== 'POST') {
						res.statusCode = 405;
						res.end();
						return;
					}
					const { gameSlug, characterName, config } = await readJson(req);
					if (!SLUG_RE.test(gameSlug || '')) {
						res.statusCode = 400;
						res.end('Invalid gameSlug');
						return;
					}
					if (!ENTITY_NAME_RE.test(characterName || '')) {
						res.statusCode = 400;
						res.end('Invalid characterName');
						return;
					}
					if (!config || typeof config !== 'object') {
						res.statusCode = 400;
						res.end('Invalid config');
						return;
					}
					await writeEntityJson(server, gameSlug, 'characters', characterName, config);
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ ok: true }));
				} catch (err) {
					res.statusCode = 500;
					res.end(String(err?.message || err));
				}
			});

			server.middlewares.use('/_dev/save-stage', async (req, res) => {
				try {
					if (req.method !== 'POST') {
						res.statusCode = 405;
						res.end();
						return;
					}
					const { gameSlug, stageName, config } = await readJson(req);
					if (!SLUG_RE.test(gameSlug || '')) {
						res.statusCode = 400;
						res.end('Invalid gameSlug');
						return;
					}
					if (!ENTITY_NAME_RE.test(stageName || '')) {
						res.statusCode = 400;
						res.end('Invalid stageName');
						return;
					}
					if (!config || typeof config !== 'object') {
						res.statusCode = 400;
						res.end('Invalid config');
						return;
					}
					await writeEntityJson(server, gameSlug, 'stages', stageName, config);
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ ok: true }));
				} catch (err) {
					res.statusCode = 500;
					res.end(String(err?.message || err));
				}
			});

			server.middlewares.use('/_dev/upload-asset', async (req, res) => {
				try {
					if (req.method !== 'POST') {
						res.statusCode = 405;
						res.end();
						return;
					}
					const filename = req.headers['x-filename'];
					const kind = req.headers['x-asset-kind'] ?? 'image';
					const subdirName = req.headers['x-subdir'] ?? '';
					if (typeof filename !== 'string' || !UPLOAD_FILENAME_RE.test(filename)) {
						res.statusCode = 400;
						res.end('Invalid X-Filename');
						return;
					}
					const kindDir = UPLOAD_KIND_DIRS[kind];
					if (!kindDir) {
						res.statusCode = 400;
						res.end('Invalid X-Asset-Kind');
						return;
					}
					if (typeof subdirName !== 'string' || /\.\.|[\\/]{2}/.test(subdirName) || (subdirName && !/^[a-z0-9][a-z0-9/_-]*$/i.test(subdirName))) {
						res.statusCode = 400;
						res.end('Invalid X-Subdir');
						return;
					}
					const chunks = [];
					let total = 0;
					for await (const chunk of req) {
						total += chunk.length;
						if (total > MAX_UPLOAD_BYTES) {
							res.statusCode = 413;
							res.end('Upload exceeds size limit');
							return;
						}
						chunks.push(chunk);
					}
					const relative = subdirName ? `${kindDir}/${subdirName}/${filename}` : `${kindDir}/${filename}`;
					const target = resolve(server.config.root, relative);
					await mkdir(dirname(target), { recursive: true });
					await writeFile(target, Buffer.concat(chunks));
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ ok: true, path: relative, bytes: total }));
				} catch (err) {
					res.statusCode = 500;
					res.end(String(err?.message || err));
				}
			});

			server.middlewares.use('/_dev/crop-and-rembg', async (req, res) => {
				try {
					if (req.method !== 'POST') {
						res.statusCode = 405;
						res.end();
						return;
					}
					const token = process.env.REPLICATE_API_TOKEN;
					if (!token) {
						res.statusCode = 500;
						res.end('REPLICATE_API_TOKEN env var not set. Add it to a .env.local file in the project root.');
						return;
					}
					const { dataUri, outputFilename, subdir = '' } = await readJson(req);
					if (typeof dataUri !== 'string' || !dataUri.startsWith('data:image/')) {
						res.statusCode = 400;
						res.end('dataUri must be a data:image/... URL');
						return;
					}
					if (typeof outputFilename !== 'string' || !UPLOAD_FILENAME_RE.test(outputFilename)) {
						res.statusCode = 400;
						res.end('Invalid outputFilename');
						return;
					}
					if (typeof subdir !== 'string' || /\.\.|[\\/]{2}/.test(subdir) || (subdir && !/^[a-z0-9][a-z0-9/_-]*$/i.test(subdir))) {
						res.statusCode = 400;
						res.end('Invalid subdir');
						return;
					}

					const replicate = new Replicate({ auth: token });
					const output = await replicate.run(REMBG_MODEL, { input: { image: dataUri } });
					const resultUrl = typeof output === 'string' ? output : Array.isArray(output) ? output[0] : output?.url;
					if (!resultUrl) {
						res.statusCode = 502;
						res.end('Replicate returned no URL');
						return;
					}
					const imgRes = await fetch(resultUrl);
					if (!imgRes.ok) {
						res.statusCode = 502;
						res.end(`Failed to fetch Replicate result: ${imgRes.status}`);
						return;
					}
					const buffer = Buffer.from(await imgRes.arrayBuffer());
					const relative = subdir ? `img/${subdir}/${outputFilename}` : `img/${outputFilename}`;
					const target = resolve(server.config.root, relative);
					await mkdir(dirname(target), { recursive: true });
					await writeFile(target, buffer);
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ ok: true, path: relative, bytes: buffer.length }));
				} catch (err) {
					res.statusCode = 500;
					res.end(String(err?.message || err));
				}
			});

			server.middlewares.use('/_dev/save-game', async (req, res) => {
				try {
					if (req.method !== 'POST') {
						res.statusCode = 405;
						res.end();
						return;
					}
					const { gameSlug, config } = await readJson(req);
					if (!SLUG_RE.test(gameSlug || '')) {
						res.statusCode = 400;
						res.end('Invalid gameSlug');
						return;
					}
					if (!config || typeof config !== 'object') {
						res.statusCode = 400;
						res.end('Invalid config');
						return;
					}
					const path = resolve(server.config.root, 'src/data/games', gameSlug, 'game.json');
					await writeFile(path, JSON.stringify(config, null, 2) + '\n');
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ ok: true }));
				} catch (err) {
					res.statusCode = 500;
					res.end(String(err?.message || err));
				}
			});
		},
	};
}

function devSoundTrims() {
	return {
		name: 'dev-sound-trims',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use('/_dev/sound-trims', async (req, res) => {
				try {
					if (req.method !== 'POST') {
						res.statusCode = 405;
						res.end('Method not allowed');
						return;
					}
					const body = await readJson(req);
					const { gameSlug, soundName, trim } = body;
					if (!SLUG_RE.test(gameSlug || '')) {
						res.statusCode = 400;
						res.end('Invalid gameSlug');
						return;
					}
					if (!SOUND_NAME_RE.test(soundName || '')) {
						res.statusCode = 400;
						res.end('Invalid soundName');
						return;
					}
					if (trim !== null && trim !== undefined) {
						if (typeof trim !== 'object' || typeof trim.startMs !== 'number') {
							res.statusCode = 400;
							res.end('Invalid trim');
							return;
						}
					}

					const soundsPath = resolve(server.config.root, 'src/data/games', gameSlug, 'sounds.json');
					let sounds;
					try {
						sounds = JSON.parse(await readFile(soundsPath, 'utf8'));
					} catch (err) {
						res.statusCode = 404;
						res.end(`Could not read ${soundsPath}: ${err.message}`);
						return;
					}
					if (!sounds[soundName]) {
						res.statusCode = 404;
						res.end(`Sound "${soundName}" not in sounds.json`);
						return;
					}

					if (trim === null || trim === undefined) {
						delete sounds[soundName].trim;
					} else {
						sounds[soundName].trim = {
							startMs: Math.round(trim.startMs),
							...(typeof trim.endMs === 'number' ? { endMs: Math.round(trim.endMs) } : {}),
						};
					}

					await writeFile(soundsPath, JSON.stringify(sounds, null, 2) + '\n');
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({ ok: true, sound: sounds[soundName] }));
				} catch (err) {
					res.statusCode = 500;
					res.end(String(err?.message || err));
				}
			});
		},
	};
}

export default defineConfig({
	plugins: [svelte(), devEditorEndpoints(), devSoundTrims()],
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				editor: resolve(__dirname, 'editor.html'),
			},
		},
	},
});
