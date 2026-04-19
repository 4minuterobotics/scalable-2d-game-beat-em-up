<script>
	import { navigate } from '../lib/router.js';
	import { cropAndRembg } from '../lib/api.js';

	let { slug } = $props();

	let img = $state(null);
	let crop = $state({ x: 0, y: 0, w: 0, h: 0 });
	let outputFilename = $state('');
	let status = $state('');
	let busy = $state(false);
	let resultPath = $state(null);
	let containerEl;
	let drag = null;

	function onFile(ev) {
		const file = ev.currentTarget.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const im = new Image();
			im.onload = () => {
				img = im;
				const side = Math.min(im.naturalWidth, im.naturalHeight);
				crop = {
					x: Math.round((im.naturalWidth - side) / 2),
					y: Math.round((im.naturalHeight - side) / 2),
					w: side,
					h: side,
				};
				if (!outputFilename) {
					const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_.-]/g, '_');
					outputFilename = `${base}.png`;
				}
			};
			im.src = reader.result;
		};
		reader.readAsDataURL(file);
	}

	function clamp(v, lo, hi) {
		return Math.max(lo, Math.min(hi, v));
	}

	function toImageCoords(ev) {
		const rect = containerEl.getBoundingClientRect();
		return {
			x: ((ev.clientX - rect.left) / rect.width) * img.naturalWidth,
			y: ((ev.clientY - rect.top) / rect.height) * img.naturalHeight,
			scaleX: img.naturalWidth / rect.width,
			scaleY: img.naturalHeight / rect.height,
		};
	}

	function startDrag(mode, ev) {
		ev.preventDefault();
		drag = {
			mode,
			startClientX: ev.clientX,
			startClientY: ev.clientY,
			origCrop: { ...crop },
		};
		window.addEventListener('mousemove', onDrag);
		window.addEventListener('mouseup', endDrag);
	}

	function onDrag(ev) {
		if (!drag || !img) return;
		const { scaleX, scaleY } = toImageCoords(ev);
		const dx = (ev.clientX - drag.startClientX) * scaleX;
		const dy = (ev.clientY - drag.startClientY) * scaleY;
		const o = drag.origCrop;
		if (drag.mode === 'move') {
			crop = {
				w: o.w,
				h: o.h,
				x: clamp(o.x + dx, 0, img.naturalWidth - o.w),
				y: clamp(o.y + dy, 0, img.naturalHeight - o.h),
			};
		} else if (drag.mode === 'resize-br') {
			crop = {
				x: o.x,
				y: o.y,
				w: clamp(o.w + dx, 10, img.naturalWidth - o.x),
				h: clamp(o.h + dy, 10, img.naturalHeight - o.y),
			};
		} else if (drag.mode === 'resize-tl') {
			const newX = clamp(o.x + dx, 0, o.x + o.w - 10);
			const newY = clamp(o.y + dy, 0, o.y + o.h - 10);
			crop = {
				x: newX,
				y: newY,
				w: o.x + o.w - newX,
				h: o.y + o.h - newY,
			};
		}
	}

	function endDrag() {
		drag = null;
		window.removeEventListener('mousemove', onDrag);
		window.removeEventListener('mouseup', endDrag);
	}

	async function process() {
		if (!img || !outputFilename) return;
		busy = true;
		resultPath = null;
		status = 'Cropping…';
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(crop.w);
		canvas.height = Math.round(crop.h);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(
			img,
			Math.round(crop.x),
			Math.round(crop.y),
			Math.round(crop.w),
			Math.round(crop.h),
			0,
			0,
			Math.round(crop.w),
			Math.round(crop.h)
		);
		const dataUri = canvas.toDataURL('image/png');
		status = 'Calling Replicate (rembg)… can take ~10s';
		try {
			const result = await cropAndRembg({ dataUri, outputFilename });
			status = `✓ Saved to ${result.path} (${result.bytes} bytes).`;
			resultPath = '/' + result.path + '?t=' + Date.now();
		} catch (err) {
			status = `Failed: ${err.message}`;
		} finally {
			busy = false;
		}
	}
</script>

<header class="header">
	<button onclick={() => navigate(`/${slug}`)}>← Back</button>
	<h2>Image cropper (background removal via Replicate)</h2>
