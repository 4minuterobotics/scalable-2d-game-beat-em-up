import { Howl } from 'howler';

const MODAL_STYLE = `
	position: fixed; inset: 0;
	background: rgba(0, 0, 0, 0.7);
	z-index: 10000;
	display: flex; align-items: center; justify-content: center;
`;

const PANEL_STYLE = `
	background: rgba(10, 15, 11, 0.98); color: #4dff4d;
	border: 2px solid #4dff4d; padding: 16px;
	font-family: monospace; font-size: 12px;
	width: 560px; max-width: 90vw;
	display: flex; flex-direction: column; gap: 10px;
`;

const BTN_STYLE = 'background:#1a1f1b; color:#4dff4d; border:1px solid #4dff4d; padding:6px 12px; cursor:pointer; font-family:monospace;';

const WAVEFORM_WIDTH = 528;
const WAVEFORM_HEIGHT = 100;

const AudioCtxClass = typeof AudioContext !== 'undefined' ? AudioContext : typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : null;
const audioCtx = AudioCtxClass ? new AudioCtxClass() : null;
const bufferCache = new Map();

async function decodeUrl(url) {
	if (!audioCtx) throw new Error('Web Audio API unavailable');
	if (audioCtx.state === 'suspended') {
		try {
			await audioCtx.resume();
		} catch {}
	}
	if (bufferCache.has(url)) return bufferCache.get(url);
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Fetch ${url} returned ${res.status}`);
	const arr = await res.arrayBuffer();
	if (arr.byteLength === 0) throw new Error(`Fetched ${url} was empty`);
	const buf = await new Promise((resolve, reject) => {
		audioCtx.decodeAudioData(arr.slice(0), resolve, (err) =>
			reject(new Error(err?.message || `decodeAudioData failed on ${url} (${arr.byteLength} bytes, content-type: ${res.headers.get('content-type')})`))
		);
	});
	bufferCache.set(url, buf);
	return buf;
}

function drawWaveform(ctx, buffer, startSec, endSec) {
	const w = WAVEFORM_WIDTH;
	const h = WAVEFORM_HEIGHT;
	ctx.fillStyle = '#05100a';
	ctx.fillRect(0, 0, w, h);

	const data = buffer.getChannelData(0);
	const step = Math.ceil(data.length / w);
	const amp = h / 2;
	ctx.strokeStyle = '#2a4d2a';
	ctx.beginPath();
	for (let i = 0; i < w; i++) {
		let min = 1;
		let max = -1;
		const base = i * step;
		for (let j = 0; j < step && base + j < data.length; j++) {
			const s = data[base + j];
			if (s < min) min = s;
			if (s > max) max = s;
		}
		ctx.moveTo(i + 0.5, (1 + min) * amp);
		ctx.lineTo(i + 0.5, (1 + max) * amp);
	}
	ctx.stroke();

	const duration = buffer.duration;
	const startX = (startSec / duration) * w;
	const endX = (endSec / duration) * w;
	ctx.fillStyle = 'rgba(77, 255, 77, 0.15)';
	ctx.fillRect(startX, 0, endX - startX, h);
	ctx.strokeStyle = '#4dff4d';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(startX, 0);
	ctx.lineTo(startX, h);
	ctx.moveTo(endX, 0);
	ctx.lineTo(endX, h);
	ctx.stroke();
}

async function persistTrim(soundName, trim) {
	const gameSlug = window.__GAME_SLUG__;
	if (!gameSlug) throw new Error('window.__GAME_SLUG__ not set');
	const res = await fetch('/_dev/sound-trims', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ gameSlug, soundName, trim }),
	});
	if (!res.ok) throw new Error(`${res.status}: ${(await res.text()) || 'unknown error'}`);
	return res.json();
}

function audioBufferSliceToWav(buffer, startSec, endSec) {
	const sampleRate = buffer.sampleRate;
	const startSample = Math.max(0, Math.floor(startSec * sampleRate));
	const endSample = Math.min(buffer.length, Math.floor(endSec * sampleRate));
	const length = Math.max(0, endSample - startSample);
	const numChannels = buffer.numberOfChannels;
	const bytesPerSample = 2;
	const dataSize = length * numChannels * bytesPerSample;
	const arrayBuffer = new ArrayBuffer(44 + dataSize);
	const view = new DataView(arrayBuffer);
	const writeString = (offset, str) => {
		for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
	};
	writeString(0, 'RIFF');
	view.setUint32(4, 36 + dataSize, true);
	writeString(8, 'WAVE');
	writeString(12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, numChannels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
	view.setUint16(32, numChannels * bytesPerSample, true);
	view.setUint16(34, 16, true);
	writeString(36, 'data');
	view.setUint32(40, dataSize, true);

	let offset = 44;
	const channels = [];
	for (let ch = 0; ch < numChannels; ch++) channels.push(buffer.getChannelData(ch));
	for (let i = 0; i < length; i++) {
		for (let ch = 0; ch < numChannels; ch++) {
			const s = Math.max(-1, Math.min(1, channels[ch][startSample + i]));
			view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
			offset += 2;
		}
	}
	return arrayBuffer;
}

function downloadBuffer(arrayBuffer, filename) {
	const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function makeTrimmedHowl(url, volume, startSec, endSec) {
	const startMs = Math.round(startSec * 1000);
	const durationMs = Math.max(10, Math.round((endSec - startSec) * 1000));
	const trimmed = new Howl({
		src: [url],
		volume,
		sprite: { trim: [startMs, durationMs] },
	});
	const origPlay = trimmed.play.bind(trimmed);
	trimmed.play = (arg) => {
		if (arg === undefined || typeof arg === 'object') return origPlay('trim');
		return origPlay(arg);
	};
	trimmed._trim = { startSec, endSec };
	trimmed._sourceUrl = url;
	return trimmed;
}

export function getSourceUrl(howl) {
	return howl._sourceUrl ?? howl._src?.[0] ?? null;
}

export function getTrim(howl) {
	return howl._trim ?? null;
}

export default function openAudioTrimmer({ howl, name, onApply }) {
	const url = getSourceUrl(howl);
	if (!url) {
		console.warn('No source URL found for howl', name);
		return;
	}

	const modal = document.createElement('div');
	modal.style.cssText = MODAL_STYLE;
	const panel = document.createElement('div');
	panel.style.cssText = PANEL_STYLE;
	modal.appendChild(panel);

	const close = () => modal.remove();
	modal.addEventListener('click', (e) => {
		if (e.target === modal) close();
	});

	const header = document.createElement('div');
	header.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
	const title = document.createElement('div');
	title.style.cssText = 'font-weight:bold; font-size:14px;';
	title.textContent = `Trim: ${name}`;
	const closeBtn = document.createElement('button');
	closeBtn.textContent = '×';
	closeBtn.style.cssText = BTN_STYLE + 'font-size:16px; padding:0 8px;';
	closeBtn.addEventListener('click', close);
	header.appendChild(title);
	header.appendChild(closeBtn);
	panel.appendChild(header);

	const canvas = document.createElement('canvas');
	canvas.width = WAVEFORM_WIDTH;
	canvas.height = WAVEFORM_HEIGHT;
	canvas.style.cssText = 'display:block; width:100%; cursor:ew-resize;';
	panel.appendChild(canvas);

	const status = document.createElement('div');
	status.textContent = 'Decoding audio…';
	panel.appendChild(status);

	const controls = document.createElement('div');
	controls.style.cssText = 'display:grid; grid-template-columns:1fr 1fr; gap:8px;';
	panel.appendChild(controls);

	const mkNumber = (label, get, set) => {
		const wrap = document.createElement('label');
		wrap.style.cssText = 'display:flex; gap:6px; align-items:center;';
		const span = document.createElement('span');
		span.style.cssText = 'width:60px;';
		span.textContent = label;
		const input = document.createElement('input');
		input.type = 'number';
		input.step = '0.01';
		input.min = '0';
		input.value = String(get().toFixed(3));
		input.style.cssText = 'flex:1; background:#05100a; color:#4dff4d; border:1px solid #4dff4d; padding:4px;';
		input.addEventListener('change', () => {
			const v = parseFloat(input.value);
			if (!Number.isNaN(v)) set(v);
		});
		wrap.appendChild(span);
		wrap.appendChild(input);
		return { row: wrap, input };
	};

	const buttonRow = document.createElement('div');
	buttonRow.style.cssText = 'display:flex; gap:8px; flex-wrap:wrap;';
	panel.appendChild(buttonRow);

	const mkButton = (label, handler) => {
		const b = document.createElement('button');
		b.textContent = label;
		b.style.cssText = BTN_STYLE;
		b.addEventListener('click', handler);
		return b;
	};

	let buffer = null;
	let startSec = 0;
	let endSec = 0;
	let startInput, endInput;
	let previewSource = null;

	const redraw = () => {
		if (!buffer) return;
		const ctx = canvas.getContext('2d');
		drawWaveform(ctx, buffer, startSec, endSec);
		if (startInput) startInput.value = startSec.toFixed(3);
		if (endInput) endInput.value = endSec.toFixed(3);
	};

	const stopPreview = () => {
		if (previewSource) {
			try {
				previewSource.stop();
			} catch {}
			previewSource = null;
		}
	};

	const playPreview = () => {
		stopPreview();
		if (!buffer) return;
		const src = audioCtx.createBufferSource();
		src.buffer = buffer;
		src.connect(audioCtx.destination);
		previewSource = src;
		src.start(0, startSec, endSec - startSec);
		src.onended = () => {
			if (previewSource === src) previewSource = null;
		};
	};

	decodeUrl(url)
		.then((buf) => {
			buffer = buf;
			const existing = getTrim(howl);
			startSec = existing ? existing.startSec : 0;
			endSec = existing ? existing.endSec : buf.duration;

			const s = mkNumber('start (s)', () => startSec, (v) => {
				startSec = Math.max(0, Math.min(v, endSec - 0.01));
				redraw();
			});
			startInput = s.input;
			const e = mkNumber('end (s)', () => endSec, (v) => {
				endSec = Math.max(startSec + 0.01, Math.min(v, buf.duration));
				redraw();
			});
			endInput = e.input;
			controls.appendChild(s.row);
			controls.appendChild(e.row);

			const dragMode = { active: null };
			const toSec = (x) => (Math.max(0, Math.min(WAVEFORM_WIDTH, x)) / WAVEFORM_WIDTH) * buf.duration;
			canvas.addEventListener('mousedown', (ev) => {
				const rect = canvas.getBoundingClientRect();
				const x = ((ev.clientX - rect.left) / rect.width) * WAVEFORM_WIDTH;
				const startX = (startSec / buf.duration) * WAVEFORM_WIDTH;
				const endX = (endSec / buf.duration) * WAVEFORM_WIDTH;
				dragMode.active = Math.abs(x - startX) < Math.abs(x - endX) ? 'start' : 'end';
				handleDrag(ev);
			});
			const handleDrag = (ev) => {
				if (!dragMode.active) return;
				const rect = canvas.getBoundingClientRect();
				const x = ((ev.clientX - rect.left) / rect.width) * WAVEFORM_WIDTH;
				const sec = toSec(x);
				if (dragMode.active === 'start') startSec = Math.min(sec, endSec - 0.01);
				else endSec = Math.max(sec, startSec + 0.01);
				redraw();
			};
			window.addEventListener('mousemove', handleDrag);
			window.addEventListener('mouseup', () => (dragMode.active = null));

			buttonRow.appendChild(mkButton('▶ Preview trim', playPreview));
			buttonRow.appendChild(mkButton('■ Stop', stopPreview));
			buttonRow.appendChild(
				mkButton('↺ Reset', () => {
					startSec = 0;
					endSec = buf.duration;
					redraw();
				})
			);
			buttonRow.appendChild(
				mkButton('✓ Save trim', async (ev) => {
					const btn = ev.currentTarget;
					btn.disabled = true;
					const label = btn.textContent;
					try {
						status.textContent = 'Saving trim…';
						await persistTrim(name, { startMs: Math.round(startSec * 1000), endMs: Math.round(endSec * 1000) });
						const newHowl = makeTrimmedHowl(url, howl.volume(), startSec, endSec);
						onApply?.(newHowl);
						status.textContent = '✓ Trim saved. Original file unchanged.';
						setTimeout(close, 600);
					} catch (err) {
						status.textContent = `Save failed: ${err.message}`;
						btn.disabled = false;
						btn.textContent = label;
					}
				})
			);
			buttonRow.appendChild(
				mkButton('⟲ Restore original', async (ev) => {
					const btn = ev.currentTarget;
					btn.disabled = true;
					const label = btn.textContent;
					try {
						status.textContent = 'Removing trim…';
						await persistTrim(name, null);
						const fresh = new Howl({ src: [url], volume: howl.volume() });
						fresh._sourceUrl = url;
						onApply?.(fresh);
						status.textContent = '✓ Restored to full original.';
						setTimeout(close, 600);
					} catch (err) {
						status.textContent = `Restore failed: ${err.message}`;
						btn.disabled = false;
						btn.textContent = label;
					}
				})
			);
			buttonRow.appendChild(
				mkButton('⬇ Export WAV', () => {
					const wav = audioBufferSliceToWav(buf, startSec, endSec);
					const base = name.replace(/[^a-z0-9-_]/gi, '_');
					downloadBuffer(wav, `${base}-trimmed.wav`);
				})
			);

			status.textContent = `Duration: ${buf.duration.toFixed(3)}s — drag markers or edit values`;
			redraw();
		})
		.catch((err) => {
			status.textContent = `Failed to decode audio: ${err.message}`;
		});

	document.body.appendChild(modal);
}