</header>

<section class="upload">
	<label class="upload-label">
		<strong>Pick a photo</strong>
		<input type="file" accept="image/*" onchange={onFile} />
	</label>
</section>

{#if img}
	<section class="work">
		<div class="canvas-area" bind:this={containerEl} style:aspect-ratio="{img.naturalWidth} / {img.naturalHeight}">
			<img class="source" src={img.src} alt="" draggable="false" />
			<div
				class="crop-rect"
				style:left="{(crop.x / img.naturalWidth) * 100}%"
				style:top="{(crop.y / img.naturalHeight) * 100}%"
				style:width="{(crop.w / img.naturalWidth) * 100}%"
				style:height="{(crop.h / img.naturalHeight) * 100}%"
				onmousedown={(e) => startDrag('move', e)}
				aria-label="crop region (drag to move)"
				role="button"
				tabindex="0"
			>
				<button class="handle tl" aria-label="resize top-left" onmousedown={(e) => startDrag('resize-tl', e)}></button>
				<button class="handle br" aria-label="resize bottom-right" onmousedown={(e) => startDrag('resize-br', e)}></button>
			</div>
		</div>

		<aside class="controls">
			<div class="grid">
				<label>
					<span>x</span>
					<input type="number" step="1" min="0" bind:value={crop.x} />
				</label>
				<label>
					<span>y</span>
					<input type="number" step="1" min="0" bind:value={crop.y} />
				</label>
				<label>
					<span>w</span>
					<input type="number" step="1" min="10" bind:value={crop.w} />
				</label>
				<label>
					<span>h</span>
					<input type="number" step="1" min="10" bind:value={crop.h} />
				</label>
			</div>
			<label class="block">
				<span>output filename (in /img/)</span>
				<input type="text" bind:value={outputFilename} placeholder="e.g. will-crouch.png" />
			</label>
			<button onclick={process} disabled={busy || !outputFilename}>
				✂ Crop + remove background
			</button>
			<p class="status">{status}</p>
			<p class="note">
				Requires <code>REPLICATE_API_TOKEN</code> env var. Add it to <code>.env.local</code>. Each
				call costs pennies via Replicate.
			</p>
		</aside>
	</section>

	{#if resultPath}
		<section class="result">
			<h3>Result</h3>
			<img src={resultPath} alt="background removed" />
			<p><code>{resultPath.split('?')[0].slice(1)}</code></p>
		</section>
	{/if}
{/if}

<style>
	.header {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 16px;
	}
	.header h2 {
		margin: 0;
	}
	.upload {
		padding: 12px;
		border: 1px dashed var(--fg-dim);
		margin-bottom: 16px;
	}
	.upload-label {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.work {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 16px;
	}
	.canvas-area {
		position: relative;
		background: #000;
		border: 1px solid var(--fg-dim);
		user-select: none;
		max-height: 70vh;
		overflow: hidden;
	}
	.source {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
	}
	.crop-rect {
		position: absolute;
		border: 2px solid var(--fg);
		box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
		cursor: move;
		background: transparent;
		padding: 0;
		margin: 0;
	}
	.handle {
		position: absolute;
		width: 14px;
		height: 14px;
		background: var(--fg);
		border: 2px solid var(--bg);
		padding: 0;
		cursor: nwse-resize;
	}
	.handle.tl {
		top: -7px;
		left: -7px;
	}
	.handle.br {
		bottom: -7px;
		right: -7px;
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	label.block {
		width: 100%;
	}
	label span {
		font-size: 11px;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.status {
		min-height: 1.4em;
		opacity: 0.85;
		margin: 0;
	}
	.note {
		opacity: 0.6;
		font-size: 11px;
		margin: 0;
	}
	.result {
		margin-top: 20px;
		padding: 12px;
		border: 1px solid var(--fg-dim);
	}
	.result img {
		max-width: 100%;
		max-height: 60vh;
		background-color: #222;
		background-image: linear-gradient(45deg, #333 25%, transparent 25%),
			linear-gradient(-45deg, #333 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, #333 75%),
			linear-gradient(-45deg, transparent 75%, #333 75%);
		background-size: 20px 20px;
		background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
	}
</style>
